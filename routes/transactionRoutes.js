import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || !user_id || !category || amount === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const transaction =
      await sql`INSERT INTO transaction(user_id,title,amount,category)
      VALUES (${user_id}, ${title}, ${amount}, ${category})
      RETURNING *
      `;
    res.status(201).json(transaction[0]);
  } catch (error) {
    console.error("Error inserting transaction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (isNaN(parseInt(userId))) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const transactions =
      await sql`SELECT * FROM transaction WHERE user_id = ${userId} ORDER BY created_at DESC`;

    res.status(200).json(transactions);
  } catch (error) {
    console.log("Error getting transaction", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result =
      await sql`DELETE FROM transaction WHERE id = ${id} RETURNING *`;

    if (result.length === 0) {
      res.status(400).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.log("Error Deleting the transaction", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const balanceResult =
      await sql`SELECT COALESCE(SUM(amount),0) as balance FROM transaction WHERE user_id = ${userId}`;

    const incomeResult =
      await sql`SELECT COALESCE(SUM(amount),0) as income FROM transaction WHERE user_id = ${userId} AND amount > 0`;

    const expenseResult =
      await sql`SELECT COALESCE(SUM(amount),0) as expense FROM transaction WHERE user_id = ${userId} AND amount < 0`;

    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expense: expenseResult[0].expense,
    });
  } catch (error) {
    console.log("Error Deleting the transaction", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
