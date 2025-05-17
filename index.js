// index.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 顯示資料表
app.get('/tables', async (req, res) => {
  try {
    const result = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public';`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 取得某表資料
app.get('/table/:name', async (req, res) => {
  const table = req.params.name;
  try {
    const result = await pool.query(`SELECT * FROM ${table} LIMIT 100`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
