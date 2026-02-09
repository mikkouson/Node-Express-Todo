import express from "express";
import pool from "./db.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Api is Running" });
});

app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM public.tasks");
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database Error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
