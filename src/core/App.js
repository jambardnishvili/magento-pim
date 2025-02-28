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
            columns: columnDefinitions,
            headerFilterLiveFilterDelay: 300,
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
        
        // Modules
        this.productTable = null;
        this.importExport = null;
        this.massActions = null;
        this.columnManager = null;
        this.eventManager = null;
        this.supabaseModule = null;
    }
    
    /**
     * Initialize the application
     */
    init() {
        try {
            // Create and initialize the ProductTable
            this.productTable = new ProductTable("#example-table", this.tableOptions);
            this.productTable.init();
            
            // Initialize modules
            this._initModules();
        } catch (error) {
            console.error("Error initializing application:", error);
            throw error;
        }
    }
    
    /**
     * Initialize all application modules
     * @private
     */
    _initModules() {
        // Create module instances
        this.importExport = new ImportExport(this.productTable);
        this.massActions = new MassActions(this.productTable);
        this.columnManager = new ColumnManager(this.productTable);
        this.eventManager = new EventManager(this.productTable);
        this.supabaseModule = new SupabaseModule(this.productTable);
        
        // Register modules with ProductTable
        this.productTable
            .registerModule(this.importExport)
            .registerModule(this.massActions)
            .registerModule(this.columnManager)
            .registerModule(this.eventManager)
            .registerModule(this.supabaseModule)
            .initModules();
    }
}