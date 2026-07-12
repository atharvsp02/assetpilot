// pm2 process config for the AssetFlow API (used on the rey3 VM deploy).
// Start with:  pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'assetflow-api',
      script: 'src/index.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
      env: { NODE_ENV: 'production' },
    },
  ],
}
