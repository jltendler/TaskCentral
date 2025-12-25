import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseLocalDate, formatDueDate, getDueDateColor } from '../useDateUtils';

describe('useDateUtils', () => {
    // Use current date as the anchor for deterministic tests during this run
    const TODAY = new Date();

    const toIsoDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Derived dates
    const TODAY_ISO = toIsoDate(TODAY);

    const TOMORROW = new Date(TODAY);
    TOMORROW.setDate(TODAY.getDate() + 1);
    const TOMORROW_ISO = toIsoDate(TOMORROW);

    const YESTERDAY = new Date(TODAY);
    YESTERDAY.setDate(TODAY.getDate() - 1);
    const YESTERDAY_ISO = toIsoDate(YESTERDAY);

    const SEVEN_DAYS_FROM_NOW = new Date(TODAY);
    SEVEN_DAYS_FROM_NOW.setDate(TODAY.getDate() + 7);
    const SEVEN_DAYS_FROM_NOW_ISO = toIsoDate(SEVEN_DAYS_FROM_NOW);

    const EIGHT_DAYS_FROM_NOW = new Date(TODAY);
    EIGHT_DAYS_FROM_NOW.setDate(TODAY.getDate() + 8);
    const EIGHT_DAYS_FROM_NOW_ISO = toIsoDate(EIGHT_DAYS_FROM_NOW);

    beforeEach(() => {
        vi.useFakeTimers(); //This is totally overkill, but if you ran the tests right before day change they might fail. :)
        vi.setSystemTime(TODAY);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('parseLocalDate', () => {
        it('should parse ISO date string correctly', () => {
            // Use a fixed date for parsing test
            const date = parseLocalDate('2025-12-20');
            expect(date.getFullYear()).toBe(2025);
            expect(date.getMonth()).toBe(11); // Dec
            expect(date.getDate()).toBe(20);
        });

        it('should parse ISO date-time string correctly', () => {
            const date = parseLocalDate('2025-12-20T14:30:00');
            expect(date.getFullYear()).toBe(2025);
            expect(date.getMonth()).toBe(11);
            expect(date.getDate()).toBe(20);
        });

        it('should return null for empty input', () => {
            expect(parseLocalDate(null)).toBeNull();
            expect(parseLocalDate('')).toBeNull();
        });
    });

    describe('formatDueDate', () => {
        it('should return "today" for today\'s date', () => {
            expect(formatDueDate(TODAY_ISO)).toBe('today');
            expect(formatDueDate(`${TODAY_ISO}T10:00:00`)).toBe('today');
        });

        it('should return "tomorrow" for tomorrow\'s date', () => {
            expect(formatDueDate(TOMORROW_ISO)).toBe('tomorrow');
        });

        it('should return locale date string for future dates', () => {
            // Local date string format depends on locale
            const result = formatDueDate(EIGHT_DAYS_FROM_NOW_ISO);
            expect(result).not.toBe('today');
            expect(result).not.toBe('tomorrow');
            // Expect the year of the calculated future date
            expect(result).toContain(EIGHT_DAYS_FROM_NOW.getFullYear().toString());
        });
    });

    describe('getDueDateColor', () => {
        it('should return red for overdue dates', () => {
            expect(getDueDateColor(YESTERDAY_ISO)).toBe('text-red-400'); // Yesterday


            const MONTH_AGO_DATE = new Date(TODAY);
            MONTH_AGO_DATE.setMonth(TODAY.getMonth() - 1);
            const MONTH_AGO_DATE_ISO = toIsoDate(MONTH_AGO_DATE);
            expect(getDueDateColor(MONTH_AGO_DATE_ISO)).toBe('text-red-400'); // Last month
        });

        it('should return blue for dates due soon (within 7 days)', () => {
            expect(getDueDateColor(TODAY_ISO)).toBe('text-blue-400');
            expect(getDueDateColor(TOMORROW_ISO)).toBe('text-blue-400');
            expect(getDueDateColor(SEVEN_DAYS_FROM_NOW_ISO)).toBe('text-blue-400');
        });

        it('should return slate for dates further in the future than 7 days', () => {
            expect(getDueDateColor(EIGHT_DAYS_FROM_NOW_ISO)).toBe('text-slate-400');
        });
    });
});
