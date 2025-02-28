/**
 * Magento PIM - Main Application Entry Point
 * 
 * This file initializes the Tabulator instance and imports all necessary modules.
 */
import { App } from './core/App.js';

// Initialize tooltips if Bootstrap is available
function initializeBootstrapComponents() {
    if (typeof bootstrap !== 'undefined') {
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltip => {
            new bootstrap.Tooltip(tooltip);
        });
    }
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing application...");
    
    try {
        // Initialize Bootstrap components
        initializeBootstrapComponents();
        
        // Create and initialize the main application
        const app = new App();
        app.init();
    } catch (error) {
        console.error("Fatal application error:", error);
        alert("The application encountered a critical error: " + error.message);
    }
}); 