/**
 * Custom build script to ensure dependencies are properly handled
 * Run this after the vite build
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

// Function to check if the dist directory exists
function checkDistDir() {
  if (!fs.existsSync(distDir)) {
    console.error('Error: dist directory not found. Make sure to run "vite build" first.');
    process.exit(1);
  }
}

// Function to copy config.js to the dist directory
function copyConfigFile() {
  const configSource = path.resolve(__dirname, '../public/config.js');
  const configDest = path.resolve(distDir, 'config.js');
  
  try {
    if (fs.existsSync(configSource)) {
      fs.copyFileSync(configSource, configDest);
      console.log('✅ Copied config.js to dist directory');
    } else {
      console.warn('⚠️ Warning: config.js not found in public directory');
    }
  } catch (err) {
    console.error('Error copying config.js:', err);
  }
}

// Function to create a fallback dependencies script
function createFallbackScript() {
  const fallbackScript = `
// Fallback script for GitHub Pages
// This ensures dependencies are available even if module loading fails
(function() {
  // Flags to track application state
  window.moduleLoadError = false;
  window.appInitialized = false;

  // Detect module resolution errors
  window.addEventListener('error', function(event) {
    if (event.message && event.message.includes('Failed to resolve module specifier')) {
      if (!window.moduleLoadError) {
        window.moduleLoadError = true;
        console.warn('Module resolution error detected, loading fallbacks...');
        loadFallbackLibraries();
      }
      
      // Prevent default error handling for module errors
      event.preventDefault();
    }
  }, true); // Use capture to get the event first

  // Function to load all required libraries from CDN
  function loadFallbackLibraries() {
    console.log('Loading libraries from CDN fallback...');
    
    // Queue of scripts to load in sequence
    const scripts = [
      { src: 'https://unpkg.com/papaparse@5.4.1/papaparse.min.js', global: 'Papa' },
      { src: 'https://unpkg.com/tabulator-tables@5.4.4/dist/js/tabulator.min.js', global: 'Tabulator' },
      { src: 'https://unpkg.com/@supabase/supabase-js@2.21.0/dist/umd/supabase.min.js', global: 'supabase' }
    ];
    
    // Load scripts in sequence
    function loadNextScript(index) {
      if (index >= scripts.length) {
        console.log('All CDN libraries loaded successfully');
        
        // Make Tabulator available as TabulatorFull (the name used in the code)
        if (window.Tabulator) {
          window.TabulatorFull = window.Tabulator;
        }
        
        // Initialize the app after a small delay to ensure everything is ready
        setTimeout(() => {
          if (typeof window.initializeApp === 'function') {
            window.appInitialized = true;
            window.initializeApp();
          } else {
            console.error('initializeApp function not found, loading app script again');
            const appScript = document.createElement('script');
            appScript.type = 'module';
            appScript.src = './assets/index-[hash].js'; // Vite adds hash to filename
            document.body.appendChild(appScript);
          }
        }, 100);
        
        return;
      }
      
      const script = document.createElement('script');
      script.src = scripts[index].src;
      
      script.onload = function() {
        const globalName = scripts[index].global;
        console.log(\`Loaded \${globalName} from CDN\`);
        
        // Continue with next script
        loadNextScript(index + 1);
      };
      
      script.onerror = function() {
        console.error(\`Failed to load \${scripts[index].global} from CDN\`);
        // Try to continue with next script anyway
        loadNextScript(index + 1);
      };
      
      document.head.appendChild(script);
    }
    
    // Start loading the first script
    loadNextScript(0);
  }
  
  // Also provide backup initialization
  // This is needed in case DOMContentLoaded already fired or app.js fails to load
  setTimeout(function() {
    if (document.readyState === 'complete' && !window.appInitialized) {
      console.log('Backup initialization check - DOM is ready but app not initialized');
      if (window.moduleLoadError && !window.appInitialized) {
        // If we've detected module errors but app isn't initialized,
        // try loading fallbacks again
        loadFallbackLibraries();
      }
    }
  }, 2000);
})();
  `;
  
  const fallbackDest = path.resolve(distDir, 'fallback.js');
  
  try {
    fs.writeFileSync(fallbackDest, fallbackScript);
    console.log('✅ Created fallback.js in dist directory');
  } catch (err) {
    console.error('Error creating fallback.js:', err);
  }
}

// Function to update the index.html to include the fallback script
function updateIndexHtml() {
  const indexPath = path.resolve(distDir, 'index.html');
  
  try {
    if (fs.existsSync(indexPath)) {
      let indexContent = fs.readFileSync(indexPath, 'utf8');
      
      // Check if we need to add the fallback script
      if (!indexContent.includes('fallback.js')) {
        // Add fallback.js before the first script
        indexContent = indexContent.replace('<script', '<script src="./fallback.js"></script>\n<script');
        
        // Update the config.js path if it exists
        indexContent = indexContent.replace('./public/config.js', './config.js');
        
        // Make sure we have the necessary CSS
        if (!indexContent.includes('bootstrap-icons.css') && indexContent.includes('<head>')) {
          const bootstrapIconsLink = '\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">';
          indexContent = indexContent.replace('</head>', `${bootstrapIconsLink}\n</head>`);
        }
        
        fs.writeFileSync(indexPath, indexContent);
        console.log('✅ Updated index.html to include fallback script');
      }
    } else {
      console.error('❌ Error: index.html not found in dist directory');
    }
  } catch (err) {
    console.error('Error updating index.html:', err);
  }
}

// Main function
async function main() {
  console.log('🚀 Running post-build script for GitHub Pages');
  
  // Check if the dist directory exists
  checkDistDir();
  
  // Copy config.js to the dist directory
  copyConfigFile();
  
  // Create the fallback.js script
  createFallbackScript();
  
  // Update index.html to include the fallback script
  updateIndexHtml();
  
  console.log('✅ Post-build script completed successfully');
}

main().catch(err => {
  console.error('Error in post-build script:', err);
  process.exit(1);
}); 