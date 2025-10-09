// Shared validation utilities
// ValidationError is imported but not used directly in this file
import { APP_CONFIG, UI_MESSAGES } from './constants';
export const validators = {
    required: (value) => {
        if (value === null || value === undefined || value === '') {
            return UI_MESSAGES.REQUIRED_FIELD;
        }
        return null;
    },
    email: (value) => {
        if (!value)
            return null; // Let required validator handle empty values
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return UI_MESSAGES.INVALID_EMAIL;
        }
        return null;
    },
    minLength: (value, min, fieldName) => {
        if (!value)
            return null; // Let required validator handle empty values
        if (value.length < min) {
            return `${fieldName} musí mít alespoň ${min} znaků`;
        }
        return null;
    },
    maxLength: (value, max, fieldName) => {
        if (!value)
            return null;
        if (value.length > max) {
            return `${fieldName} může mít maximálně ${max} znaků`;
        }
        return null;
    },
    positiveNumber: (value, fieldName) => {
        if (value === null || value === undefined)
            return null;
        if (value <= 0) {
            return `${fieldName} musí být větší než 0`;
        }
        return null;
    },
    username: (value) => {
        if (!value)
            return null;
        if (value.length < APP_CONFIG.MIN_USERNAME_LENGTH) {
            return `Uživatelské jméno musí mít alespoň ${APP_CONFIG.MIN_USERNAME_LENGTH} znaky`;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return 'Uživatelské jméno může obsahovat pouze písmena, číslice a podtržítka';
        }
        return null;
    },
    password: (value) => {
        if (!value)
            return null;
        if (value.length < APP_CONFIG.MIN_PASSWORD_LENGTH) {
            return `Heslo musí mít alespoň ${APP_CONFIG.MIN_PASSWORD_LENGTH} znaků`;
        }
        return null;
    }
};
export const validateSchema = (data, schema) => {
    const errors = {};
    for (const [field, validatorFunctions] of Object.entries(schema)) {
        const value = data[field];
        for (const validator of validatorFunctions) {
            const error = validator(value);
            if (error) {
                errors[field] = error;
                break; // Stop at first error for this field
            }
        }
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
// Common validation schemas
export const validationSchemas = {
    login: {
        username: [
            (value) => validators.required(value),
            validators.username
        ],
        password: [
            (value) => validators.required(value),
            validators.password
        ]
    },
    customerEmail: {
        email: [
            (value) => validators.required(value),
            validators.email
        ]
    },
    product: {
        name: [
            (value) => validators.required(value),
            (value) => validators.minLength(value, 2, 'Název produktu'),
            (value) => validators.maxLength(value, APP_CONFIG.MAX_PRODUCT_NAME_LENGTH, 'Název produktu')
        ],
        price: [
            (value) => validators.required(value),
            (value) => validators.positiveNumber(value, 'Cena')
        ],
        description: [
            (value) => validators.maxLength(value, APP_CONFIG.MAX_DESCRIPTION_LENGTH, 'Popis')
        ]
    }
};
