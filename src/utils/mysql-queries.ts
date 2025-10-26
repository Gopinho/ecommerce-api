/**
 * MySQL-specific query utilities for Prisma
 * Handles differences between MySQL and PostgreSQL
 */

/**
 * Create case-insensitive search condition for MySQL
 * MySQL doesn't support Prisma's mode: 'insensitive' in the same way
 */
export function createCaseInsensitiveSearch(field: string, searchTerm: string) {
    // For MySQL, we can use COLLATE or raw SQL
    // This is a simplified version - you might want to use raw SQL for complex cases
    return {
        contains: searchTerm
        // Note: MySQL is case-insensitive by default for VARCHAR fields
        // If you need case-sensitive searches, you would use COLLATE
    };
}

/**
 * Create JSON array contains search for MySQL
 * MySQL JSON functions work differently than PostgreSQL
 */
export function createJsonArrayContains(searchTerms: string[]) {
    // For MySQL JSON arrays, we need to use JSON functions
    // This is simplified - for complex JSON queries, consider raw SQL
    return {
        // MySQL JSON_SEARCH or JSON_CONTAINS would be used in raw queries
        // For now, we'll use a simpler approach
        path: searchTerms
    };
}

/**
 * Create text search conditions for MySQL
 */
export function createTextSearch(searchTerm: string) {
    return [
        { name: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { brand: { contains: searchTerm } }
        // Note: For tags JSON search in MySQL, we'd need raw SQL
        // Example: JSON_SEARCH(tags, 'one', '%term%') IS NOT NULL
    ];
}

/**
 * Create MySQL-compatible JSON filter
 */
export function createJsonFilter(field: string, operation: 'contains' | 'not_empty', value?: any) {
    switch (operation) {
        case 'not_empty':
            // For MySQL: JSON_LENGTH(field) > 0
            return {
                not: null
            };
        case 'contains':
            // For MySQL: JSON_SEARCH(field, 'one', value) IS NOT NULL
            return {
                path: [value]
            };
        default:
            return {};
    }
}

/**
 * Price range filter with proper Decimal handling
 */
export function createPriceRangeFilter(minPrice?: number, maxPrice?: number) {
    const filter: any = {};

    if (minPrice !== undefined) {
        filter.gte = minPrice;
    }

    if (maxPrice !== undefined) {
        filter.lte = maxPrice;
    }

    return Object.keys(filter).length > 0 ? filter : undefined;
}