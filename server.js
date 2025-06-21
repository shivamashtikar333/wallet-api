import express from "express";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import ratelimiter from "./middleware/rateLimiter.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import job from "./config/cron.js";
dotenv.config();

if (process.env.NODE_ENV === "production") job.start();

const PORT = process.env.PORT || 5001;
const app = express();

app.use(ratelimiter);
app.use(express.json());
app.use("/api/transactions", transactionRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`);
  });
});
