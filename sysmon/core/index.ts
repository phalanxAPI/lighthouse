// index.ts
import initServer from "./server";
import { initDB } from "./db";
import { SysMonService } from "../types/proto";

const startServer = async () => {
  await initDB();
  initServer( SysMonService ); // Replace 'SysMonService' with 'sysMonService'
};

startServer().catch((err) => {
  console.error(`Failed to start server: ${err}`);
  process.exit(1);
});