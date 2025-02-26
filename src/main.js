import {TabulatorFull as Tabulator} from 'tabulator-tables';
import ProductVariationsModule from './modules/ProductVariationsModule';
import Papa from 'papaparse';

// Register our custom module
Tabulator.registerModule(ProductVariationsModule);

// Sample data structure for configurable products
const configurableProducts = [
    {
        id: "1",
        name: "Classic T-Shirt",
        sku: "TS-CLASSIC",
        type: "configurable",
        price: 19.99,
        status: "enabled",
        _children: [
            {
                id: "1-1",
                name: "Classic T-Shirt - Black, S",
                sku: "TS-CLASSIC-BLACK-S",
                color: "Black",
                size: "S",
                price: 19.99,
                qty: 100
            },
            {
                id: "1-2",
                name: "Classic T-Shirt - Black, M",
                sku: "TS-CLASSIC-BLACK-M",
                color: "Black",
                size: "M",
                price: 19.99,
                qty: 150
            },
            {
                id: "1-3",
                name: "Classic T-Shirt - White, S",
                sku: "TS-CLASSIC-WHITE-S",
                color: "White",
                size: "S",
                price: 19.99,
                qty: 75
            }
        ]
    },
    {
        id: "2",
        name: "Gaming PC Bundle",
        sku: "PC-BUNDLE-GAMING",
        type: "bundle",
        price: 1499.99,
        status: "enabled",
        _children: [
            {
                id: "2-1",
                name: "Gaming Monitor",
                sku: "MON-GAMING-27",
                option_title: "Display",
                is_required: true,
                qty: 1,
                price: 299.99
            },
            {
                id: "2-2",
                name: "Gaming Desktop",
                sku: "PC-GAMING-RTX",
                option_title: "Computer",
                is_required: true,
                qty: 1,
                price: 999.99
            },
            {
                id: "2-3",
                name: "Gaming Keyboard",
                sku: "KB-GAMING-RGB",
                option_title: "Accessories",
                is_required: false,
                qty: 1,
                price: 99.99
            }
        ]
    }
];

// Create Tabulator instance
const table = new Tabulator("#example-table", {
    data: configurableProducts,
    dataTree: true,
    dataTreeStartExpanded: false,
    height: "500px",
    layout: "fitDataFill",
    columns: [
        {
            title: "Name",
            field: "name",
            editor: "input",
            widthGrow: 2,
            headerFilter: "input"
        },
        {
            title: "SKU",
            field: "sku",
            editor: "input",
            headerFilter: "input"
        },
        {
            title: "Type",
            field: "type",
            editor: "list",
            editorParams: {
                values: ["configurable", "bundle", "simple"]
            },
            headerFilter: "list",
            headerFilterParams: {
                values: ["configurable", "bundle", "simple"]
            }
        },
        {
            title: "Color",
            field: "color",
            editor: "list",
            editorParams: {
                values: ["Black", "White", "Red", "Blue"]
            },
            headerFilter: "list",
            headerFilterParams: {
                values: ["Black", "White", "Red", "Blue"]
            }
        },
        {
            title: "Size",
            field: "size",
            editor: "list",
            editorParams: {
                values: ["XS", "S", "M", "L", "XL"]
            },
            headerFilter: "list",
            headerFilterParams: {
                values: ["XS", "S", "M", "L", "XL"]
            }
        },
        {
            title: "Option",
            field: "option_title",
            editor: "input",
            headerFilter: "input"
        },
        {
            title: "Required",
            field: "is_required",
            editor: "tickCross",
            formatter: "tickCross",
            hozAlign: "center"
        },
        {
            title: "Price",
            field: "price",
            editor: "number",
            formatter: "money",
            formatterParams: {
                symbol: "$"
            },
            headerFilter: "number"
        },
        {
            title: "Qty",
            field: "qty",
            editor: "number",
            headerFilter: "number",
            formatter: function(cell) {
                const value = cell.getValue();
                if (value === null || value === undefined) return "";
                
                // Get cell element
                const element = cell.getElement();
                
                // Apply conditional formatting
                if (value <= 0) {
                    element.style.color = "#FF0000"; // Red for out of stock
                    element.style.fontWeight = "bold";
                } else if (value < 10) {
                    element.style.color = "#FFA500"; // Orange for low stock
                } else {
                    element.style.color = "#28a745"; // Green for good stock
                }
                
                return value;
            }
        },
        {
            title: "Status",
            field: "status",
            editor: "list",
            editorParams: {
                values: ["enabled", "disabled"]
            },
            headerFilter: "list",
            headerFilterParams: {
                values: ["enabled", "disabled"]
            }
        }
    ],
    rowContextMenu: [
        {
            label: "Add Variation",
            action: function(e, row) {
                const parentData = row.getData();
                if (parentData.type === "configurable") {
                    row.addTreeChild({
                        name: parentData.name + " - New Variation",
                        sku: parentData.sku + "-NEW",
                        price: parentData.price,
                        qty: 0
                    });
                }
            }
        },
        {
            label: "Add Bundle Option",
            action: function(e, row) {
                const parentData = row.getData();
                if (parentData.type === "bundle") {
                    row.addTreeChild({
                        name: "New Bundle Option",
                        sku: "NEW-BUNDLE-OPTION",
                        option_title: "New Option",
                        is_required: false,
                        qty: 1,
                        price: 0
                    });
                }
            }
        },
        {
            label: "Delete",
            action: function(e, row) {
                row.delete();
            }
        }
    ]
});

// Add event listeners for data changes
table.on("cellEdited", function(cell) {
    const row = cell.getRow();
    const data = row.getData();
    console.log("Data updated:", data);
    // Here you would typically make an API call to update the Magento backend
});

// Implement Add Product buttons functionality
document.getElementById("add-configurable").addEventListener("click", function() {
    const newProductId = "new-" + Math.floor(Math.random() * 10000);
    table.addData([{
        id: newProductId,
        name: "New Configurable Product",
        sku: "CONF-" + newProductId,
        type: "configurable",
        price: 0,
        status: "enabled",
        _children: []
    }])
    .then(function() {
        // Expand the newly added row
        const row = table.getRow(newProductId);
        if (row) {
            row.treeExpand();
            // Scroll to the new row
            table.scrollToRow(row, "top", true);
        }
    });
});

document.getElementById("add-bundle").addEventListener("click", function() {
    const newProductId = "new-" + Math.floor(Math.random() * 10000);
    table.addData([{
        id: newProductId,
        name: "New Bundle Product",
        sku: "BDL-" + newProductId,
        type: "bundle",
        price: 0,
        status: "enabled",
        _children: []
    }])
    .then(function() {
        // Expand the newly added row
        const row = table.getRow(newProductId);
        if (row) {
            row.treeExpand();
            // Scroll to the new row
            table.scrollToRow(row, "top", true);
        }
    });
});

// Add import/export functionality
document.getElementById("export-csv").addEventListener("click", function() {
    table.download("csv", "magento_products.csv");
});

document.getElementById("export-json").addEventListener("click", function() {
    table.download("json", "magento_products.json");
});

document.getElementById("import-data").addEventListener("click", function() {
    document.getElementById("import-file").click();
});

document.getElementById("import-file").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const fileExt = file.name.split(".").pop().toLowerCase();
            let data;
            
            if (fileExt === "json") {
                data = JSON.parse(e.target.result);
                importProductData(data);
            } else if (fileExt === "csv") {
                // For CSV, we need to parse it
                Papa.parse(e.target.result, {
                    header: true,
                    complete: function(results) {
                        importProductData(results.data);
                    }
                });
            }
        } catch (error) {
            alert("Error importing data: " + error.message);
        }
    };
    
    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsText(file);
    }
});

function importProductData(data) {
    // Process data to ensure correct structure for tree data
    const processedData = processImportedData(data);
    
    // Clear current data and load new data
    table.setData(processedData)
    .then(function() {
        alert("Data imported successfully!");
    })
    .catch(function(error) {
        alert("Error importing data: " + error.message);
    });
}

function processImportedData(data) {
    // This function would organize flat data into a parent-child structure
    // For simplicity, we assume the data is already in the correct format
    return data;
}

// Setup column visibility controls
const columnSelector = document.getElementById("column-selector");
const columnPopup = document.getElementById("column-popup");

// Toggle column visibility popup
columnSelector.addEventListener("click", function() {
    if (columnPopup.style.display === "none") {
        // Position the popup below the button
        const rect = columnSelector.getBoundingClientRect();
        columnPopup.style.top = (rect.bottom + window.scrollY) + "px";
        columnPopup.style.left = (rect.left + window.scrollX) + "px";
        
        // Clear existing checkboxes
        columnPopup.innerHTML = "";
        
        // Create checkboxes for each column
        table.getColumns().forEach(function(column) {
            const field = column.getField();
            const title = column.getDefinition().title;
            
            if (!title) return; // Skip columns without titles
            
            const label = document.createElement("label");
            label.style.display = "block";
            label.style.margin = "5px 0";
            
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = column.isVisible();
            checkbox.addEventListener("change", function() {
                column.toggle();
            });
            
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" " + title));
            columnPopup.appendChild(label);
        });
        
        columnPopup.style.display = "block";
    } else {
        columnPopup.style.display = "none";
    }
});

// Close popup when clicking outside
document.addEventListener("click", function(e) {
    if (e.target !== columnSelector && !columnPopup.contains(e.target)) {
        columnPopup.style.display = "none";
    }
});