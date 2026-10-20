// The API returns money as strings like "12.5". Show two decimals, or a dash when there is no value.
export function money(value) {
    if (value === null || value === undefined || value === '') return '—';
    const number = Number(value);
    return Number.isFinite(number) ? `$${number.toFixed(2)}` : '—';
}
