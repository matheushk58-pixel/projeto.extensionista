-- Schema D1 para o banco de leaderboard do Drogaria Runner
-- Execute no dashboard Cloudflare → D1 → projeto-extensionista-db → Console

CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  distance INTEGER NOT NULL,
  phase TEXT NOT NULL,
  character TEXT NOT NULL DEFAULT 'male',
  visitor_id TEXT NOT NULL DEFAULT '',
  created_at REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
