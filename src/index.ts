import express from "express";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Api is Running" });
});

/* ---------------- ROUTES ---------------- */

app.use("/", authRoutes);
app.use("/tasks", taskRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
