import { ref } from 'vue';
import { parseLocalDate } from './useDateUtils';

// Shared caches for different item types
const priorityItemsCache = ref([]);
const dueSoonItemsCache = ref([]);
const overdueItemsCache = ref([]);

const lastFetchTimes = {
    priority: ref(0),
    dueSoon: ref(0),
    overdue: ref(0)
};

const CACHE_DURATION = 60000; // 60 seconds

// Helper to check if an item should be in due soon
const isDueSoon = (item) => {
    if (!item.dueDate || item.isCompleted) return false;
    const dueDate = parseLocalDate(item.dueDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return dueDate >= today && dueDate <= sevenDaysFromNow;
};

// Helper to check if an item is overdue
const isOverdue = (item) => {
    if (!item.dueDate || item.isCompleted) return false;
    const dueDate = parseLocalDate(item.dueDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return dueDate < today;
};

export function useItemCache() {
    // Priority item cache methods
    const updatePriorityCache = (items) => {
        priorityItemsCache.value = items;
        lastFetchTimes.priority.value = Date.now();
    };

    const isPriorityCacheValid = () => {
        return Date.now() - lastFetchTimes.priority.value < CACHE_DURATION;
    };

    const getPriorityCache = () => priorityItemsCache.value;
    const getPriorityCacheRef = () => priorityItemsCache;

    // Due soon item cache methods
    const updateDueSoonCache = (items) => {
        dueSoonItemsCache.value = items;
        lastFetchTimes.dueSoon.value = Date.now();
    };

    const isDueSoonCacheValid = () => {
        return Date.now() - lastFetchTimes.dueSoon.value < CACHE_DURATION;
    };

    const getDueSoonCache = () => dueSoonItemsCache.value;
    const getDueSoonCacheRef = () => dueSoonItemsCache;

    // Overdue item cache methods
    const updateOverdueCache = (items) => {
        overdueItemsCache.value = items;
        lastFetchTimes.overdue.value = Date.now();
    };

    const isOverdueCacheValid = () => {
        return Date.now() - lastFetchTimes.overdue.value < CACHE_DURATION;
    };

    const getOverdueCache = () => overdueItemsCache.value;
    const getOverdueCacheRef = () => overdueItemsCache;

    // Invalidate all caches
    const invalidateAllCaches = () => {
        lastFetchTimes.priority.value = 0;
        lastFetchTimes.dueSoon.value = 0;
        lastFetchTimes.overdue.value = 0;
    };

    // Update an item across all caches
    const updateItemInCaches = (itemId, updates) => {
        // Update in priority cache
        const priorityIndex = priorityItemsCache.value.findIndex(item => item.id === itemId);
        if (priorityIndex !== -1) {
            const updatedItem = {
                ...priorityItemsCache.value[priorityIndex],
                ...updates,
                todoList: priorityItemsCache.value[priorityIndex].todoList
            };
            priorityItemsCache.value[priorityIndex] = updatedItem;

            // If no longer priority, remove from cache
            if (!updatedItem.isPriority) {
                priorityItemsCache.value = priorityItemsCache.value.filter(item => item.id !== itemId);
            }
        }

        // Update in due soon cache
        const dueSoonIndex = dueSoonItemsCache.value.findIndex(item => item.id === itemId);
        if (dueSoonIndex !== -1) {
            const updatedItem = {
                ...dueSoonItemsCache.value[dueSoonIndex],
                ...updates,
                todoList: dueSoonItemsCache.value[dueSoonIndex].todoList
            };
            dueSoonItemsCache.value[dueSoonIndex] = updatedItem;

            // If no longer due soon, remove from cache
            if (!isDueSoon(updatedItem)) {
                dueSoonItemsCache.value = dueSoonItemsCache.value.filter(item => item.id !== itemId);
            }
        }

        // Update in overdue cache
        const overdueIndex = overdueItemsCache.value.findIndex(item => item.id === itemId);
        if (overdueIndex !== -1) {
            const updatedItem = {
                ...overdueItemsCache.value[overdueIndex],
                ...updates,
                todoList: overdueItemsCache.value[overdueIndex].todoList
            };
            overdueItemsCache.value[overdueIndex] = updatedItem;

            // If no longer overdue, remove from cache
            if (!isOverdue(updatedItem)) {
                overdueItemsCache.value = overdueItemsCache.value.filter(item => item.id !== itemId);
            }
        }
    };

    // Add item to appropriate caches
    const addItemToCaches = (item) => {
        if (item.isPriority && !priorityItemsCache.value.find(i => i.id === item.id)) {
            priorityItemsCache.value.push(item);
        }
        if (isDueSoon(item) && !dueSoonItemsCache.value.find(i => i.id === item.id)) {
            dueSoonItemsCache.value.push(item);
        }
        if (isOverdue(item) && !overdueItemsCache.value.find(i => i.id === item.id)) {
            overdueItemsCache.value.push(item);
        }
    };

    // Remove item from all caches
    const removeItemFromCaches = (itemId) => {
        priorityItemsCache.value = priorityItemsCache.value.filter(item => item.id !== itemId);
        dueSoonItemsCache.value = dueSoonItemsCache.value.filter(item => item.id !== itemId);
        overdueItemsCache.value = overdueItemsCache.value.filter(item => item.id !== itemId);
    };

    return {
        // Priority
        updatePriorityCache,
        isPriorityCacheValid,
        getPriorityCache,
        getPriorityCacheRef,

        // Due Soon
        updateDueSoonCache,
        isDueSoonCacheValid,
        getDueSoonCache,
        getDueSoonCacheRef,

        // Overdue
        updateOverdueCache,
        isOverdueCacheValid,
        getOverdueCache,
        getOverdueCacheRef,

        // Shared operations
        invalidateAllCaches,
        updateItemInCaches,
        addItemToCaches,
        removeItemFromCaches,

        // Logic helpers
        isDueSoon,
        isOverdue
    };
}
