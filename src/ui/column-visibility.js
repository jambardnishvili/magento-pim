/**
 * Column visibility management
 * 
 * Manages which columns are displayed in the table.
 */
export function setupColumnVisibility(table) {
    // Setup column visibility controls is handled by Bootstrap
    // We just need to populate the dropdown with column options
    
    // Clear existing checkboxes and populate with current columns
    function populateColumnVisibility() {
        const columnPopup = document.getElementById("column-popup");
        columnPopup.innerHTML = "";
        
        // Create checkboxes for each column
        table.getColumns().forEach(function(column) {
            const field = column.getField();
            const title = column.getDefinition().title;
            
            if (!title) return; // Skip columns without titles
            
            const label = document.createElement("label");
            label.className = "form-check";
            label.style.display = "block";
            label.style.margin = "5px 0";
            
            const checkbox = document.createElement("input");
            checkbox.className = "form-check-input";
            checkbox.type = "checkbox";
            checkbox.checked = column.isVisible();
            checkbox.addEventListener("change", function() {
                column.toggle();
            });
            
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" " + title));
            columnPopup.appendChild(label);
        });
    }
    
    // Populate column visibility menu when dropdown is opened
    document.getElementById("column-selector").addEventListener("shown.bs.dropdown", function() {
        populateColumnVisibility();
    });
} 