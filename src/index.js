import { App } from './core/App.js';
import './styles/styles.css';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    const success = await app.init();
    
    if (!success) {
        console.warn("Application initialization aborted due to database connection failure");
    }
}); 