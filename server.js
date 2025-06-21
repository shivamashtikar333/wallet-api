import express from "express";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import ratelimiter from "./middleware/rateLimiter.js";
import transactionRoutes from "./routes/transactionRoutes.js";
dotenv.config();
const PORT = process.env.PORT || 5001;
const app = express();

app.use(ratelimiter);
app.use(express.json());
app.use("/api/transactions", transactionRoutes);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`);
  });
});
