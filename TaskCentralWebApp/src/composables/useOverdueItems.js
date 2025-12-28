import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { todoItemService } from '../services/api';
import { useItemCache } from './useItemCache';
import { useItemEventBus } from './useItemEventBus';
import { parseLocalDate } from './useDateUtils';
import { useRouter } from 'vue-router';

export function useOverdueItems() {
    const {
        updateOverdueCache,
        isOverdueCacheValid,
        getOverdueCacheRef,
        isOverdue
    } = useItemCache();

    const { updatedItemEvent, refreshAllEvent } = useItemEventBus();
    const router = useRouter();
    const loading = ref(true);
    const pollInterval = ref(null);
    const POLL_TIME = 60000;

    // Use the cache ref directly for reactivity
    const items = getOverdueCacheRef();

    const fetchOverdueItems = async () => {
        // Use cache if valid
        if (isOverdueCacheValid()) {
            loading.value = false;
            return;
        }

        loading.value = true;
        try {
            const response = await todoItemService.getOverdueItems();
            const filteredItems = response.data.filter(item => isOverdue(item));
            updateOverdueCache(filteredItems);
        } catch (error) {
            console.error('Error fetching overdue items:', error);
        } finally {
            loading.value = false;
        }
    };

    // Watch for external updates
    watch(updatedItemEvent, () => {
        fetchOverdueItems();
    });

    watch(refreshAllEvent, () => {
        fetchOverdueItems();
    });

    // callback if the user clicks on a list item in the sidebar
    const goToList = (listId) => {
        router.push(`/list/${listId}`);
    };

    const sortedOverdueItems = computed(() => {
        return [...items.value].sort((a, b) => {
            // Sort by date, displaying the most overdue items first
            const dateA = parseLocalDate(a.dueDate);
            const dateB = parseLocalDate(b.dueDate);
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateA - dateB;
        });
    });

    onMounted(() => {
        fetchOverdueItems();
        // Poll every 60 seconds
        pollInterval.value = setInterval(fetchOverdueItems, POLL_TIME);
    });

    onUnmounted(() => {
        if (pollInterval.value) {
            clearInterval(pollInterval.value);
        }
    });

    return {
        items: sortedOverdueItems,
        loading,
        fetchOverdueItems,
        goToList
    };
}
