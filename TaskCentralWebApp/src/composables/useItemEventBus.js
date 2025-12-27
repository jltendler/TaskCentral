import { ref } from 'vue';
import { useItemCache } from './useItemCache';

const updatedItemEvent = ref(null);

// This event bus lets updates from the sidebar take immediate effect on the main list view without an API call or page refresh.
// (which avoids a nasty desync issue where the sidebar and main list view get out of sync)
const refreshAllEvent = ref(0);

export function useItemEventBus() {
    const { invalidateAllCaches } = useItemCache();

    const emitItemUpdate = (item) => {
        updatedItemEvent.value = { ...item, timestamp: Date.now() };
    };

    const emitRefreshAll = () => {
        invalidateAllCaches();
        refreshAllEvent.value = Date.now();
    };

    return {
        updatedItemEvent,
        emitItemUpdate,
        refreshAllEvent,
        emitRefreshAll
    };
}
