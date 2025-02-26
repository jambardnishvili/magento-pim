/**
 * Import/Export functionality for Tabulator
 * 
 * Handles importing and exporting data in various formats.
 */
import Papa from 'papaparse';

export function setupImportExport(table) {
    // Add export functionality
    document.getElementById("export-csv").addEventListener("click", function() {
        table.download("csv", "magento_products.csv", {
            delimiter: ",",
            bom: true
        });
    });

    // Add import functionality
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

                if (fileExt === "csv") {
                    Papa.parse(e.target.result, {
                        header: true,
                        dynamicTyping: false,
                        skipEmptyLines: true,
                        complete: function(results) {
                            if (results.errors && results.errors.length > 0) {
                                console.warn("CSV parsing errors:", results.errors);
                            }
                            
                            const isMagentoFormat = detectMagentoFormat(results.data);
                            if (isMagentoFormat) {
                                console.log("Detected Magento CSV format");
                                console.log(`CSV contains ${results.data.length} rows`);
                                importMagentoProductData(results.data, table);
                            } else {
                                importProductData(results.data, table);
                            }
                        },
                        error: function(error) {
                            alert("Error parsing CSV: " + error.message);
                        }
                    });
                } else {
                    alert("Unsupported file format. Please use .csv");
                }
            } catch (error) {
                alert("Error importing data: " + error.message);
                console.error("Import error:", error);
            }
        };
        
        reader.readAsText(file);
        
        // Reset the file input
        e.target.value = "";
    });
}

// Detect if the CSV is in Magento format
function detectMagentoFormat(data) {
    if (!data || data.length === 0) return false;
    
    // Check for common Magento product export fields
    const magentoFields = ["sku", "product_type", "configurable_variations", "visibility", "tax_class_name"];
    const keys = Object.keys(data[0]);
    
    return magentoFields.some(field => keys.includes(field));
}

// Import Magento product data specifically
function importMagentoProductData(data, table) {
    try {
        console.log("Processing Magento product data...");
        
        // Transform Magento data to Tabulator format
        const transformedData = transformMagentoDataToTabulator(data);
        
        // Check if we have any products after transformation
        if (!transformedData || transformedData.length === 0) {
            console.warn("No valid products found after transformation");
            alert("No valid products were found in the imported file. Please check the file format and data completeness.");
            return;
        }
        
        console.log(`Transformed data contains ${transformedData.length} products`);
        
        // Debug: Log a summary of product types
        const productTypes = {};
        transformedData.forEach(product => {
            const type = product.type || 'unknown';
            productTypes[type] = (productTypes[type] || 0) + 1;
            
            // Log children count for parent products
            if (product._children) {
                console.log(`Product ${product.sku} has ${product._children.length} children`);
            }
        });
        console.log("Product type summary:", productTypes);
        
        // Import the transformed data
        importProductData(transformedData, table);
    } catch (error) {
        console.error("Error processing Magento data:", error);
        alert("Error processing Magento data: " + error.message);
    }
}

// Transform Magento CSV data to hierarchical structure for Tabulator
function transformMagentoDataToTabulator(data) {
    console.log("Converting Magento data format:", data.length, "rows");
    if (!data || data.length === 0) return [];
    
    // Create random ID generator helper
    const generateId = () => "id-" + Math.random().toString(36).substring(2, 9);
    
    // Create safer string conversion for sku values
    const safeSku = (value) => {
        if (value === null || value === undefined) return '';
        return String(value);
    };
    
    // Helper to check if a product has the required data
    const hasRequiredData = (item) => {
        // SKU is always required
        if (!item.sku) return false;
        
        // Need at least name or product_type or status
        return (item.name || item.product_name);
    };
    
    // First pass: build a map of SKUs to products for quick lookup
    // and identify which SKUs are referenced in configurable_variations
    const skuMap = {};
    const childSkus = new Set();
    
    // Create a map of SKUs to product data
    data.forEach(item => {
        if (item.sku && hasRequiredData(item)) {
            skuMap[safeSku(item.sku)] = item;
        }
    });
    
    console.log(`Found ${Object.keys(skuMap).length} valid products with SKUs`);
    
    // Second pass: transform data into tabulator format
    // and process configurable variations
    const finalProducts = data.filter(hasRequiredData).map(item => {
        // Base product data structure
        const baseProduct = {
            id: generateId(),
            name: item.name || item.product_name || `Product ${item.sku}`,
            sku: safeSku(item.sku),
            type: item.product_type || 'simple',
            price: parseFloat(item.price) || 0,
            status: (item.status === 1 || item.status === '1' || item.product_status === 1 || item.product_status === '1' || item.status === 'Enabled') ? 'enabled' : 'disabled',
            qty: parseInt(item.qty) || 0,
            visibility: item.visibility || 'Catalog, Search',
            _children: []
        };
        
        // Store configurable variations data for later processing
        if (item.configurable_variations) {
            baseProduct.variations_data = item.configurable_variations;
        }
        
        // Handle options for bundle products
        if (item.option_title) {
            baseProduct.option_title = item.option_title;
            baseProduct.is_required = item.is_required === '1';
        }
        
        return baseProduct;
    });
    
    console.log(`Transformed ${finalProducts.length} products`);
    
    // Third pass: process configurable products and their variations
    const processedProducts = finalProducts.map(product => {
        // Only process configurable products with variations data
        if (product.type !== 'configurable' || !product.variations_data) {
            return product;
        }
        
        try {
            console.log(`Processing variations for ${product.sku}`);
            
            // Parse the configurable_variations field
            const variations = product.variations_data.split('|');
            variations.forEach(variation => {
                const attributes = variation.split(',');
                const variationData = {};
                
                // Extract SKU and attributes from the variation
                attributes.forEach(attr => {
                    const [key, value] = attr.split('=');
                    if (key && value) {
                        const trimmedKey = key.trim();
                        const trimmedValue = value.trim();
                        
                        if (trimmedKey === 'sku') {
                            variationData.sku = safeSku(trimmedValue);
                        } else {
                            variationData[trimmedKey] = trimmedValue;
                        }
                    }
                });
                
                // If this variation has a SKU, find it in our data
                if (variationData.sku) {
                    const childSku = safeSku(variationData.sku);
                    const matchingItem = skuMap[childSku];
                    
                    console.log(`Looking for child SKU "${childSku}" for parent "${product.sku}"`, matchingItem ? "Found" : "Not found");
                    
                    if (matchingItem && hasRequiredData(matchingItem)) {
                        // Create a child product with data from both the CSV and the variations
                        const childProduct = {
                            id: generateId(),
                            name: matchingItem.name || matchingItem.product_name || `${product.name} Variation`,
                            sku: childSku,
                            type: 'simple',
                            price: parseFloat(matchingItem.price) || product.price,
                            status: matchingItem.status === '1' || matchingItem.status === 1 ? 'enabled' : 'disabled',
                            qty: parseInt(matchingItem.qty) || 0,
                            visibility: matchingItem.visibility || 'Not Visible Individually',
                            // Copy attributes from both sources
                            color: matchingItem.color || variationData.color,
                            size: matchingItem.size || variationData.size
                        };
                        
                        // Add this child to the parent
                        product._children.push(childProduct);
                        childSkus.add(childSku);
                        console.log(`Added "${childSku}" as child to configurable "${product.sku}"`);
                    } else {
                        console.warn(`Child SKU "${childSku}" referenced in configurable_variations for "${product.sku}" was not found or is incomplete`);
                    }
                }
            });
        } catch (error) {
            console.warn(`Error processing variations for ${product.sku}:`, error);
        }
        
        // Check if we actually found any children
        if (product._children.length === 0) {
            console.warn(`No valid children found for configurable product "${product.sku}"`);
        } else {
            console.log(`Found ${product._children.length} valid children for "${product.sku}"`);
        }
        
        // Remove the temporary variations_data field
        delete product.variations_data;
        return product;
    });
    
    // Remove child products from top level
    const result = processedProducts.filter(product => !childSkus.has(safeSku(product.sku)));
    
    console.log(`Final product structure: ${result.length} top-level products`);
    
    // Additional validation to ensure we have data to display
    if (result.length === 0) {
        console.error("No products remain after filtering out children");
        alert("No valid top-level products found in the import. Make sure your data includes complete product information.");
    }
    
    return result;
}

function importProductData(data, table) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error("No valid data to import");
        alert("No valid data found to import. Please check your file format.");
        return;
    }
    
    // Process data to ensure correct structure for tree data
    const processedData = processImportedData(data);
    
    console.log("Importing processed data into table:", processedData.length, "products");
    
    // Clear current data and load new data
    table.setData(processedData)
    .then(function() {
        // Force a redraw to ensure everything is displayed properly
        setTimeout(() => {
            table.redraw(true);
            console.log("Table redrawn after import");
        }, 100);
        
        alert(`Data imported successfully! ${processedData.length} products loaded.`);
    })
    .catch(function(error) {
        console.error("Table data import error:", error);
        alert("Error importing data: " + error.message);
    });
}

function processImportedData(data) {
    // This function organizes flat data into a parent-child structure
    if (!Array.isArray(data)) {
        console.warn("Imported data is not an array:", data);
        return [];
    }
    
    // Check if data already has a tree structure
    const hasChildren = data.some(item => item._children && item._children.length > 0);
    if (hasChildren) {
        console.log("Data already has tree structure");
        return data; // Data already has tree structure
    }
    
    // Otherwise, try to organize by parent-child relationships
    const result = [];
    const childrenMap = {};
    
    // First pass: identify all items and organize by ID
    data.forEach(item => {
        if (item._parent) {
            if (!childrenMap[item._parent]) {
                childrenMap[item._parent] = [];
            }
            childrenMap[item._parent].push(item);
        } else {
            result.push(item);
        }
    });
    
    // Second pass: add children to parents
    result.forEach(item => {
        if (childrenMap[item.id]) {
            item._children = childrenMap[item.id];
        }
    });
    
    return result;
} 