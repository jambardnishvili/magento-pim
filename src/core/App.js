/**
 * Main application class
 */
import { ProductTable } from './ProductTable.js';
import { ImportExport } from '../modules/ImportExport.js';
import { MassActions } from '../modules/MassActions.js';
import { ColumnManager } from '../modules/ColumnManager.js';
import { EventManager } from '../modules/EventManager.js';
import { SupabaseModule } from '../modules/SupabaseModule.js';
import { columnDefinitions } from '../config/ColumnConfig.js';

export class App {
    constructor() {
        // Define table configuration
        this.tableOptions = {
            data: [],
            dataTree: true,
            dataTreeStartExpanded: false,
            dataTreeSelectPropagate: true,
            height: "500px",
            layout: "fitDataFill",
            movableColumns: true,
            index: "id",
            debugInvalidOptions: true,
            rowHeader: {
                formatter: "rowSelection",
                titleFormatter: "rowSelection",
                headerSort: false,
                resizable: false,
                hozAlign: "center",
                frozen: true,
                width: 60,
                cssClass: "row-selection-column"
            },
            columns: columnDefinitions,
            headerFilterLiveFilterDelay: 300,
            headerFilterPlaceholder: "Filter...",
            rowContextMenu: [
                {
                    label: "Add Child Product",
                    action: function(e, row) {
                        const data = row.getData();
                        const newChildId = `${data.id}-${Math.floor(Math.random() * 10000)}`;
                        
                        if (data.type === "configurable") {
                            row.getTable().addData([{
                                id: newChildId,
                                name: data.name + " - New Variation",
                                sku: data.sku + "-NEW",
                                type: "simple",
                                price: data.price,
                                _parent: data.id
                            }]);
                        }
                        
                        // Expand the parent row if it's not already expanded
                        row.treeExpand();
                    }
                },
                {
                    label: "Delete Product",
                    action: function(e, row) {
                        if (confirm("Are you sure you want to delete this product?")) {
                            row.delete();
                        }
                    }
                }
            ]
        };
        
        this.productTable = null;
        this.appContainer = document.getElementById('app-container');
        this.errorContainer = document.getElementById('error-container');
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log("Initializing application...");
            
            // Create connection to database first
            const supabaseModule = new SupabaseModule(null); // No productTable yet
            const connectionResult = await supabaseModule.testConnection();
            
            if (!connectionResult.success) {
                this._showFatalError(connectionResult.message || "Failed to connect to database");
                return false;
            }
            
            // Only proceed with application initialization if database connection works
            this._showAppInterface();
            
            // Create product table
            this.productTable = new ProductTable("#example-table", this.tableOptions);
            
            // Initialize modules (with the properly tested supabaseModule)
            supabaseModule.setProductTable(this.productTable);
            this._initModules(supabaseModule);
            
            // Add event listeners after everything is ready
            this._setupSearch();
            this._setupClearFilters();
            
            console.log("Application initialized successfully");
            return true;
        } catch (error) {
            console.error("Error initializing application:", error);
            this._showFatalError(error.message || "Failed to initialize application");
            return false;
        }
    }
    
    /**
     * Initialize all application modules
     * @private
     * @param {SupabaseModule} supabaseModule - Pre-initialized Supabase module
     */
    _initModules(supabaseModule) {
        // Create module instances
        this.importExport = new ImportExport(this.productTable);
        this.massActions = new MassActions(this.productTable);
        this.columnManager = new ColumnManager(this.productTable);
        this.eventManager = new EventManager(this.productTable);
        this.supabaseModule = supabaseModule;
        
        // Register modules with ProductTable
        this.productTable
            .registerModule(this.importExport)
            .registerModule(this.massActions)
            .registerModule(this.columnManager)
            .registerModule(this.eventManager)
            .registerModule(this.supabaseModule)
            .initModules();
    }
    
    /**
     * Display a fatal error that prevents app usage
     * @private
     * @param {string} message - Error message to display
     */
    _showFatalError(message) {
        console.error("FATAL ERROR:", message);
        
        // Hide app container
        if (this.appContainer) {
            this.appContainer.style.display = 'none';
        }
        
        // Show error container with message
        if (!this.errorContainer) {
            // Create error container if it doesn't exist
            this.errorContainer = document.createElement('div');
            this.errorContainer.id = 'error-container';
            this.errorContainer.className = 'container-fluid mt-5 text-center';
            document.body.appendChild(this.errorContainer);
        }
        
        this.errorContainer.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card border-danger">
                        <div class="card-header bg-danger text-white">
                            <h3><i class="bi bi-exclamation-triangle"></i> Database Connection Error</h3>
                        </div>
                        <div class="card-body">
                            <p class="card-text fs-5">${message}</p>
                            <p class="card-text mt-3">Please check your database configuration and refresh the page.</p>
                            <button id="refresh-btn" class="btn btn-primary mt-3">
                                <i class="bi bi-arrow-clockwise"></i> Retry Connection
                            </button>
                        </div>
                        <div class="card-footer text-muted">
                            <small>If the problem persists, please contact support.</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.errorContainer.style.display = 'block';
        
        // Add refresh button functionality
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }
    
    /**
     * Show the main application interface
     * @private
     */
    _showAppInterface() {
        if (this.errorContainer) {
            this.errorContainer.style.display = 'none';
        }
        
        if (this.appContainer) {
            this.appContainer.style.display = 'block';
        }
    }
    
    /**
     * Setup clear filters button
     * @private
     */
    _setupClearFilters() {
        const clearFiltersBtn = document.getElementById("clear-filters");
        if (!clearFiltersBtn) {
            console.warn("Clear filters button not found in the DOM. Make sure it exists with id 'clear-filters'");
            return;
        }
        
        clearFiltersBtn.addEventListener("click", () => {
            this.productTable.getTable().clearHeaderFilter();
            const searchInput = document.getElementById("search-input");
            if (searchInput) searchInput.value = "";
            this.productTable.getTable().clearFilter();
        });
    }
} 