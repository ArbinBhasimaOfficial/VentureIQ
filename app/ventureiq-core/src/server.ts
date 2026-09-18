import app from "./app.js";
import dotenv from "dotenv";
import logger from "./config/logger.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 1570;

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Core is booted on http://0.0.0.0:${PORT}`);
});

export default app;
