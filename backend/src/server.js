import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { configureSocket } from "./socket/index.js";

dotenv.config();

const port = Number(process.env.PORT || 5000);
const server = http.createServer(app);

configureSocket(server);

connectDatabase()
  .then(() => {
    server.listen(port, () => {
      console.log(`Backend server listening on port ${port}`);
    });
  })
  .catch(() => {
    process.exit(1);
  });
