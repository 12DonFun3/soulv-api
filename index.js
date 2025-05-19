require('dotenv').config();
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

//// ==========================
// ✅ survey_questions CRUD
//// ==========================

// GET all survey questions
app.get("/survey_questions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM survey_questions ORDER BY survey_code, question_order");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /survey_questions error:", err);
    res.status(500).send("Database error");
  }
});

// POST a new survey question
app.post("/survey_questions", async (req, res) => {
  const { survey_code, question_order, question_text } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO survey_questions (survey_code, question_order, question_text) VALUES ($1, $2, $3) RETURNING *",
      [survey_code, question_order, question_text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /survey_questions error:", err);
    res.status(500).send("Database error");
  }
});

// PUT (update) a survey question
app.put("/survey_questions/:survey_code/:question_order", async (req, res) => {
  const { survey_code, question_order } = req.params;
  const { question_text } = req.body;
  try {
    const result = await pool.query(
      "UPDATE survey_questions SET question_text = $1 WHERE survey_code = $2 AND question_order = $3 RETURNING *",
      [question_text, survey_code, question_order]
    );
    if (result.rowCount === 0) return res.status(404).send("Not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /survey_questions error:", err);
    res.status(500).send("Database error");
  }
});

// DELETE a survey question
app.delete("/survey_questions/:survey_code/:question_order", async (req, res) => {
  const { survey_code, question_order } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM survey_questions WHERE survey_code = $1 AND question_order = $2",
      [survey_code, question_order]
    );
    if (result.rowCount === 0) return res.status(404).send("Not found");
    res.send("Deleted successfully");
  } catch (err) {
    console.error("DELETE /survey_questions error:", err);
    res.status(500).send("Database error");
  }
});

//// ==========================
// ✅ user_roles CRUD
//// ==========================

// GET all user roles
app.get("/user_roles", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM user_roles ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /user_roles error:", err);
    res.status(500).send("Database error");
  }
});

// GET a single user role by id
app.get("/user_roles/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM user_roles WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).send("Not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /user_roles/:id error:", err);
    res.status(500).send("Database error");
  }
});

// POST new user role
app.post("/user_roles", async (req, res) => {
  const { line_id, role } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO user_roles (line_id, role, created_at) VALUES ($1, $2, NOW()) RETURNING *",
      [line_id, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /user_roles error:", err);
    res.status(500).send("Database error");
  }
});

// PUT update role for a user
app.put("/user_roles/:id", async (req, res) => {
  const id = req.params.id;
  const { role } = req.body;
  try {
    const result = await pool.query(
      "UPDATE user_roles SET role = $1 WHERE id = $2 RETURNING *",
      [role, id]
    );
    if (result.rowCount === 0) return res.status(404).send("Not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /user_roles error:", err); // ← log to console
    res.status(500).json({ error: "Database error", detail: err.message }); // ← 更清楚的錯誤訊息
  }
});

// DELETE a user role
app.delete("/user_roles/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("DELETE FROM user_roles WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).send("Not found");
    res.send("Deleted successfully");
  } catch (err) {
    console.error("DELETE /user_roles error:", err);
    res.status(500).send("Database error");
  }
});

//// ==========================
// ✅ 啟動伺服器
//// ==========================
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
