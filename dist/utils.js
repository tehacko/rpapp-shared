// Shared utility functions - consolidated from utils/simple.ts
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Additional check for consecutive dots which are invalid
    if (email.includes('..'))
        return false;
    return emailRegex.test(email);
};
export const formatPrice = (price) => {
    return `${price} Kč`;
};
export const getKioskIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const kioskId = urlParams.get('kioskId');
    if (!kioskId) {
        throw new Error('Kiosk ID is required. Please add ?kioskId=X to the URL where X is your kiosk number.');
    }
    const parsedId = parseInt(kioskId);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid kiosk ID: ${kioskId}. Kiosk ID must be a positive number.`);
    }
    return parsedId;
};
export const getKioskSecretFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('secret') || undefined;
};
export const formatDate = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('cs-CZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};
export const generatePaymentId = () => {
    return `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
export const validateKioskId = (kioskId) => {
    return Number.isInteger(kioskId) && kioskId > 0;
};
// Cart utility functions
export const createEmptyCart = () => ({
    items: [],
    totalAmount: 0,
    totalItems: 0
});
export const addToCart = (cart, product, quantity = 1) => {
    const existingItem = cart.items.find((item) => item.product.id === product.id);
    if (existingItem) {
        existingItem.quantity += quantity;
    }
    else {
        cart.items.push({ product, quantity });
    }
    cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    return cart;
};
export const removeFromCart = (cart, productId) => {
    cart.items = cart.items.filter((item) => item.product.id !== productId);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    return cart;
};
export const updateCartItemQuantity = (cart, productId, quantity) => {
    const item = cart.items.find((item) => item.product.id === productId);
    if (item) {
        if (quantity <= 0) {
            return removeFromCart(cart, productId);
        }
        item.quantity = quantity;
        cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    return cart;
};
export const clearCart = (cart) => {
    cart.items = [];
    cart.totalAmount = 0;
    cart.totalItems = 0;
    return cart;
};
// Note: getErrorMessage is now exported from ./errors.ts instead
