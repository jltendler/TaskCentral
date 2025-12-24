import { ref, onMounted, computed, watch, unref } from 'vue';
import { todoListService, todoItemService } from '../services/api';
import { useItemCache } from './useItemCache';
import { useItemEventBus } from './useItemEventBus';

export function useTodoItems(listIdSource) {
    const listId = computed(() => {
        const val = unref(listIdSource);
        return typeof val === 'function' ? val() : val;
    });
    const {
        invalidateAllCaches,
        updateItemInCaches,
        removeItemFromCaches,
        addItemToCaches
    } = useItemCache();
    const { updatedItemEvent } = useItemEventBus();
    const list = ref(null);
    const items = ref([]);
    const loading = ref(true);
    const newItem = ref({ title: '', description: '', isPriority: false });

    const sortedItems = computed(() => {
        return [...items.value].sort((a, b) => {
            if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
            if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    });

    const fetchData = async () => {
        if (!listId.value) return;
        loading.value = true;
        try {
            const listRes = await todoListService.getList(listId.value);
            list.value = listRes.data;
            items.value = list.value.items || [];
        } catch (error) {
            console.error('Error fetching list items:', error);
        } finally {
            loading.value = false;
        }
    };

    const addItem = async () => {
        if (!newItem.value.title) return;
        try {
            await todoItemService.createItem(listId.value, newItem.value);
            newItem.value = { title: '', description: '', isPriority: false };
            await fetchData();
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const toggleItem = async (item) => {
        try {
            await todoItemService.updateItem(listId.value, item.id, {
                ...item,
                isCompleted: !item.isCompleted
            });
            await fetchData();
        } catch (error) {
            console.error('Error toggling item:', error);
        }
    };

    const togglePriority = async (item) => {
        try {
            const newPriorityStatus = !item.isPriority;
            await todoItemService.updateItem(listId.value, item.id, {
                ...item,
                isPriority: newPriorityStatus
            });

            // Update priority cache immediately with full item data including todoList
            if (newPriorityStatus) {
                // Need to get the list name from current data
                const fullItem = {
                    ...item,
                    isPriority: true,
                    todoList: list.value // Include the parent list
                };
                addItemToCaches(fullItem);
            } else {
                // We update the item in caches to reflect the priority change
                // updateItemInCaches handles removing it from priority cache if isPriority becomes false
                updateItemInCaches(item.id, { isPriority: false });
            }

            // Invalidate caches to be safe
            invalidateAllCaches();

            await fetchData();
        } catch (error) {
            console.error('Error toggling priority:', error);
        }
    };

    const checkAll = async () => {
        try {
            await todoItemService.completeAll(listId.value);
            await fetchData();
        } catch (error) {
            console.error('Error checking all items:', error);
        }
    };

    const uncheckAll = async () => {
        try {
            await todoItemService.uncompleteAll(listId.value);
            await fetchData();
        } catch (error) {
            console.error('Error unchecking all items:', error);
        }
    };

    const deleteItem = async (itemId) => {
        try {
            await todoItemService.deleteItem(listId.value, itemId);
            await fetchData();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    onMounted(fetchData);

    // Watch for listId changes (e.g. route navigation between lists)
    watch(listId, () => {
        fetchData();
    });

    const moveItem = async (item, direction) => {
        if (!items.value) return;
        const currentOrder = [...sortedItems.value];
        const oldIndex = currentOrder.findIndex(i => i.id === item.id);

        if (oldIndex === -1) return;

        const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;
        if (newIndex < 0 || newIndex >= currentOrder.length) return;
        const itemToMove = currentOrder[oldIndex];
        currentOrder.splice(oldIndex, 1);
        currentOrder.splice(newIndex, 0, itemToMove);

        const updates = [];

        currentOrder.forEach((itm, index) => {
            if (itm.sortOrder !== index) {
                const rawItem = items.value.find(i => i.id === itm.id);
                if (rawItem) rawItem.sortOrder = index;

                // remove navigation properties to avoid circular reference issues
                const { todoList, ...cleanItem } = itm;

                updates.push(todoItemService.updateItem(listId.value, itm.id, {
                    ...cleanItem,
                    sortOrder: index
                }));
            }
        });

        try {
            if (updates.length > 0) {
                await Promise.all(updates);
            }
        } catch (error) {
            console.error('Error moving item:', error);
            await fetchData(); // Revert on error
        }
    };

    watch(updatedItemEvent, (newItemData) => {
        if (!newItemData) return;

        // Find if this item exists in our current list
        const index = items.value.findIndex(i => i.id === newItemData.id);
        if (index !== -1) {
            // Update the local item state
            items.value[index] = {
                ...items.value[index],
                ...newItemData
            };
        }
    });

    const setDueDate = async (item, dueDate) => {
        try {
            // Strip navigation properties to avoid EF Core issues
            const { todoList, ...cleanItem } = item;

            await todoItemService.updateItem(listId.value, item.id, {
                ...cleanItem,
                dueDate: dueDate
            });

            // Invalidate all caches to refresh sidebar sections
            invalidateAllCaches();

            // Notify other components (sidebar) that an update occurred
            updatedItemEvent.value = { ...item, dueDate, timestamp: Date.now() };

            await fetchData();
        } catch (error) {
            console.error('Error setting due date:', error);
        }
    };

    return {
        list,
        items,
        loading,
        newItem,
        sortedItems,
        fetchData,
        addItem,
        toggleItem,
        togglePriority,
        moveItem,
        setDueDate,
        checkAll,
        uncheckAll,
        deleteItem
    };
}
