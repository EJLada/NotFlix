module.exports = {
  apps : [{
    script: 'server.mjs',
    watch: '.'
  }],
  env_production: {
    NODE_ENV: "production"
  },

  deploy : {
    production : {
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
