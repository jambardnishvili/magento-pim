/**
 * Base class for all modules in the application
 * Provides common functionality and structure
 */
export class BaseModule {
    /**
     * @param {ProductTable} productTable - Reference to the ProductTable instance
     */
    constructor(productTable) {
        this.productTable = productTable;
        this.table = productTable.getTable();
        this.initialized = false;
    }
    
    /**
     * Initialize the module - must be implemented by subclasses
     */
    init() {
        throw new Error("Module must implement init() method");
    }
    
    /**
     * Get the table instance
     * @returns {Object} Tabulator instance
     */
    getTable() {
        return this.table;
    }
    
    /**
     * Check if the module has been initialized
     * @returns {boolean}
     */
    isInitialized() {
        return this.initialized;
    }
} 