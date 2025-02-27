/**
 * Utilities for transforming data between formats
 */

/**
 * Transform Magento CSV data to Tabulator format
 * @param {Array} data - Raw CSV data from Magento
 * @returns {Array} Transformed data ready for Tabulator
 */
export function transformMagentoData(data) {
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
    const finalProducts = data.filter(hasRequiredData).map(item => {
        // Base product data structure
        const baseProduct = {
            id: generateId(),
            name: item.name || item.product_name || `Product ${item.sku}`,
            sku: safeSku(item.sku),
            type: item.product_type || 'simple',
            price: parseFloat(item.price) || 0,
            status: (item.status === 1 || item.status === '1' || 
                    item.product_status === 1 || item.product_status === '1' || 
                    item.status === 'Enabled') ? 'enabled' : 'disabled',
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
                    
                    console.log(`Looking for child SKU "${childSku}" for parent "${product.sku}"`, 
                                matchingItem ? "Found" : "Not found");
                    
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