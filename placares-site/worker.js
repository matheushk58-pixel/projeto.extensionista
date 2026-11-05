// Placares ao vivo: site independente, só lê o banco D1 compartilhado com o site principal.
//   GET /api/quiz?limite=N    → { total, pessoas, top: [{ nome, acertos, tempo }] }
//   GET /api/placar?limite=N  → { top: [{ nome, pontos, dist }] }
// N vai de 1 a 50 (padrão 10). Este projeto não escreve no banco e não cria tabelas.

const TABELA_QUIZ = 'quiz_v3'; // a mesma tabela que o site principal grava (worker.js na raiz do repositório)
const RODADA = 16;             // afirmações por rodada do quiz

const json = (dados, status = 200) => new Response(JSON.stringify(dados), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

const limiteDe = v => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(Math.max(n, 1), 50) : 10; };

async function placarQuiz(db, limite) {
  const geral = await db.prepare(`SELECT COUNT(*) AS pessoas FROM ${TABELA_QUIZ} WHERE nome IS NOT NULL`).first();
  const { results } = await db.prepare(`SELECT nome, melhor_acertos AS acertos, melhor_tempo AS tempo FROM ${TABELA_QUIZ}
      WHERE nome IS NOT NULL ORDER BY melhor_acertos DESC, melhor_tempo ASC, em_melhor ASC LIMIT ?`).bind(limite).all();
  return { total: RODADA, pessoas: geral ? geral.pessoas : 0, top: results };
}

async function placarMissao(db, limite) {
  const { results } = await db.prepare('SELECT nome, pontos, dist FROM placar ORDER BY pontos DESC, em ASC LIMIT ?').bind(limite).all();
  return { top: results };
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);
    if (req.method !== 'GET') return json({ erro: 'Método não permitido.' }, 405);
    if (!env.DB) return json({ erro: 'Banco indisponível.' }, 503);
    const limite = limiteDe(url.searchParams.get('limite'));
    try {
      if (url.pathname === '/api/quiz') return json(await placarQuiz(env.DB, limite));
      if (url.pathname === '/api/placar') return json(await placarMissao(env.DB, limite));
      return json({ erro: 'Não encontrado.' }, 404);
    } catch (e) {
      console.error(e);
      return json({ erro: 'Placar indisponível agora.' }, 500);
    }
  },
};
