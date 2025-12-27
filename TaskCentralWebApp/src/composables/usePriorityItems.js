import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { todoItemService } from '../services/api';
import { useItemCache } from './useItemCache';
import { useItemEventBus } from './useItemEventBus';

export function usePriorityItems() {
    const router = useRouter();
    const {
        updatePriorityCache,
        isPriorityCacheValid,
        getPriorityCacheRef,
        updateItemInCaches
    } = useItemCache();

    const { updatedItemEvent, emitItemUpdate, refreshAllEvent } = useItemEventBus();

    // Use the cache ref directly for reactivity
    const priorityItems = getPriorityCacheRef();
    const loading = ref(true);
    const POLL_TIME = 60000; //avoiding magic value, set to 60 seconds
    let pollInterval = null;

    const sortedPriorityItems = computed(() => {
        return [...priorityItems.value].sort((a, b) => {
            // Completed items at the bottom
            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
            // Newest first
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    });

    const fetchPriorityItems = async () => {
        // Use cache if valid
        if (isPriorityCacheValid() && priorityItems.value.length > 0) {
            loading.value = false;
            return;
        }

        try {
            const response = await todoItemService.getPriorityItems();
            updatePriorityCache(response.data);
        } catch (error) {
            console.error('Error fetching priority items:', error);
        } finally {
            loading.value = false;
        }
    };

    // Watch for external updates
    watch(updatedItemEvent, () => {
        fetchPriorityItems();
    });

    watch(refreshAllEvent, () => {
        fetchPriorityItems();
    });

    const goToList = (id) => {
        router.push({ name: 'todolist', params: { id } });
    };

    onMounted(() => {
        fetchPriorityItems();
        pollInterval = setInterval(fetchPriorityItems, POLL_TIME);
    });

    onUnmounted(() => {
        if (pollInterval) clearInterval(pollInterval);
    });

    return {
        priorityItems,
        sortedPriorityItems,
        loading,
        fetchPriorityItems,
        goToList
    };
}
