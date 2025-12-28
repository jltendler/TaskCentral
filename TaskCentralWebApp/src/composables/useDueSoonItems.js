import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { todoItemService } from '../services/api';
import { useItemCache } from './useItemCache';
import { useItemEventBus } from './useItemEventBus';
import { parseLocalDate } from './useDateUtils';
import { useRouter } from 'vue-router';

export function useDueSoonItems() {
    const {
        updateDueSoonCache,
        isDueSoonCacheValid,
        getDueSoonCacheRef,
        isDueSoon
    } = useItemCache();

    const { updatedItemEvent, refreshAllEvent } = useItemEventBus();
    const router = useRouter();
    const loading = ref(true);
    const pollInterval = ref(null);
    const POLL_TIME = 60000; //avoiding magic value

    // Use the cache ref directly for reactivity
    const items = getDueSoonCacheRef();

    const fetchDueSoonItems = async () => {
        // If cache is still valid don't do anything, just return.
        if (isDueSoonCacheValid()) {
            loading.value = false;
            return;
        }

        loading.value = true;
        try {
            const response = await todoItemService.getDueSoonItems();
            // Filter the response using local-time safe logic to account for UTC shifts
            const filteredItems = response.data.filter(item => isDueSoon(item));
            updateDueSoonCache(filteredItems);
        } catch (error) {
            console.error('Error fetching due soon items:', error);
        } finally {
            loading.value = false;
        }
    };

    // Watch for external updates
    watch(updatedItemEvent, () => {
        fetchDueSoonItems();
    });

    watch(refreshAllEvent, () => {
        fetchDueSoonItems();
    });

    const goToList = (listId) => {
        router.push(`/list/${listId}`);
    };

    const sortedDueSoonItems = computed(() => {
        return [...items.value].sort((a, b) => {
            // Sort by due date (earliest first)
            const dateA = parseLocalDate(a.dueDate);
            const dateB = parseLocalDate(b.dueDate);
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateA - dateB;
        });
    });

    onMounted(() => {
        fetchDueSoonItems();
        // Poll every 60 seconds
        pollInterval.value = setInterval(fetchDueSoonItems, POLL_TIME);
    });

    onUnmounted(() => {
        if (pollInterval.value) {
            clearInterval(pollInterval.value);
        }
    });

    return {
        items: sortedDueSoonItems,
        loading,
        fetchDueSoonItems,
        goToList
    };
}
