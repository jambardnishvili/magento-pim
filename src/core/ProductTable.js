/**
 * ProductTable class - Manages the Tabulator instance
 */
import { TabulatorFull as Tabulator } from 'tabulator-tables';

export class ProductTable {
    /**
     * @param {string} selector - CSS selector for table container
     * @param {Object} options - Tabulator options
     */
    constructor(selector, options) {
        this.selector = selector;
        this.options = options;
        this.table = null;
        this.modules = [];
    }
    
    /**
     * Initialize the table and create Tabulator instance
     */
    init() {
        try {
            this.table = new Tabulator(this.selector, this.options);
            
            // Add table instance to window for debugging
            window.table = this.table;
            
            return this.table;
        } catch (error) {
            console.error("Error initializing Tabulator:", error);
            document.querySelector(this.selector).innerHTML = 
                `<div class="alert alert-danger m-3">Error initializing table: ${error.message}</div>`;
            throw error;
        }
    }
    
    /**
     * Register a module with the table
     * @param {BaseModule} module - Module to register
     * @returns {ProductTable} This instance for chaining
     */
    registerModule(module) {
        if (!module) {
            console.warn("Attempted to register null or undefined module");
            return this;
        }
        
        this.modules.push(module);
        return this;
    }
    
    /**
     * Initialize all registered modules
     */
    initModules() {
        this.modules.forEach(module => {
            if (!module.isInitialized()) {
                module.init();
            }
        });
        return this;
    }
    
    /**
     * Get the Tabulator instance
     * @returns {Object} Tabulator instance
     */
    getTable() {
        return this.table;
    }
    
    /**
     * Get a module by name
     * @param {string} moduleName - Name of the module to retrieve
     * @returns {Object|null} The module instance or null if not found
     */
    getModuleByName(moduleName) {
        // Try to find the module by its class name
        for (const module of this.modules) {
            // Get the class name from the constructor
            const className = module.constructor.name;
            
            // Check if the class name matches
            if (className === moduleName) {
                return module;
            }
        }
        
        console.warn(`Module "${moduleName}" not found`);
        return null;
    }
} 