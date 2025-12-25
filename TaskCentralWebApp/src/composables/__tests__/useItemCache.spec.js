import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useItemCache } from '../useItemCache';

describe('useItemCache', () => {
    const {
        addItemToCaches,
        removeItemFromCaches,
        updateItemInCaches,
        getPriorityCacheRef,
        getDueSoonCacheRef,
        getOverdueCacheRef,
        updatePriorityCache,
        isPriorityCacheValid,
        invalidateAllCaches
    } = useItemCache();

    // Use current date as the anchor for deterministic tests during this run
    const TODAY = new Date();

    // Helper to get ISO date string (YYYY-MM-DD)
    const toIsoDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const YESTERDAY = new Date(TODAY);
    YESTERDAY.setDate(TODAY.getDate() - 1);
    const YESTERDAY_ISO = toIsoDate(YESTERDAY);

    const TOMORROW = new Date(TODAY);
    TOMORROW.setDate(TODAY.getDate() + 1);
    const TOMORROW_ISO = toIsoDate(TOMORROW);

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(TODAY);

        // Reset caches
        getPriorityCacheRef().value = [];
        getDueSoonCacheRef().value = [];
        getOverdueCacheRef().value = [];

        invalidateAllCaches();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('addItemToCaches', () => {
        it('should add priority items to priority cache', () => {
            const item = { id: '1', title: 'Test', isPriority: true };
            addItemToCaches(item);
            expect(getPriorityCacheRef().value).toContainEqual(item);
        });

        it('should add due soon items to due soon cache', () => {
            // Tomorrow is Due Soon
            const item = { id: '2', title: 'Test', dueDate: TOMORROW_ISO };
            addItemToCaches(item);
            expect(getDueSoonCacheRef().value).toContainEqual(item);
        });

        it('should add overdue items to overdue cache', () => {
            // Yesterday is Overdue
            const item = { id: '3', title: 'Test', dueDate: YESTERDAY_ISO };
            addItemToCaches(item);
            expect(getOverdueCacheRef().value).toContainEqual(item);
        });

        it('should not add completed items to time-based caches', () => {
            const item = { id: '4', title: 'Test', dueDate: YESTERDAY_ISO, isCompleted: true };
            addItemToCaches(item);
            expect(getOverdueCacheRef().value).not.toContainEqual(item);
        });
    });

    describe('removeItemFromCaches', () => {
        it('should remove item from all caches', () => {
            const item = { id: '1', title: 'Test', isPriority: true, dueDate: YESTERDAY_ISO };
            // Manually populate caches
            getPriorityCacheRef().value = [item];
            getOverdueCacheRef().value = [item];

            removeItemFromCaches('1');

            expect(getPriorityCacheRef().value).toHaveLength(0);
            expect(getOverdueCacheRef().value).toHaveLength(0);
        });
    });

    describe('updateItemInCaches', () => {
        it('should update item properties in cache', () => {
            const item = { id: '1', title: 'Original', isPriority: true };
            getPriorityCacheRef().value = [item];

            updateItemInCaches('1', { title: 'Updated' });

            expect(getPriorityCacheRef().value[0].title).toBe('Updated');
        });

        it('should remove from priority cache if isPriority becomes false', () => {
            const item = { id: '1', title: 'Test', isPriority: true };
            getPriorityCacheRef().value = [item];

            updateItemInCaches('1', { isPriority: false });

            expect(getPriorityCacheRef().value).toHaveLength(0);
        });
    });

    describe('Cache Validation', () => {
        it('should consider cache valid immediately after update', () => {
            updatePriorityCache([]);
            expect(isPriorityCacheValid()).toBe(true);
        });

        it('should consider cache invalid after 60 seconds', () => {
            updatePriorityCache([]);

            // Advance time by 61 seconds
            vi.advanceTimersByTime(61000);

            expect(isPriorityCacheValid()).toBe(false);
        });
    });
});
