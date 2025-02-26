/**
 * Column definitions for the Tabulator table
 * 
 * This file contains all the column configuration for the Magento product grid.
 */
export const columnDefinitions = [
    {
        title: "Name",
        field: "name",
        editor: "input",
        widthGrow: 2,
        headerFilter: "input",
        tooltip: true
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
            symbol: "$",
            precision: 2
        },
        headerFilter: "number",
        cssClass: "price-column"
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
                element.style.color = "#dc3545"; // Red for out of stock (Bootstrap danger)
                element.style.fontWeight = "bold";
            } else if (value < 10) {
                element.style.color = "#fd7e14"; // Orange for low stock (Bootstrap warning)
            } else {
                element.style.color = "#198754"; // Green for good stock (Bootstrap success)
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
        },
        formatter: function(cell) {
            const value = cell.getValue();
            if (!value) return "";
            
            if (value === "enabled") {
                return "<span class='badge bg-success'>Enabled</span>";
            } else {
                return "<span class='badge bg-secondary'>Disabled</span>";
            }
        },
        formatterParams: {
            allowHTML: true
        }
    }
]; 