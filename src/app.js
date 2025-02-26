/**
 * Magento PIM - Main Application Entry Point
 * 
 * This file initializes the Tabulator instance and imports all necessary modules.
 */
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { ProductVariationsModule } from './modules/ProductVariationsModule.js';
import { columnDefinitions } from './config/column-config.js';
import { sampleData } from './data/sample-data.js';
import { setupEventHandlers } from './ui/event-handlers.js';
import { setupImportExport } from './ui/import-export.js';
import { setupMassActions } from './ui/mass-actions.js';
import { setupColumnVisibility } from './ui/column-visibility.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing table...");
    initializeTable();
});

function initializeTable() {
    // Debug: Log sample data to ensure it's available
    console.log("Sample data for table:", sampleData);
    
    if (!sampleData || !Array.isArray(sampleData) || sampleData.length === 0) {
        console.error("No data available for table initialization!");
        document.getElementById("example-table").innerHTML = 
            '<div class="alert alert-warning m-3">No product data available. Please add products or import data.</div>';
        return;
    }
    
    // Register our custom module
    Tabulator.registerModule(ProductVariationsModule);
    
    // Configure table options - using only known supported options
    const tableOptions = {
        data: sampleData,
        dataTree: true,
        dataTreeStartExpanded: false,
        dataTreeSelectPropagate: true,
        height: "500px",
        layout: "fitDataFill",
        movableColumns: true,
        
        // Remove the problematic 'selectable' option
        // Row selection is already handled by rowHeader formatter
        
        // Add a persistent row ID for better data handling
        index: "id",
        
        // Debug mode to help with issues
        debugInvalidOptions: true,
        
        // Use row header for selection instead of a regular column
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
        
        // Define regular columns
        columns: columnDefinitions,
        
        // Context menu for additional functionality
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
    
    try {
        // Initialize Tabulator
        console.log("Initializing Tabulator with options:", tableOptions);
        const table = new Tabulator("#example-table", tableOptions);
        
        // Register event handlers
        table.on("tableBuilt", function() {
            console.log("Table built");
        });
        
        table.on("dataLoaded", function() {
            console.log("Data loaded");
        });
        
        table.on("renderStarted", function() {
            console.log("Table render started");
        });
        
        table.on("renderComplete", function() {
            console.log("Table render complete");
        });
        
        // Setup all UI event handlers
        setupEventHandlers(table);
        setupImportExport(table);
        setupMassActions(table);
        setupColumnVisibility(table);
        
        // Global filter functionality
        document.getElementById("filter-value").addEventListener("keyup", function() {
            table.setFilter(customFilter, {value: this.value});
        });
        
        document.getElementById("filter-clear").addEventListener("click", function() {
            document.getElementById("filter-value").value = "";
            table.clearFilter();
        });
        
        // Add event listeners for data changes
        table.on("cellEdited", function(cell) {
            const row = cell.getRow();
            const data = row.getData();
            console.log("Data updated:", data);
            // Here you would typically make an API call to update the Magento backend
        });
        
        // Export table for debugging
        window.table = table;
        
        // Force a redraw after a short delay to ensure all elements are properly sized
        setTimeout(() => {
            table.redraw(true);
            console.log("Forced table redraw");
        }, 500);
    } catch (error) {
        console.error("Error initializing Tabulator:", error);
        document.getElementById("example-table").innerHTML = 
            `<div class="alert alert-danger m-3">Error initializing table: ${error.message}</div>`;
    }
}

// Custom filter function to search across all columns
function customFilter(data, params) {
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

// Initialize tooltips if Bootstrap is available
if (typeof bootstrap !== 'undefined') {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltip => {
        new bootstrap.Tooltip(tooltip);
    });
} 