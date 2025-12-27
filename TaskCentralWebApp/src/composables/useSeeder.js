import { ref } from 'vue';
import { todoListService, todoItemService } from '../services/api';
import { useItemCache } from './useItemCache';
import { useItemEventBus } from './useItemEventBus';
import seedData from '../data/seedData.json';

export function useSeeder() {
    const isSeeding = ref(false);
    const { invalidateAllCaches } = useItemCache();
    const { emitRefreshAll } = useItemEventBus();

    const calculateDueDate = (offset) => {
        if (offset === undefined || offset === null) return 0;
        const date = new Date();
        date.setDate(date.getDate() + offset);
        return date.toISOString().split('T')[0];
    };

    const seed = async (onSuccess) => {
        if (isSeeding.value) return;
        isSeeding.value = true;

        try {
            for (const listData of seedData) {
                const listResponse = await todoListService.createList({ name: listData.name });
                const listId = listResponse.data.id;

                if (listData.items && listData.items.length > 0) {
                    for (const itemData of listData.items) {
                        const payload = {
                            title: itemData.title,
                            description: itemData.description,
                            isPriority: itemData.isPriority,
                            dueDate: calculateDueDate(itemData.dueDateOffset)
                        };
                        await todoItemService.createItem(listId, payload);
                    }
                }
            }

            invalidateAllCaches();
            emitRefreshAll();

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Failed to seed data:", error);
            alert("Failed to generate demo data. Check console for details.");
        } finally {
            isSeeding.value = false;
        }
    };

    return {
        isSeeding,
        seed
    };
}
