// Shared validation utilities

// ValidationError is imported but not used directly in this file
import { APP_CONFIG, UI_MESSAGES } from './constants';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validators = {
  required: (value: any): string | null => {
    if (value === null || value === undefined || value === '') {
      return UI_MESSAGES.REQUIRED_FIELD;
    }
    return null;
  },

  email: (value: string): string | null => {
    if (!value) return null; // Let required validator handle empty values
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return UI_MESSAGES.INVALID_EMAIL;
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (!value) return null; // Let required validator handle empty values
    
    if (value.length < min) {
      return `${fieldName} musí mít alespoň ${min} znaků`;
    }
    return null;
  },

  maxLength: (value: string, max: number, fieldName: string): string | null => {
    if (!value) return null;
    
    if (value.length > max) {
      return `${fieldName} může mít maximálně ${max} znaků`;
    }
    return null;
  },

  positiveNumber: (value: number, fieldName: string): string | null => {
    if (value === null || value === undefined) return null;
    
    if (value <= 0) {
      return `${fieldName} musí být větší než 0`;
    }
    return null;
  },

  username: (value: string): string | null => {
    if (!value) return null;
    
    if (value.length < APP_CONFIG.MIN_USERNAME_LENGTH) {
      return `Uživatelské jméno musí mít alespoň ${APP_CONFIG.MIN_USERNAME_LENGTH} znaky`;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Uživatelské jméno může obsahovat pouze písmena, číslice a podtržítka';
    }
    
    return null;
  },

  password: (value: string): string | null => {
    if (!value) return null;
    
    if (value.length < APP_CONFIG.MIN_PASSWORD_LENGTH) {
      return `Heslo musí mít alespoň ${APP_CONFIG.MIN_PASSWORD_LENGTH} znaků`;
    }
    
    return null;
  },

  kioskId: (value: number): string | null => {
    if (value === null || value === undefined) return null;
    
    if (!Number.isInteger(value) || value <= 0) {
      return 'Kiosk ID musí být kladné celé číslo';
    }
    
    return null;
  },

  quantity: (value: number, fieldName: string = 'Množství'): string | null => {
    if (value === null || value === undefined) return null;
    
    if (!Number.isInteger(value) || value < 0) {
      return `${fieldName} musí být nezáporné celé číslo`;
    }
    
    return null;
  },

  price: (value: number, fieldName: string = 'Cena'): string | null => {
    if (value === null || value === undefined) return null;
    
    if (isNaN(value) || value <= 0) {
      return `${fieldName} musí být kladné číslo`;
    }
    
    // Check for reasonable price range (0.01 to 999999.99)
    if (value < 0.01 || value > 999999.99) {
      return `${fieldName} musí být v rozsahu 0,01 - 999 999,99 Kč`;
    }
    
    // Check for precision (max 2 decimal places)
    const rounded = Math.round(value * 100) / 100;
    if (Math.abs(value - rounded) > 0.001) {
      return `${fieldName} může mít maximálně 2 desetinná místa`;
    }
    
    return null;
  }
};

// Schema-based validation
export interface ValidationSchema {
  [field: string]: Array<(value: any) => string | null>;
}

export const validateSchema = (data: Record<string, any>, schema: ValidationSchema): ValidationResult => {
  const errors: Record<string, string> = {};

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
      (value: any) => validators.required(value),
      validators.username
    ],
    password: [
      (value: any) => validators.required(value),
      validators.password
    ]
  },

  customerEmail: {
    email: [
      (value: any) => validators.required(value),
      validators.email
    ]
  },

  product: {
    name: [
      (value: any) => validators.required(value),
      (value: any) => validators.minLength(value, 2, 'Název produktu'),
      (value: any) => validators.maxLength(value, APP_CONFIG.MAX_PRODUCT_NAME_LENGTH, 'Název produktu')
    ],
    price: [
      (value: any) => validators.required(value),
      validators.price
    ],
    description: [
      (value: any) => validators.maxLength(value, APP_CONFIG.MAX_DESCRIPTION_LENGTH, 'Popis')
    ]
  },

  kioskId: {
    kioskId: [
      (value: any) => validators.required(value),
      validators.kioskId
    ]
  },

  inventory: {
    quantityInStock: [
      (value: any) => validators.required(value),
      validators.quantity
    ]
  },

  payment: {
    productId: [
      (value: any) => validators.required(value),
      (value: any) => validators.positiveNumber(value, 'ID produktu')
    ],
    kioskId: [
      (value: any) => validators.required(value),
      validators.kioskId
    ],
    amount: [
      (value: any) => validators.required(value),
      validators.price
    ]
  }
};
