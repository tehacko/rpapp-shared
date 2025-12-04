export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}
export declare const validators: {
    required: (value: any) => string | null;
    email: (value: string) => string | null;
    minLength: (value: string, min: number, fieldName: string) => string | null;
    maxLength: (value: string, max: number, fieldName: string) => string | null;
    positiveNumber: (value: number, fieldName: string) => string | null;
    username: (value: string) => string | null;
    password: (value: string) => string | null;
    kioskId: (value: number) => string | null;
    quantity: (value: number, fieldName?: string) => string | null;
    price: (value: number, fieldName?: string) => string | null;
};
export interface ValidationSchema {
    [field: string]: Array<(value: any) => string | null>;
}
export declare const validateSchema: (data: Record<string, any>, schema: ValidationSchema) => ValidationResult;
export declare const validationSchemas: {
    login: {
        username: ((value: string) => string | null)[];
        password: ((value: string) => string | null)[];
    };
    customerEmail: {
        email: ((value: string) => string | null)[];
    };
    product: {
        name: ((value: any) => string | null)[];
        price: ((value: number, fieldName?: string) => string | null)[];
        description: ((value: any) => string | null)[];
    };
    kioskId: {
        kioskId: ((value: number) => string | null)[];
    };
    inventory: {
        quantityInStock: ((value: number, fieldName?: string) => string | null)[];
    };
    payment: {
        productId: ((value: any) => string | null)[];
        kioskId: ((value: number) => string | null)[];
        amount: ((value: number, fieldName?: string) => string | null)[];
    };
};
//# sourceMappingURL=validation.d.ts.map