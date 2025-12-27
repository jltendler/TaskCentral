import { ref, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { todoListService } from '../services/api';
import { useItemEventBus } from './useItemEventBus';
import { useItemCache } from './useItemCache';

export function useTodoLists() {
    const router = useRouter();
    const { updatedItemEvent, emitRefreshAll, refreshAllEvent } = useItemEventBus();
    const { removeListFromCaches } = useItemCache();
    const lists = ref([]);

    // Watch for single item updates from the sidebar to update dashboard counters
    watch(updatedItemEvent, (newItemData) => {
        if (!newItemData || !lists.value) return;

        for (const list of lists.value) {
            const itemIndex = list.items?.findIndex(i => i.id === newItemData.id);
            if (itemIndex !== -1) {
                list.items[itemIndex] = {
                    ...list.items[itemIndex],
                    ...newItemData
                };
                break;
            }
        }
    });

    // Refresh entire dashboard on global events (check all, uncheck all, seeding, etc)
    watch(refreshAllEvent, () => {
        fetchLists();
    });

    const loading = ref(true);
    const showAddModal = ref(false);
    const newList = ref({ name: '' });
    const listIdDeleting = ref(null);

    const fetchLists = async () => {
        loading.value = true;
        try {
            const response = await todoListService.getLists();
            lists.value = response.data;
        } catch (error) {
            console.error('Error fetching lists:', error);
        } finally {
            loading.value = false;
        }
    };

    const createList = async (name) => {
        const listName = typeof name === 'string' ? name : newList.value.name;
        if (!listName) return;
        try {
            await todoListService.createList({ name: listName });
            newList.value.name = '';
            showAddModal.value = false;
            await fetchLists();
        } catch (error) {
            console.error('Error creating list:', error);
        }
    };

    const requestDelete = (id) => {
        listIdDeleting.value = id;
    };

    const cancelDelete = () => {
        listIdDeleting.value = null;
    };

    const deleteList = async (id) => {
        try {
            // Optimistically remove associated items from sidebar caches
            removeListFromCaches(id);

            await todoListService.deleteList(id);
            listIdDeleting.value = null;
            emitRefreshAll();
            await fetchLists();
        } catch (error) {
            console.error('Error deleting list:', error);
        }
    };

    const goToList = (id) => {
        router.push({ name: 'todolist', params: { id } });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        // If the date string doesn't have a timezone indicator, assume it's UTC and append 'Z'
        // Since we control the data this isn't necessary, but it's a good inclusion for futureproofing.
        const utcString = (dateString.includes('Z') || dateString.includes('+'))
            ? dateString
            : `${dateString}Z`;
        // I dislike the undefined here, but that's the MDN-blessed 'default to local' option. Eww.
        return new Date(utcString).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };


    onMounted(fetchLists);

    return {
        lists,
        loading,
        showAddModal,
        newList,
        listIdDeleting,
        fetchLists,
        createList,
        requestDelete,
        cancelDelete,
        deleteList,
        goToList,
        formatDate
    };
}
