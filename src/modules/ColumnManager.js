/**
 * Column visibility management module
 */
import { BaseModule } from '../core/BaseModule.js';

export class ColumnManager extends BaseModule {
    constructor(productTable) {
        super(productTable);
    }
    
    /**
     * Initialize column visibility management
     */
    init() {
        if (this.initialized) return;
        
        // Setup column visibility dropdown
        this._setupColumnVisibility();
        
        this.initialized = true;
    }
    
    /**
     * Setup column visibility dropdown
     * @private
     */
    _setupColumnVisibility() {
        const columnSelector = document.getElementById("column-selector");
        if (!columnSelector) {
            console.warn("Column selector dropdown not found. Make sure an element with id 'column-selector' exists.");
            return;
        }
        
        columnSelector.addEventListener("shown.bs.dropdown", () => {
            this._populateColumnVisibility();
        });
    }
    
    /**
     * Create and populate column visibility checkboxes
     * @private
     */
    _populateColumnVisibility() {
        const columnPopup = document.getElementById("column-popup");
        if (!columnPopup) {
            console.warn("Column popup container not found. Make sure an element with id 'column-popup' exists.");
            return;
        }
        
        columnPopup.innerHTML = "";
        
        // Create checkboxes for each column
        this.table.getColumns().forEach(column => {
            const definition = column.getDefinition();
            const title = definition.title;
            
            if (!title) return; // Skip columns without titles
            
            const field = definition.field;
            const isEssential = ["name", "sku", "type"].includes(field);
            
            const label = document.createElement("label");
            label.className = "form-check";
            label.style.display = "block";
            label.style.margin = "5px 0";
            
            const checkbox = document.createElement("input");
            checkbox.className = "form-check-input";
            checkbox.type = "checkbox";
            checkbox.checked = column.isVisible();
            checkbox.disabled = isEssential; // Prevent hiding essential columns
            
            checkbox.addEventListener("change", () => {
                column.toggle();
            });
            
            const labelText = document.createTextNode(" " + title);
            
            // Add a special marker for essential columns
            if (isEssential) {
                const badge = document.createElement("span");
                badge.className = "badge bg-secondary ms-2";
                badge.textContent = "Required";
                
                label.appendChild(checkbox);
                label.appendChild(labelText);
                label.appendChild(badge);
            } else {
                label.appendChild(checkbox);
                label.appendChild(labelText);
            }
            
            columnPopup.appendChild(label);
        });
    }
} 