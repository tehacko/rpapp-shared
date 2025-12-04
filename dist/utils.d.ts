export declare const validateEmail: (email: string) => boolean;
export declare const formatPrice: (price: number) => string;
export declare const PRICE_PRECISION = 2;
export declare const roundPrice: (price: number) => number;
export declare const parsePrice: (value: string | number) => number;
export declare const validatePrice: (price: number) => boolean;
export declare const priceToString: (price: number) => string;
export declare const stringToPrice: (priceStr: string) => number;
export declare const getKioskIdFromUrl: () => number;
export declare const getKioskSecretFromUrl: () => string | undefined;
export declare const formatDate: (date: Date | string) => string;
export declare const debounce: <T extends (...args: any[]) => any>(func: T, delay: number) => ((...args: Parameters<T>) => void);
export declare const generatePaymentId: () => string;
export declare const validateKioskId: (kioskId: number) => boolean;
export declare const createEmptyCart: () => {
    items: never[];
    totalAmount: number;
    totalItems: number;
};
export declare const addToCart: (cart: any, product: any, quantity?: number) => any;
export declare const removeFromCart: (cart: any, productId: number) => any;
export declare const updateCartItemQuantity: (cart: any, productId: number, quantity: number) => any;
export declare const clearCart: (cart: any) => any;
//# sourceMappingURL=utils.d.ts.map