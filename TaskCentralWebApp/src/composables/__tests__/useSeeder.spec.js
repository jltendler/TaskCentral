import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSeeder } from '../useSeeder';
import { todoListService, todoItemService } from '../../services/api';
import { useItemCache } from '../useItemCache';
import { useItemEventBus } from '../useItemEventBus';

// Mock dependencies
vi.mock('../../services/api', () => ({
    todoListService: {
        createList: vi.fn()
    },
    todoItemService: {
        createItem: vi.fn()
    }
}));

vi.mock('../useItemCache', () => ({
    useItemCache: vi.fn(() => ({
        invalidateAllCaches: vi.fn()
    }))
}));

vi.mock('../useItemEventBus', () => ({
    useItemEventBus: vi.fn(() => ({
        emitRefreshAll: vi.fn()
    }))
}));

// Mock seed data
vi.mock('../../data/seedData.json', () => ({
    default: [
        { name: "List 1", items: [{ title: "Item 1", dueDateOffset: 0 }] },
        { name: "List 2", items: [{ title: "Item 2", dueDateOffset: 0 }] },
        { name: "List 3", items: [{ title: "Item 3", dueDateOffset: 0 }] },
        { name: "List 4", items: [{ title: "Item 4", dueDateOffset: 0 }] },
        { name: "List 5", items: [{ title: "Item 5", dueDateOffset: 0 }] }
    ]
}));

describe('useSeeder', () => {
    let invalidateAllCachesMock;
    let emitRefreshAllMock;

    beforeEach(() => {
        vi.clearAllMocks();

        invalidateAllCachesMock = vi.fn();
        useItemCache.mockReturnValue({ invalidateAllCaches: invalidateAllCachesMock });

        emitRefreshAllMock = vi.fn();
        useItemEventBus.mockReturnValue({ emitRefreshAll: emitRefreshAllMock });

        // Default success
        todoListService.createList.mockResolvedValue({ data: { id: 100 } });
        todoItemService.createItem.mockResolvedValue({ data: { id: 200 } });

        // Mock generic alert
        vi.stubGlobal('alert', vi.fn());
    });

    it('should initialize with isSeeding false', () => {
        const { isSeeding } = useSeeder();
        expect(isSeeding.value).toBe(false);
    });

    it('should successfuly seed data', async () => {
        const { seed, isSeeding } = useSeeder();

        const seedPromise = seed();
        expect(isSeeding.value).toBe(true);

        await seedPromise;
        expect(isSeeding.value).toBe(false);

        // Should create at least 3 lists
        expect(todoListService.createList.mock.calls.length).toBeGreaterThanOrEqual(3);

        expect(todoItemService.createItem).toHaveBeenCalled();

        expect(invalidateAllCachesMock).toHaveBeenCalled();
        expect(emitRefreshAllMock).toHaveBeenCalled();
    });

    it('should prevent concurrent calls', async () => {
        const { seed, isSeeding } = useSeeder();

        todoListService.createList.mockImplementation(() => new Promise(r =>
            setTimeout(() => r({ data: { id: 100 } }), 10)
        ));

        const p1 = seed();
        const p2 = seed();

        await Promise.all([p1, p2]);


        const calls = todoListService.createList.mock.calls.length;
        expect(calls).toBeLessThanOrEqual(5);
    });

    it('should alert the user if an error occurs', async () => {
        const { seed, isSeeding } = useSeeder();
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        todoListService.createList.mockRejectedValue(new Error('Network error'));

        await seed();

        expect(isSeeding.value).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('Failed to seed data:', expect.any(Error));
        expect(alert).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});
