import { ref } from 'vue';
import { todoListService, todoItemService } from '../services/api';
import { useItemCache } from './useItemCache';
import { useItemEventBus } from './useItemEventBus';
import rawSeedData from '../data/seedData.json';

export function useSeeder() {
    const isSeeding = ref(false);
    const { invalidateAllCaches } = useItemCache();
    const { emitRefreshAll } = useItemEventBus();

    const calculateDueDate = (offset) => {
        if (offset === undefined || offset === null) return 0;
        const date = new Date();
        const dateJitter = Math.floor(Math.random() * 5) - 2;
        date.setDate(date.getDate() + offset + dateJitter);
        return date.toISOString().split('T')[0];
    };

    // Fisher-Yates Shuffle https://dev.to/tanvir_azad/fisher-yates-shuffle-the-right-way-to-randomize-an-array-4d2p
    const shuffleArray = (array) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
        }
        return arr;
    };

    const seed = async (onSuccess) => {
        if (isSeeding.value) return; //Don't seed more if it's already seeding
        isSeeding.value = true;

        try {
            // Randomly select 3 to 5 lists
            const shuffledLists = shuffleArray(rawSeedData);
            const numberOfLists = Math.floor(Math.random() * 3) + 3;
            const selectedLists = shuffledLists.slice(0, numberOfLists);

            for (const listData of selectedLists) {
                const listResponse = await todoListService.createList({ name: listData.name });
                const listId = listResponse.data.id;

                if (listData.items && listData.items.length > 0) {
                    for (const itemData of listData.items) {
                        // Randomize priority (20%)
                        const isPriority = Math.random() < 0.2;

                        // Randomize completion (25%)
                        const isCompleted = Math.random() < 0.25;
                        ///...hopefully some overlap. I'm feelin' lucky :)
                        const payload = {
                            title: itemData.title,
                            description: itemData.description,
                            isPriority: isPriority,
                            isCompleted: isCompleted,
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
