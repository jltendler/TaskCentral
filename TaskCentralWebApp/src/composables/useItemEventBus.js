import { ref } from 'vue';

const updatedItemEvent = ref(null);

// This event bus lets updates from the sidebar take immediate effect on the main list view without an API call or page refresh.
// (which avoids a nasty desync issue where the sidebar and main list view get out of sync)
export function useItemEventBus() {
    const emitItemUpdate = (item) => {
        updatedItemEvent.value = { ...item, timestamp: Date.now() };
    };

    return {
        updatedItemEvent,
        emitItemUpdate
    };
}
