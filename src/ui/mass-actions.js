/**
 * Mass actions for selected products
 * 
 * Provides functionality for bulk operations on selected rows.
 */
export function setupMassActions(table) {
    // Add a helper message for selecting rows
    const addSelectionHint = () => {
        const selectedRows = table.getSelectedRows();
        const massActions = document.getElementById("mass-actions");
        
        if (selectedRows.length > 0) {
            massActions.textContent = `Mass Actions (${selectedRows.length} selected)`;
        } else {
            massActions.textContent = "Mass Actions";
        }
    };
    
    // Update selection count when rows are selected/deselected
    table.on("rowSelectionChanged", function() {
        addSelectionHint();
    });
    
    // Safe row update function that handles tree structure properly
    const safeRowUpdate = (row, updateData) => {
        try {
            // Check if row exists and is valid before updating
            if (row && typeof row.update === 'function') {
                row.update(updateData);
            }
        } catch (error) {
            console.error("Error updating row:", error, row);
        }
    };
    
    // Enable mass actions for selected rows
    document.getElementById("mass-enable").addEventListener("click", function() {
        const selectedRows = table.getSelectedRows();
        if (selectedRows.length === 0) {
            alert("Please select at least one product");
            return;
        }
        
        // Process only valid rows
        selectedRows.forEach(function(row) {
            safeRowUpdate(row, {status: "enabled"});
        });
        
        // Close popup
        const massPopup = document.getElementById("mass-popup");
        massPopup.classList.remove("show");
    });
    
    // Disable mass actions for selected rows
    document.getElementById("mass-disable").addEventListener("click", function() {
        const selectedRows = table.getSelectedRows();
        if (selectedRows.length === 0) {
            alert("Please select at least one product");
            return;
        }
        
        // Process only valid rows
        selectedRows.forEach(function(row) {
            safeRowUpdate(row, {status: "disabled"});
        });
        
        // Close popup
        const massPopup = document.getElementById("mass-popup");
        massPopup.classList.remove("show");
    });
    
    // Delete mass actions for selected rows
    document.getElementById("mass-delete").addEventListener("click", function() {
        const selectedRows = table.getSelectedRows();
        if (selectedRows.length === 0) {
            alert("Please select at least one product");
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${selectedRows.length} selected products?`)) {
            // Process in reverse order to avoid index shifting issues
            // This ensures parent rows are deleted after their children
            const rowsToDelete = [...selectedRows].reverse();
            
            rowsToDelete.forEach(function(row) {
                try {
                    if (row && typeof row.delete === 'function') {
                        row.delete();
                    }
                } catch (error) {
                    console.error("Error deleting row:", error, row);
                }
            });
        }
        
        // Close popup
        const massPopup = document.getElementById("mass-popup");
        massPopup.classList.remove("show");
    });
} 