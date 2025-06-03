// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'mini-crm-api',
      script: 'app.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000
      }
    },
    {
      name: 'mini-crm-consumer',
      script: 'services/unifiedConsumer.js',
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 5000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
  