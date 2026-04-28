const { startServer } = require("next/dist/server/lib/start-server");

startServer({
  dir: process.cwd(),
  port: 3000,
  hostname: "127.0.0.1",
  isDev: true,
  allowRetry: false
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
