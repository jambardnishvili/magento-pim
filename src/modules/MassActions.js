/**
 * Mass actions module for handling operations on selected rows
 */
import { BaseModule } from '../core/BaseModule.js';

export class MassActions extends BaseModule {
    constructor(productTable) {
        super(productTable);
    }
    
    /**
     * Initialize mass actions functionality
     */
    init() {
        if (this.initialized) return;
        
        // Setup table selection event
        this.table.on("rowSelectionChanged", () => this._updateSelectionCount());
        
        // Setup action buttons
        this._setupActionButtons();
        
        this.initialized = true;
    }
    
    /**
     * Setup mass action buttons
     * @private
     */
    _setupActionButtons() {
        // Enable selected products
        const massEnableBtn = document.getElementById("mass-enable");
        const massDisableBtn = document.getElementById("mass-disable");
        const massDeleteBtn = document.getElementById("mass-delete");
        
        if (!massEnableBtn) {
            console.warn("Mass enable button not found. Make sure an element with id 'mass-enable' exists.");
        } else {
            massEnableBtn.addEventListener("click", () => {
                this._performMassAction(row => ({ status: "enabled" }));
            });
        }
        
        if (!massDisableBtn) {
            console.warn("Mass disable button not found. Make sure an element with id 'mass-disable' exists.");
        } else {
            massDisableBtn.addEventListener("click", () => {
                this._performMassAction(row => ({ status: "disabled" }));
            });
        }
        
        if (!massDeleteBtn) {
            console.warn("Mass delete button not found. Make sure an element with id 'mass-delete' exists.");
        } else {
            massDeleteBtn.addEventListener("click", () => {
                const selectedRows = this.table.getSelectedRows();
                
                if (selectedRows.length === 0) {
                    alert("Please select at least one product");
                    return;
                }
                
                if (confirm(`Are you sure you want to delete ${selectedRows.length} selected products?`)) {
                    // Process in reverse order to avoid index shifting issues
                    const rowsToDelete = [...selectedRows].reverse();
                    
                    rowsToDelete.forEach(row => {
                        try {
                            row.delete();
                        } catch (error) {
                            console.error("Error deleting row:", error, row);
                        }
                    });
                }
                
                // Close popup
                const massPopup = document.getElementById("mass-popup");
                if (massPopup && massPopup.classList.contains("show")) {
                    massPopup.classList.remove("show");
                }
            });
        }
    }
    
    /**
     * Update the selection count in the mass actions button
     * @private
     */
    _updateSelectionCount() {
        const selectedRows = this.table.getSelectedRows();
        const massActions = document.getElementById("mass-actions");
        
        if (!massActions) {
            console.warn("Mass actions button not found. Make sure an element with id 'mass-actions' exists.");
            return;
        }
        
        if (selectedRows.length > 0) {
            massActions.textContent = `Mass Actions (${selectedRows.length} selected)`;
        } else {
            massActions.textContent = "Mass Actions";
        }
    }
    
    /**
     * Perform a mass action on selected rows
     * @private
     * @param {Function} actionFn - Function that returns data to update for each row
     */
    _performMassAction(actionFn) {
        const selectedRows = this.table.getSelectedRows();
        
        if (selectedRows.length === 0) {
            alert("Please select at least one product");
            return;
        }
        
        // Apply the action to each selected row
        selectedRows.forEach(row => {
            try {
                const updateData = actionFn(row);
                row.update(updateData);
            } catch (error) {
                console.error("Error updating row:", error, row);
            }
        });
        
        // Close popup
        const massPopup = document.getElementById("mass-popup");
        if (massPopup.classList.contains("show")) {
            massPopup.classList.remove("show");
        }
    }
} 