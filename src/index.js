/**
 * Magento PIM - Main Application Entry Point
 * 
 * This file initializes the Tabulator instance and imports all necessary modules.
 */
import { App } from './core/App.js';

// Store initialization function globally so it can be called from multiple places
window.initializeApp = function() {
    console.log("Initializing application...");
    
    try {
        // Initialize Bootstrap components
        initializeBootstrapComponents();
        
        // Create and initialize the main application
        const app = new App();
        app.init();
        
        console.log("Application initialized successfully");
    } catch (error) {
        console.error("Fatal application error:", error);
        document.querySelector('#example-table').innerHTML = 
            `<div class="alert alert-danger m-3">
                The application encountered a critical error: ${error.message}
                <br><br>
                Please check the console for more details.
            </div>`;
    }
};

// Initialize tooltips if Bootstrap is available
function initializeBootstrapComponents() {
    if (typeof bootstrap !== 'undefined') {
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltip => {
            new bootstrap.Tooltip(tooltip);
        });
    }
}

// Init app when DOM is loaded - for normal module loading
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Only initialize immediately if we don't have module errors
    // Otherwise, the fallback script will call window.initializeApp after loading libraries
    if (!window.moduleLoadError) {
        window.initializeApp();
    } else {
        console.log("Module error detected, waiting for CDN fallbacks to load before initializing");
    }
});

// Backup initialization - in case DOMContentLoaded already fired or is not triggered
// This happens after a short delay to ensure all scripts have loaded
setTimeout(function() {
    // Only initialize if the app hasn't been initialized yet
    if (!window.appInitialized && document.readyState === 'complete') {
        console.log("Backup initialization triggered");
        window.initializeApp();
    }
}, 1000); 