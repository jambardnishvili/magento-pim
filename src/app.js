/**
 * Magento PIM - Main Application Entry Point
 * 
 * This file initializes the Tabulator instance and imports all necessary modules.
 */
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { columnDefinitions } from './config/column-config.js';
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
    // Configure table options - using only known supported options
    const tableOptions = {
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

// Initialize tooltips if Bootstrap is available
if (typeof bootstrap !== 'undefined') {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltip => {
        new bootstrap.Tooltip(tooltip);
    });
} 