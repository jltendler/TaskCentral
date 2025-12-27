// Helper to parse a date string as a local "calendar date" (ignoring timezones)
export const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    // Handle ISO strings (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...)
    const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [year, month, day] = datePart.split('-').map(Number);
    // month - 1 because JS Date months are 0-indexed
    return new Date(year, month - 1, day);
};

// Helper function to format due date
export const formatDueDate = (dueDate) => {
    const date = parseLocalDate(dueDate);
    if (!date) return '';
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time parts for accurate date comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'today';
    if (date.getTime() === tomorrow.getTime()) return 'tomorrow';

    return date.toLocaleDateString();
};

// Helper function to get color class based on due date
export const getDueDateColor = (dueDate) => {
    const date = parseLocalDate(dueDate);
    if (!date) return 'text-slate-normal';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    if (date < today) return 'text-danger font-bold'; // Overdue
    if (date <= sevenDaysFromNow) return 'text-info font-bold'; // Due soon
    return 'text-slate-normal'; // Future
};
