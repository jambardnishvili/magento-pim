/**
 * Import/Export module for handling data import and export
 */
import { BaseModule } from '../core/BaseModule.js';
import Papa from 'papaparse';
import { transformMagentoData } from '../utils/DataTransformer.js';

export class ImportExport extends BaseModule {
    constructor(productTable) {
        super(productTable);
    }
    
    /**
     * Initialize the import/export functionality
     */
    init() {
        if (this.initialized) return;
        
        // Setup export functionality
        this._setupExport();
        
        // Setup import functionality
        this._setupImport();
        
        this.initialized = true;
    }
    
    /**
     * Setup export button handlers
     * @private
     */
    _setupExport() {
        const exportBtn = document.getElementById("export-csv");
        if (!exportBtn) {
            console.warn("Export CSV button not found. Make sure an element with id 'export-csv' exists.");
            return;
        }
        
        exportBtn.addEventListener("click", () => {
            this.table.download("csv", "magento_products.csv", {
                delimiter: ",",
                bom: true
            });
        });
    }
    
    /**
     * Setup import button handlers
     * @private
     */
    _setupImport() {
        const importBtn = document.getElementById("import-data");
        const importFile = document.getElementById("import-file");
        
        if (!importBtn) {
            console.warn("Import button not found. Make sure an element with id 'import-data' exists.");
            return;
        }
        
        if (!importFile) {
            console.warn("Import file input not found. Make sure an element with id 'import-file' exists.");
            return;
        }

        importBtn.addEventListener("click", () => {
            importFile.click();
        });

        importFile.addEventListener("change", (e) => this._handleFileImport(e));
    }
    
    /**
     * Handle file import from file input
     * @private
     * @param {Event} e - Change event from file input
     */
    _handleFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => this._parseImportFile(e.target.result);
        reader.readAsText(file);
        
        // Reset file input
        e.target.value = "";
    }
    
    /**
     * Parse imported file content
     * @private
     * @param {string} content - File content
     */
    _parseImportFile(content) {
        try {
            Papa.parse(content, {
                header: true,
                dynamicTyping: false,
                skipEmptyLines: true,
                complete: (results) => this._handleParseComplete(results),
                error: (error) => {
                    alert("Error parsing CSV: " + error.message);
                    console.error("CSV parse error:", error);
                }
            });
        } catch (error) {
            alert("Error importing data: " + error.message);
            console.error("Import error:", error);
        }
    }
    
    /**
     * Handle completion of CSV parsing
     * @private
     * @param {Object} results - PapaParse results
     */
    _handleParseComplete(results) {
        if (results.errors && results.errors.length > 0) {
            console.warn("CSV parsing had errors:", results.errors);
        }
        
        const isMagentoFormat = this._detectMagentoFormat(results.data);
        if (isMagentoFormat) {
            console.log("Detected Magento CSV format");
            console.log(`CSV contains ${results.data.length} rows`);
            this._importMagentoData(results.data);
        } else {
            alert("CSV is not in the correct Magento format");
        }
    }
    
    /**
     * Detect if data is in Magento format
     * @private
     * @param {Array} data - Parsed CSV data
     * @returns {boolean} True if data appears to be in Magento format
     */
    _detectMagentoFormat(data) {
        if (!data || data.length === 0) return false;
        
        // Check for common Magento product export fields
        const magentoFields = ["sku", "product_type", "configurable_variations", "visibility"];
        const keys = Object.keys(data[0]);
        
        return magentoFields.some(field => keys.includes(field));
    }
    
    /**
     * Import Magento data into table
     * @private
     * @param {Array} data - Parsed CSV data
     */
    _importMagentoData(data) {
        try {
            console.log("Processing Magento product data...");
            
            // Transform Magento data to Tabulator format
            const transformedData = transformMagentoData(data);
            
            if (!transformedData || transformedData.length === 0) {
                console.warn("No valid products found after transformation");
                alert("No valid products were found in the imported file.");
                return;
            }
            
            // Log debug info
            console.log(`Transformed data contains ${transformedData.length} products`);
            this._logProductTypeSummary(transformedData);
            
            // Import the transformed data
            this._importDataToTable(transformedData);
        } catch (error) {
            console.error("Error processing Magento data:", error);
            alert("Error processing Magento data: " + error.message);
        }
    }
    
    /**
     * Log summary of product types for debugging
     * @private
     * @param {Array} data - Transformed product data
     */
    _logProductTypeSummary(data) {
        const productTypes = {};
        data.forEach(product => {
            const type = product.type || 'unknown';
            productTypes[type] = (productTypes[type] || 0) + 1;
            
            if (product._children) {
                console.log(`Product ${product.sku} has ${product._children.length} children`);
            }
        });
        console.log("Product type summary:", productTypes);
    }
    
    /**
     * Import processed data into the table
     * @private
     * @param {Array} data - Processed data ready for import
     */
    _importDataToTable(data) {
        // Clear current data and load new data
        this.table.setData(data)
        .then(() => {
            // Force a redraw to ensure everything is displayed properly
            setTimeout(() => {
                this.table.redraw(true);
                console.log("Table redrawn after import");
            }, 100);
            
            alert(`Data imported successfully! ${data.length} products loaded.`);
        })
        .catch((error) => {
            console.error("Table data import error:", error);
            alert("Error importing data: " + error.message);
        });
    }
} 