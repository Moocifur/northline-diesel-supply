// Shared display helpers. Plain functions, usable from server and client components alike.

// The API returns money as strings like "12.5". Always show two decimals.
export function money(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(2) : '0.00';
}

const LOW_STOCK_THRESHOLD = 5;

// How a part should be presented and whether it can be bought right now.
// The server enforces all of this again at checkout; this only drives the UI.
export function availability(part) {
    if (part.active === false) {
        return { canBuy: false, label: 'Unavailable', tone: 'text-gray-400' };
    }
    if (part.price === null || part.price === undefined) {
        return { canBuy: false, label: 'Price unavailable', tone: 'text-gray-400' };
    }

    const stock = part.quantityOnHand ?? 0;
    if (stock <= 0) {
        return { canBuy: false, label: 'Out of stock', tone: 'text-red-400' };
    }
    if (stock <= LOW_STOCK_THRESHOLD) {
        return { canBuy: true, label: `Only ${stock} left`, tone: 'text-yellow-400' };
    }
    return { canBuy: true, label: 'In stock', tone: 'text-green-400' };
}
