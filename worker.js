// API do placar de líderes do minijogo "Missão: limpar o oceano".
// O resto do site é servido direto dos assets; só /api/* passa por aqui.
//   GET  /api/placar?eu=<id>  → top 10 (marca "eu" na linha do próprio jogador)
//   POST /api/placar          → { id, nome, pontos, dist, plastico }

const MAX_PONTOS = 200000, MAX_DIST = 100000, MAX_PLASTICO = 10000;
const INTERVALO_MIN_MS = 8000; // entre dois envios do mesmo jogador
const ENVIOS_POR_HORA = 40;    // por endereço IP
// palavras inteiras e começos de palavra barrados no apelido (comparação sem acento)
const PROIBIDAS = ['porra', 'caralho', 'buceta', 'puta', 'puto', 'merda', 'viado', 'fdp', 'cuzao', 'piroca', 'xoxota', 'hitler', 'nazi', 'nazista'];
const PREFIXOS_PROIBIDOS = ['arrombad', 'vagabund', 'filhadaput', 'filhodaput'];

let tabelasProntas = false;
async function preparar(db) {
  if (tabelasProntas) return;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS placar (
      id TEXT PRIMARY KEY, nome TEXT NOT NULL, pontos INTEGER NOT NULL,
      dist INTEGER NOT NULL, plastico INTEGER NOT NULL, em INTEGER NOT NULL, ultimo_envio INTEGER NOT NULL)`),
    db.prepare('CREATE INDEX IF NOT EXISTS placar_pontos ON placar (pontos DESC)'),
    db.prepare('CREATE TABLE IF NOT EXISTS envios (ip TEXT NOT NULL, em INTEGER NOT NULL)'),
    db.prepare('CREATE INDEX IF NOT EXISTS envios_ip ON envios (ip, em)'),
  ]);
  tabelasProntas = true;
}

const json = (dados, status = 200) => new Response(JSON.stringify(dados), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

function limparNome(bruto) {
  if (typeof bruto !== 'string') return null;
  const nome = bruto.normalize('NFC').replace(/[^\p{L}\p{N} ._-]/gu, '').replace(/\s+/g, ' ').trim();
  if (nome.length < 2 || nome.length > 20) return null;
  const plano = nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const palavras = plano.split(/[^a-z]+/).filter(Boolean), junto = palavras.join('');
  if (palavras.some(p => PROIBIDAS.includes(p)) || PREFIXOS_PROIBIDOS.some(p => junto.includes(p))) return null;
  return nome;
}

const inteiro = (v, max) => Number.isInteger(v) && v >= 0 && v <= max;

async function hashIp(ip) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('placar:' + ip));
  return [...new Uint8Array(d)].slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function top10(db, eu) {
  const { results } = await db.prepare('SELECT id, nome, pontos, dist FROM placar ORDER BY pontos DESC, em ASC LIMIT 10').all();
  return results.map(r => ({ nome: r.nome, pontos: r.pontos, dist: r.dist, eu: !!eu && r.id === eu }));
}

async function posicaoDe(db, pontos) {
  const r = await db.prepare('SELECT COUNT(*) AS n FROM placar WHERE pontos > ?').bind(pontos).first();
  return (r ? r.n : 0) + 1;
}

async function enviar(req, db) {
  let corpo;
  try { corpo = await req.json(); } catch { return json({ erro: 'Dados inválidos.' }, 400); }
  const { id, pontos, dist, plastico } = corpo || {};
  if (typeof id !== 'string' || !/^[a-f0-9-]{20,40}$/.test(id)) return json({ erro: 'Jogador inválido.' }, 400);
  const nome = limparNome(corpo.nome);
  if (!nome) return json({ erro: 'Escolha um apelido de 2 a 20 letras, sem palavrões.' }, 400);
  if (!inteiro(pontos, MAX_PONTOS) || !inteiro(dist, MAX_DIST) || !inteiro(plastico, MAX_PLASTICO)) return json({ erro: 'Pontuação inválida.' }, 400);
  // os pontos vêm da distância mais o plástico recolhido (no máximo 30 por item, com combo de até x5)
  if (pontos > dist + plastico * 150) return json({ erro: 'Pontuação inválida.' }, 400);

  const agora = Date.now();
  const ip = await hashIp(req.headers.get('cf-connecting-ip') || 'local');
  const recentes = await db.prepare('SELECT COUNT(*) AS n FROM envios WHERE ip = ? AND em > ?').bind(ip, agora - 3600e3).first();
  if (recentes && recentes.n >= ENVIOS_POR_HORA) return json({ erro: 'Muitos envios seguidos. Tente de novo mais tarde.' }, 429);

  const atual = await db.prepare('SELECT pontos, ultimo_envio FROM placar WHERE id = ?').bind(id).first();
  if (atual && agora - atual.ultimo_envio < INTERVALO_MIN_MS) return json({ erro: 'Espere alguns segundos para enviar de novo.' }, 429);

  const novo = !atual || pontos > atual.pontos;
  const passos = [db.prepare('INSERT INTO envios (ip, em) VALUES (?, ?)').bind(ip, agora)];
  if (!atual) {
    passos.push(db.prepare('INSERT INTO placar (id, nome, pontos, dist, plastico, em, ultimo_envio) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, nome, pontos, dist, plastico, agora, agora));
  } else if (novo) {
    passos.push(db.prepare('UPDATE placar SET nome = ?, pontos = ?, dist = ?, plastico = ?, em = ?, ultimo_envio = ? WHERE id = ?')
      .bind(nome, pontos, dist, plastico, agora, agora, id));
  } else {
    passos.push(db.prepare('UPDATE placar SET nome = ?, ultimo_envio = ? WHERE id = ?').bind(nome, agora, id));
  }
  // limpa o registro de envios com mais de um dia
  passos.push(db.prepare('DELETE FROM envios WHERE em < ?').bind(agora - 86400e3));
  await db.batch(passos);

  const melhor = novo ? pontos : atual.pontos;
  return json({ novo, melhor, posicao: await posicaoDe(db, melhor) });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname !== '/api/placar') return env.ASSETS.fetch(req);
    if (!env.DB) return json({ erro: 'Placar indisponível.' }, 503);
    try {
      await preparar(env.DB);
      if (req.method === 'GET') return json({ top: await top10(env.DB, url.searchParams.get('eu')) });
      if (req.method === 'POST') return await enviar(req, env.DB);
      return json({ erro: 'Método não permitido.' }, 405);
    } catch (e) {
      console.error(e);
      return json({ erro: 'Placar indisponível agora.' }, 500);
    }
  },
};
