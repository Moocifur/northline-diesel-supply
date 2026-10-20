// Validates and normalizes the body of POST /parts and PUT /parts/:id.
// Pure function: returns { errors, data }. Only fields that were sent end up in `data`,
// which is what makes partial updates (like toggling `active`) work.
const MAX_TEXT_LENGTH = 200;
const MAX_MONEY = 1000000;

const REQUIRED_TEXT_FIELDS = [
    ['partNumber', 'Part number'],
    ['description', 'Description'],
    ['brand', 'Brand'],
    ['category', 'Category']
];

// '' and null mean "clear this field". Returns undefined when the value is invalid.
const parseMoney = (value, label, errors) => {
    if (value === '' || value === null) return null;
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || number > MAX_MONEY) {
        errors.push(`${label} must be a number between 0 and ${MAX_MONEY}`);
        return undefined;
    }
    return number.toFixed(2);
};

const validatePart = (body, { partial = false } = {}) => {
    const errors = [];
    const data = {};
    const input = body && typeof body === 'object' ? body : {};

    for (const [key, label] of REQUIRED_TEXT_FIELDS) {
        if (input[key] === undefined) {
            if (!partial) errors.push(`${label} is required`);
            continue;
        }
        const value = typeof input[key] === 'string' ? input[key].trim() : '';
        if (!value) {
            errors.push(`${label} is required`);
        } else if (value.length > MAX_TEXT_LENGTH) {
            errors.push(`${label} must be ${MAX_TEXT_LENGTH} characters or fewer`);
        } else {
            data[key] = value;
        }
    }

    for (const [key, label] of [['price', 'Price'], ['coreCharge', 'Core charge']]) {
        if (input[key] === undefined) continue;
        const parsed = parseMoney(input[key], label, errors);
        if (parsed !== undefined) data[key] = parsed;
    }

    if (input.quantityOnHand !== undefined) {
        const quantity = input.quantityOnHand === '' ? 0 : Number(input.quantityOnHand);
        if (!Number.isInteger(quantity) || quantity < 0) {
            errors.push('Quantity on hand must be a whole number, 0 or more');
        } else {
            data.quantityOnHand = quantity;
        }
    }

    if (input.active !== undefined) {
        if (typeof input.active === 'boolean') {
            data.active = input.active;
        } else {
            errors.push('Active must be true or false');
        }
    }

    if (input.images !== undefined) {
        if (Array.isArray(input.images) && input.images.every(image => typeof image === 'string')) {
            data.images = input.images.map(image => image.trim()).filter(Boolean);
        } else {
            errors.push('Images must be a list of URLs');
        }
    }

    return { errors, data };
};

module.exports = { validatePart };
