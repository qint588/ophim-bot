module.exports = {
  apps: [
    {
      name: "Telegram Phimmoiii Bot", // application name
      script: "index.js", // script path to pm2 start

      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1, // number process of application
      autorestart: true, //auto restart if app crashes
      watch: true,
      exec_mode: "cluster",
      max_memory_restart: "1G", // restart if it exceeds the amount of memory specified
    },
  ],
};
