import { Decimal } from '@prisma/client/runtime/library';

/**
 * Utility functions for working with Prisma Decimal type in MySQL
 */

/**
 * Convert Decimal to number for calculations
 */
export function decimalToNumber(decimal: Decimal | number): number {
    if (typeof decimal === 'number') {
        return decimal;
    }
    return decimal.toNumber();
}

/**
 * Convert number to Decimal for database operations
 */
export function numberToDecimal(num: number): Decimal {
    return new Decimal(num);
}

/**
 * Safely add two decimal values
 */
export function addDecimals(a: Decimal | number, b: Decimal | number): number {
    return decimalToNumber(a) + decimalToNumber(b);
}

/**
 * Safely multiply decimal values
 */
export function multiplyDecimals(a: Decimal | number, b: Decimal | number): number {
    return decimalToNumber(a) * decimalToNumber(b);
}

/**
 * Convert Decimal to formatted currency string
 */
export function formatCurrency(decimal: Decimal | number, currency = '€'): string {
    const num = decimalToNumber(decimal);
    return `${currency}${num.toFixed(2)}`;
}

/**
 * Compare decimal values
 */
export function compareDecimals(a: Decimal | number, b: Decimal | number): number {
    const numA = decimalToNumber(a);
    const numB = decimalToNumber(b);

    if (numA < numB) return -1;
    if (numA > numB) return 1;
    return 0;
}

/**
 * Check if decimal is less than another
 */
export function isLessThan(a: Decimal | number, b: Decimal | number): boolean {
    return decimalToNumber(a) < decimalToNumber(b);
}

/**
 * Check if decimal is greater than another
 */
export function isGreaterThan(a: Decimal | number, b: Decimal | number): boolean {
    return decimalToNumber(a) > decimalToNumber(b);
}