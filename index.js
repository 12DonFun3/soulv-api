const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// PostgreSQL 連線設定（來自 Railway 環境變數）
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 測試首頁
app.get("/", (req, res) => {
  res.send("SoulV API is running!");
});

// ✅ 1. 查詢所有 feedbacks
app.get("/feedbacks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM feedbacks ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /feedbacks error:", err);
    res.status(500).send("Database error");
  }
});

// ✅ 2. 新增一筆 feedback
app.post("/feedbacks", async (req, res) => {
  const { user_id, title, feedback, ispublic } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO feedbacks (user_id, title, feedback, ispublic) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, title, feedback, ispublic]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /feedbacks error:", err);
    res.status(500).send("Database error");
  }
});

// ✅ 3. 更新 feedback
app.put("/feedbacks/:id", async (req, res) => {
  const id = req.params.id;
  const { title, feedback, ispublic } = req.body;
  try {
    const result = await pool.query(
      "UPDATE feedbacks SET title = $1, feedback = $2, ispublic = $3 WHERE id = $4 RETURNING *",
      [title, feedback, ispublic, id]
    );
    if (result.rowCount === 0) return res.status(404).send("Not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /feedbacks error:", err);
    res.status(500).send("Database error");
  }
});

// ✅ 4. 刪除 feedback
app.delete("/feedbacks/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("DELETE FROM feedbacks WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).send("Not found");
    res.send("Deleted successfully");
  } catch (err) {
    console.error("DELETE /feedbacks error:", err);
    res.status(500).send("Database error");
  }
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
