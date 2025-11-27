import express from "express";
import { config } from "./infrastructure/config/env";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Client Management API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

const port = config.app.port;

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  console.log(`http://localhost:${port}`);
});
