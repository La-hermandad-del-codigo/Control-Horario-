export const getStartOfWeek = (): string => {
    const now = new Date();
    const day = now.getDay();
    const diff = (day === 0 ? -6 : 1) - day;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    return monday.toISOString();
};
