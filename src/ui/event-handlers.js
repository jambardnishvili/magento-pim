/**
 * Event handlers for product add buttons
 * 
 * Handles adding new configurable and bundle products to the table.
 */
export function setupEventHandlers(table) {
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
} 