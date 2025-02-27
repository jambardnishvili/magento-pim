/**
 * Event manager module for handling product creation events
 */
import { BaseModule } from '../core/BaseModule.js';

export class EventManager extends BaseModule {
    constructor(productTable) {
        super(productTable);
    }
    
    /**
     * Initialize event handlers
     */
    init() {
        if (this.initialized) return;
        
        // Setup add product buttons
        this._setupAddProductButtons();
        
        this.initialized = true;
    }
    
    /**
     * Setup event handlers for add product buttons
     * @private
     */
    _setupAddProductButtons() {
        // Add configurable product button
        const addConfigBtn = document.getElementById("add-configurable");
        const addBundleBtn = document.getElementById("add-bundle");
        
        if (!addConfigBtn) {
            console.warn("Add configurable product button not found. Make sure an element with id 'add-configurable' exists.");
        } else {
            addConfigBtn.addEventListener("click", () => {
                this._addProduct("Configurable Product", "configurable", "CONF");
            });
        }
        
        if (!addBundleBtn) {
            console.warn("Add bundle product button not found. Make sure an element with id 'add-bundle' exists.");
        } else {
            addBundleBtn.addEventListener("click", () => {
                this._addProduct("Bundle Product", "bundle", "BDL");
            });
        }
    }
    
    /**
     * Add a new product to the table
     * @private
     * @param {string} name - Product name
     * @param {string} type - Product type
     * @param {string} skuPrefix - Prefix for the SKU
     */
    _addProduct(name, type, skuPrefix) {
        const newProductId = "new-" + Math.floor(Math.random() * 10000);
        const newProduct = {
            id: newProductId,
            name: `New ${name}`,
            sku: `${skuPrefix}-${newProductId}`,
            type: type,
            price: 0,
            status: "enabled",
            _children: []
        };
        
        this.table.addData([newProduct])
        .then(() => {
            // Expand the newly added row
            const row = this.table.getRow(newProductId);
            if (row) {
                row.treeExpand();
                // Scroll to the new row
                this.table.scrollToRow(row, "top", true);
            }
        })
        .catch(error => {
            console.error(`Error adding ${type} product:`, error);
        });
    }
} 