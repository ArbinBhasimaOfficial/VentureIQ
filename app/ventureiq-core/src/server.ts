import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 1570;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Core is booted on http://0.0.0.0:${PORT}`);
  });
}

export default app;