import {Module} from 'tabulator-tables';

export class ProductVariationsModule extends Module {
    static moduleName = "productVariations";

    constructor(table) {
        super(table);
        this.registerTableOption("productType", ""); // configurable or bundle
        this.registerTableOption("validateOnEdit", true);
    }

    initialize() {
        // Add custom formatters and cell editors specific to product variations
        this.registerColumnOption("attributeSet");
        this.registerColumnOption("variationType");
        
        // Add validation event handlers
        if (this.table.options.validateOnEdit) {
            this.subscribe("cell-value-changed", this.validateCellValue.bind(this));
        }
    }
    
    validateCellValue(cell) {
        const field = cell.getField();
        const value = cell.getValue();
        const row = cell.getRow();
        const data = row.getData();
        
        let isValid = true;
        let message = "";
        
        // SKU validation
        if (field === "sku") {
            if (!value || value.trim() === "") {
                isValid = false;
                message = "SKU cannot be empty";
            } else if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
                isValid = false;
                message = "SKU can only contain letters, numbers, hyphens and underscores";
            }
        }
        
        // Price validation
        if (field === "price") {
            if (value < 0) {
                isValid = false;
                message = "Price cannot be negative";
            }
        }
        
        // Qty validation
        if (field === "qty") {
            if (value < 0) {
                isValid = false;
                message = "Quantity cannot be negative";
            }
        }
        
        // Name validation
        if (field === "name") {
            if (!value || value.trim() === "") {
                isValid = false;
                message = "Name cannot be empty";
            }
        }
        
        // Show validation message if invalid
        if (!isValid) {
            this.showValidationError(cell, message);
        }
        
        return isValid;
    }
    
    showValidationError(cell, message) {
        // Highlight the cell
        cell.getElement().style.backgroundColor = "#ffeeee";
        
        // Create tooltip element
        const tooltip = document.createElement("div");
        tooltip.className = "validation-tooltip";
        tooltip.innerHTML = message;
        tooltip.style.position = "absolute";
        tooltip.style.backgroundColor = "#dc3545";
        tooltip.style.color = "white";
        tooltip.style.padding = "5px 10px";
        tooltip.style.borderRadius = "4px";
        tooltip.style.fontSize = "12px";
        
        // Position the tooltip near the cell
        const rect = cell.getElement().getBoundingClientRect();
        tooltip.style.top = (rect.bottom + window.scrollY + 5) + "px";
        tooltip.style.left = (rect.left + window.scrollX) + "px";
        
        document.body.appendChild(tooltip);
        
        // Remove tooltip after a delay
        setTimeout(() => {
            document.body.removeChild(tooltip);
            cell.getElement().style.backgroundColor = "";
        }, 3000);
    }
} 