/**
 * Configuration file for GitHub Pages deployment
 * This file should be updated with your Supabase credentials before deployment
 */

// Set up error handling
try {
  // IMPORTANT: Replace these values with your actual Supabase credentials
  window.SUPABASE_URL = "https://ngkzuczfcxdbriktiyxg.supabase.co";
  window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5na3p1Y3pmY3hkYnJpa3RpeXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NTYyODIsImV4cCI6MjA1NjIzMjI4Mn0.t5qH7PbY_NN3oMB_1CTURqhlagNRyXlOShK97ZfJCAA";

  // Set this to true to enable Supabase connection, false to disable
  window.ENABLE_SUPABASE = true;

  console.log("Configuration loaded for GitHub Pages deployment");
  
  // Log config values for debugging (only in dev, redact in production)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log("Supabase URL:", window.SUPABASE_URL);
    console.log("Supabase Key:", window.SUPABASE_ANON_KEY ? "Set (value hidden)" : "Not set");
  } else {
    console.log("Supabase credentials:", window.SUPABASE_URL && window.SUPABASE_ANON_KEY ? "Configured" : "Missing");
  }
} catch (error) {
  console.error("Error in config.js:", error);
  
  // Set default values to prevent errors
  window.SUPABASE_URL = window.SUPABASE_URL || null;
  window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || null;
  window.ENABLE_SUPABASE = window.ENABLE_SUPABASE !== undefined ? window.ENABLE_SUPABASE : false;
} 