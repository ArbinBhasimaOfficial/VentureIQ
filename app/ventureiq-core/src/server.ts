import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();
const PORT = Number(process.env.PORT);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Core is booted on http://0.0.0.0:${PORT}`);
});