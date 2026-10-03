// Shared browser-only storage for the prototype's public site and dashboard.
window.PrototypeReservations = (() => {
    const key = 'serra_verde_reserves';
    function read() {
        try {
            const value = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : [];
        } catch {
            return [];
        }
    }
    function save(reservation) {
        localStorage.setItem(key, JSON.stringify([...read(), reservation]));
    }
    function toISODate(value) {
        if (typeof value !== 'string') return null;
        const match = value.match(/^(\d{1,2}) de (\S+) de (\d{4})$/i);
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
        if (!match) return null;
        const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
        const month = months.indexOf(match[2].toLocaleLowerCase('pt-BR')) + 1;
        return month ? `${match[3]}-${String(month).padStart(2,'0')}-${match[1].padStart(2,'0')}` : null;
    }
    return { key, read, save, toISODate };
})();
