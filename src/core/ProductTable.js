/**
 * ProductTable class - Manages the Tabulator instance
 */

// Try to import Tabulator but have a fallback mechanism
let Tabulator;

try {
    // First try to import from the module
    // This should work in development and correctly bundled builds
    const module = await import('tabulator-tables');
    Tabulator = module.TabulatorFull;
} catch (e) {
    console.warn('Error importing Tabulator as module:', e);
    
    // Fallback to window global Tabulator if available (loaded from CDN)
    if (window.Tabulator) {
        console.log('Using global Tabulator from CDN');
        Tabulator = window.Tabulator;
    } else if (window.TabulatorFull) {
        console.log('Using global TabulatorFull from CDN');
        Tabulator = window.TabulatorFull;
    } else {
        console.error('Tabulator not available as module or global!');
        // Create a placeholder function that will show an error message
        Tabulator = function(selector, options) {
            document.querySelector(selector).innerHTML = 
                `<div class="alert alert-danger m-3">
                    Error: Tabulator library could not be loaded. 
                    Please check your internet connection and try refreshing the page.
                </div>`;
            
            // Return minimal API to prevent errors
            return {
                on: () => {},
                setFilter: () => {},
                clearHeaderFilter: () => {},
                clearFilter: () => {},
                redraw: () => {}
            };
        };
    }
}

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
            console.log("Initializing ProductTable...");
            this.table = new Tabulator(this.selector, this.options);
            
            // Add table instance to window for debugging
            window.table = this.table;
            
            // Setup basic table event handlers
            this._setupTableEvents();
            
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
        
        // Get module name from its constructor
        const moduleName = module.constructor.name;
        console.log(`Registering module: ${moduleName}`);
        
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
     * Setup basic table event handlers
     * @private
     */
    _setupTableEvents() {
        this.table.on("tableBuilt", () => {
            console.log("Table built successfully");
            
            // Force a redraw after a short delay
            setTimeout(() => {
                this.table.redraw(true);
                console.log("Forced table redraw");
            }, 500);
        });
        
        this.table.on("renderStarted", () => {
            console.log("Table render started");
        });
        
        this.table.on("renderComplete", () => {
            console.log("Table render complete");
        });
        
        // Add event listeners for data changes
        this.table.on("cellEdited", (cell) => {
            const row = cell.getRow();
            const data = row.getData();
            console.log("Data updated:", data);
            // Here you would typically make an API call to update the Magento backend
        });
    }
    
    /**
     * Add search filter functionality
     * @param {string} inputSelector - CSS selector for search input
     */
    setupSearch(inputSelector) {
        document.querySelector(inputSelector).addEventListener("keyup", (e) => {
            const value = e.target.value;
            this.table.setFilter(this._customFilterFunction, {value: value});
        });
    }
    
    /**
     * Custom filter function for global search
     * @private
     */
    _customFilterFunction(data, params) {
        if (!params.value) return true;
        
        const searchTerm = params.value.toLowerCase();
        
        // Search across all data properties
        for (let key in data) {
            if (typeof data[key] === "string" && data[key].toLowerCase().includes(searchTerm)) {
                return true;
            }
            if (typeof data[key] === "number" && data[key].toString().includes(searchTerm)) {
                return true;
            }
        }
        
        return false;
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