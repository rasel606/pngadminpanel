// =============================================================================
// ecosystem.config.js — PM2 process configuration for tiger55.online
//
// Usage:
//   pm2 start ecosystem.config.js --env production
//   pm2 restart all --env production
// =============================================================================

const fs = require('fs')
const os = require('os')

const LOG_DIR = `${os.homedir()}/logs`

// Ensure the log directory exists at startup
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

module.exports = {
  apps: [
    {
      // -------------------------------------------------------------------------
      // Express Backend — served at https://api.tiger55.online
      // -------------------------------------------------------------------------
      name: 'backend',
      // Update this path to point to your Express entry file:
      script: './src/index.js',
      cwd: `${os.homedir()}/apps/backend`,

      instances: 'max',      // Use all CPU cores (cluster mode)
      exec_mode: 'cluster',

      // Restart the process if memory exceeds 500 MB
      max_memory_restart: '500M',

      // Watch for file changes (disable in production)
      watch: false,

      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Log configuration
      out_file: `${LOG_DIR}/backend-out.log`,
      error_file: `${LOG_DIR}/backend-error.log`,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
}
