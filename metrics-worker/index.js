const { Pool } = require('pg');
const express = require('express');

const pool = new Pool({
  connectionString: process.env.DB_URL
});

const app = express();

app.get('/health', (req, res) => res.status(200).json({ status: 'Metrics Worker Healthy' }));

app.get('/api/metrics', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM system_health ORDER BY timestamp DESC LIMIT 20');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS system_health (
      id SERIAL PRIMARY KEY,
      cpu_usage_percent INT NOT NULL,
      memory_usage_mb INT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function collectMetrics() {
  const cpu = Math.floor(Math.random() * 100);
  const memory = Math.floor(Math.random() * 8000) + 1000;
  
  try {
    await pool.query('INSERT INTO system_health (cpu_usage_percent, memory_usage_mb) VALUES ($1, $2)', [cpu, memory]);
    console.log(`[${new Date().toISOString()}] Metrics collected: CPU ${cpu}%, RAM ${memory}MB`);
  } catch (error) {
    console.error('Failed to log metrics:', error);
  }
}

initDB().then(() => {
  console.log('Metrics worker started. Collecting data every 30 seconds...');
  setInterval(collectMetrics, 30000);
}).catch(console.error);

const PORT = 4000;
app.listen(PORT, () => console.log(`Metrics Service running on port ${PORT}`));
