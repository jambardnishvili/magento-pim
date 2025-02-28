/**
 * Supabase Database Module for data persistence
 */
import { BaseModule } from '../core/BaseModule.js';
import { createClient } from '@supabase/supabase-js';

export class SupabaseModule extends BaseModule {
    constructor(productTable) {
        super(productTable);
        
        // Supabase configuration
        this.supabaseUrl = null;
        this.supabaseKey = null;
        this.supabase = null;
        this.tableName = 'products';
        this.isConnected = false;
        
        // Track changes to avoid redundant updates
        this.isSyncing = false;
    }
    
    /**
     * Initialize the Supabase module
     */
    init() {
        if (this.initialized) return;
        
        // Get configuration from environment, window globals, or settings
        this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || window.SUPABASE_URL;
        this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY;
        
        if (!this.supabaseUrl || !this.supabaseKey) {
            console.error("Supabase configuration missing. Make sure to set SUPABASE_URL and SUPABASE_ANON_KEY in your configuration.");
            this._updateConnectionStatus(false, "Configuration Missing");
            return;
        }
        
        // Initialize Supabase client
        this._initClient();
        
        // Setup event handlers for data synchronization
        this._setupEventHandlers();
        
        this.initialized = true;
    }
    
    /**
     * Initialize Supabase client
     * @private
     */
    _initClient() {
        try {
            this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
            console.log("Supabase client initialized");
            this.isConnected = true;
            
            // Update database status indicator
            this._updateConnectionStatus(true, "Connected");
            
            // Load initial data
            this.loadData();
        } catch (error) {
            console.error("Error initializing Supabase client:", error);
            this.isConnected = false;
            
            // Update database status indicator
            this._updateConnectionStatus(false, "Connection Failed");
        }
    }
    
    /**
     * Update connection status UI
     * @private
     * @param {boolean} connected - Connection status
     * @param {string} message - Status message to display
     */
    _updateConnectionStatus(connected, message) {
        const dbStatusText = document.getElementById("db-status-text");
        const dbStatusBtn = document.getElementById("db-status");
        
        if (dbStatusText && dbStatusBtn) {
            dbStatusText.textContent = message;
            dbStatusBtn.classList.remove("btn-outline-secondary", "btn-success", "btn-danger");
            dbStatusBtn.classList.add(connected ? "btn-success" : "btn-danger");
        }
    }
    
    /**
     * Setup table event handlers for data synchronization
     * @private
     */
    _setupEventHandlers() {
        // When cell is edited, update the database
        this.table.on("cellEdited", (cell) => {
            if (this.isSyncing) return; // Prevent recursive updates
            
            const row = cell.getRow();
            const data = row.getData();
            
            this.updateProduct(data);
        });
        
        // When row is deleted
        this.table.on("rowDeleted", (row) => {
            if (this.isSyncing) return;
            
            const data = row.getData();
            this.deleteProduct(data.id);
        });
        
        // When data is added (excludes initial load)
        this.table.on("rowAdded", (row) => {
            if (this.isSyncing) return;
            
            const data = row.getData();
            this.addProduct(data);
        });
    }
    
    /**
     * Load data from Supabase
     * @returns {Promise} Promise resolving with loaded data
     */
    async loadData() {
        if (!this.isConnected) {
            console.error("Cannot load data: Not connected to Supabase");
            return;
        }
        
        try {
            this.isSyncing = true;
            console.log("Loading data from Supabase...");
            
            // Fetch all products
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*');
                
            if (error) throw error;
            
            // Process hierarchical data (parent-child relationships)
            const processedData = this._processHierarchicalData(data);
            
            // Update the table with loaded data
            await this.table.setData(processedData);
            console.log(`Loaded ${processedData.length} products from Supabase`);
            
            return processedData;
        } catch (error) {
            console.error("Error loading data from Supabase:", error);
            return [];
        } finally {
            this.isSyncing = false;
        }
    }
    
    /**
     * Process hierarchical data from flat database records
     * @private
     * @param {Array} data - Raw data from database
     * @returns {Array} Processed hierarchical data
     */
    _processHierarchicalData(data) {
        // Create a map of products by ID for quick lookups
        const productMap = {};
        const topLevelProducts = [];
        
        // First pass: create product objects
        data.forEach(item => {
            // Clone the item to avoid mutating the original
            const product = { ...item, _children: [] };
            productMap[item.id] = product;
            
            // If no parent_id, it's a top-level product
            if (!item.parent_id) {
                topLevelProducts.push(product);
            }
        });
        
        // Second pass: build the hierarchy
        data.forEach(item => {
            if (item.parent_id && productMap[item.parent_id]) {
                // Add as child to parent
                const parent = productMap[item.parent_id];
                const child = productMap[item.id];
                
                if (parent && child) {
                    parent._children.push(child);
                }
            }
        });
        
        return topLevelProducts;
    }
    
    /**
     * Add a new product to Supabase
     * @param {Object} product - Product data to add
     * @returns {Promise} Promise resolving with the added product
     */
    async addProduct(product) {
        if (!this.isConnected) return null;
        
        try {
            console.log("Adding product to Supabase:", product);
            
            // Handle children separately
            const children = product._children || [];
            const productToAdd = { ...product };
            delete productToAdd._children;
            
            // Insert the main product
            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert(productToAdd)
                .select()
                .single();
                
            if (error) throw error;
            
            // Add child products with parent reference
            if (children.length > 0) {
                await Promise.all(children.map(child => {
                    const childProduct = { ...child, parent_id: data.id };
                    return this.addProduct(childProduct);
                }));
            }
            
            console.log("Product added successfully:", data);
            return data;
        } catch (error) {
            console.error("Error adding product to Supabase:", error);
            return null;
        }
    }
    
    /**
     * Update an existing product in Supabase
     * @param {Object} product - Product data to update
     * @returns {Promise} Promise resolving with the updated product
     */
    async updateProduct(product) {
        if (!this.isConnected) return null;
        
        try {
            console.log("Updating product in Supabase:", product);
            
            // Handle children separately
            const children = product._children || [];
            const productToUpdate = { ...product };
            delete productToUpdate._children;
            
            // Update the main product
            const { data, error } = await this.supabase
                .from(this.tableName)
                .update(productToUpdate)
                .eq('id', product.id)
                .select()
                .single();
                
            if (error) throw error;
            
            // Update child products recursively
            if (children.length > 0) {
                await Promise.all(children.map(child => {
                    return this.updateProduct({
                        ...child,
                        parent_id: product.id
                    });
                }));
            }
            
            console.log("Product updated successfully:", data);
            return data;
        } catch (error) {
            console.error("Error updating product in Supabase:", error);
            return null;
        }
    }
    
    /**
     * Delete a product from Supabase
     * @param {string} id - Product ID to delete
     * @returns {Promise} Promise resolving with the operation result
     */
    async deleteProduct(id) {
        if (!this.isConnected) return false;
        
        try {
            console.log("Deleting product from Supabase:", id);
            
            // First, recursively delete all children
            const { data: children } = await this.supabase
                .from(this.tableName)
                .select('id')
                .eq('parent_id', id);
                
            if (children && children.length > 0) {
                await Promise.all(children.map(child => this.deleteProduct(child.id)));
            }
            
            // Then delete the product itself
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            
            console.log("Product deleted successfully");
            return true;
        } catch (error) {
            console.error("Error deleting product from Supabase:", error);
            return false;
        }
    }
    
    /**
     * Bulk import products to Supabase
     * @param {Array} products - Array of products to import
     * @returns {Promise} Promise resolving when import completes
     */
    async bulkImport(products) {
        if (!this.isConnected) return;
        
        try {
            this.isSyncing = true;
            console.log(`Starting bulk import of ${products.length} products to Supabase...`);
            
            // First extract all products and children into a flat array
            const allProducts = [];
            const extractProducts = (items, parentId = null) => {
                items.forEach(item => {
                    const children = item._children || [];
                    const product = { ...item };
                    
                    // Set parent id if it exists
                    if (parentId) {
                        product.parent_id = parentId;
                    }
                    
                    // Remove children from the product
                    delete product._children;
                    allProducts.push(product);
                    
                    // Process children recursively
                    if (children.length > 0) {
                        extractProducts(children, item.id);
                    }
                });
            };
            
            extractProducts(products);
            
            // Bulk insert all products
            // Note: Supabase may have limits on batch size, so we chunk the data
            const CHUNK_SIZE = 500;
            for (let i = 0; i < allProducts.length; i += CHUNK_SIZE) {
                const chunk = allProducts.slice(i, i + CHUNK_SIZE);
                
                const { error } = await this.supabase
                    .from(this.tableName)
                    .upsert(chunk, { onConflict: 'id' });
                    
                if (error) throw error;
                
                console.log(`Imported batch ${i/CHUNK_SIZE + 1} of ${Math.ceil(allProducts.length/CHUNK_SIZE)}`);
            }
            
            console.log("Bulk import completed successfully!");
            return true;
        } catch (error) {
            console.error("Error during bulk import to Supabase:", error);
            return false;
        } finally {
            this.isSyncing = false;
        }
    }
} 