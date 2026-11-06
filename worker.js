// API do site "Microplásticos e Saúde". O resto do site é servido direto dos
// assets; só /api/* passa por aqui.
// Placar do minijogo "Missão: limpar o oceano":
//   GET  /api/placar?eu=<id>  → top 10 (marca "eu" na linha do próprio jogador)
//   POST /api/placar          → { id, nome, pontos, dist, plastico }
// Quiz "Verdadeiro ou falso?":
//   GET  /api/quiz?eu=<id>    → estatísticas de todos + top 10 do placar do quiz
//   POST /api/quiz            → { id, escolhas: { "<índice>": bool, ... x16 }, tempo_ms, nome? }  registra uma tentativa
//   POST /api/quiz            → { id, nome }                                    só põe/troca o apelido
//   GET  /api/quiz/dia?data=AAAA-MM-DD → placar do dia (horário de Brasília; sem data = hoje)
// Cada tentativa tem 16 afirmações sorteadas do banco de 32. A correção é feita aqui, com o
// gabarito abaixo; o navegador manda só as escolhas, indexadas pela posição no banco.
// Em "primeira" cada posição do banco vira '1' (acertou), '0' (errou) ou '-' (não apareceu).
// As estatísticas usam a primeira tentativa de cada pessoa; o placar, a melhor.

const MAX_PONTOS = 200000, MAX_DIST = 100000, MAX_PLASTICO = 10000;
const INTERVALO_MIN_MS = 8000; // entre dois envios do mesmo jogador
const ENVIOS_POR_HORA = 500;   // por endereço IP (numa Wi-Fi compartilhada, como a de um stand, muita gente sai pelo mesmo IP)
// palavras inteiras e começos de palavra barrados no apelido (comparação sem acento)
const PROIBIDAS = ['porra', 'caralho', 'buceta', 'puta', 'puto', 'merda', 'viado', 'fdp', 'cuzao', 'piroca', 'xoxota', 'hitler', 'nazi', 'nazista'];
const PREFIXOS_PROIBIDOS = ['arrombad', 'vagabund', 'filhadaput', 'filhodaput'];
// gabarito do banco de afirmações do quiz, na mesma ordem de extensionista 4/index.html (PERGUNTAS).
// Se as afirmações mudarem, troque também TABELA_QUIZ para começar estatísticas novas.
const TABELA_QUIZ = 'quiz_v3';
const GABARITO = [true, false, true, false, true, false, true, false, true, true, true, true, false, true, false, false, true, false, true, false, true, true, true, false, true, false, true, false, true, false, true, false];
const RODADA = 16; // afirmações sorteadas por tentativa
const QUIZ_TEMPO_MIN_MS = 3000, QUIZ_TEMPO_MAX_MS = 3600e3;

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
    db.prepare(`CREATE TABLE IF NOT EXISTS ${TABELA_QUIZ} (
      id TEXT PRIMARY KEY, nome TEXT,
      primeira TEXT NOT NULL, primeira_acertos INTEGER NOT NULL, em_primeira INTEGER NOT NULL,
      melhor_acertos INTEGER NOT NULL, melhor_tempo INTEGER NOT NULL, em_melhor INTEGER NOT NULL,
      tentativas INTEGER NOT NULL, ultimo_envio INTEGER NOT NULL)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS ${TABELA_QUIZ}_placar ON ${TABELA_QUIZ} (melhor_acertos DESC, melhor_tempo ASC)`),
    // todas as tentativas, com horário, para o placar do dia
    db.prepare('CREATE TABLE IF NOT EXISTS quiz_tentativas (id TEXT NOT NULL, acertos INTEGER NOT NULL, tempo INTEGER NOT NULL, em INTEGER NOT NULL)'),
    db.prepare('CREATE INDEX IF NOT EXISTS quiz_tentativas_em ON quiz_tentativas (em)'),
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

async function excedeuLimite(db, ip, agora) {
  const r = await db.prepare('SELECT COUNT(*) AS n FROM envios WHERE ip = ? AND em > ?').bind(ip, agora - 3600e3).first();
  return !!r && r.n >= ENVIOS_POR_HORA;
}

// ?limite=N (até 50) devolve mais posições; o padrão é 10
const limiteDe = v => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(Math.max(n, 1), 50) : 10; };

async function top10(db, eu, limite = 10) {
  const { results } = await db.prepare('SELECT id, nome, pontos, dist FROM placar ORDER BY pontos DESC, em ASC LIMIT ?').bind(limite).all();
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
  if (await excedeuLimite(db, ip, agora)) return json({ erro: 'Muitos envios seguidos. Tente de novo mais tarde.' }, 429);

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

/* ---------- quiz ---------- */

const idValido = id => typeof id === 'string' && /^[a-f0-9-]{20,40}$/.test(id);

async function quizResumo(db, eu, limite = 10) {
  const geral = await db.prepare(`SELECT COUNT(*) AS pessoas, AVG(primeira_acertos) AS media,
      SUM(CASE WHEN primeira_acertos = ? THEN 1 ELSE 0 END) AS gabaritaram FROM ${TABELA_QUIZ}`).bind(RODADA).first();
  const pessoas = geral ? geral.pessoas : 0;
  const { results: dist } = await db.prepare(`SELECT primeira_acertos AS a, COUNT(*) AS n FROM ${TABELA_QUIZ} GROUP BY primeira_acertos`).all();
  const distribuicao = Array(RODADA + 1).fill(0);
  for (const r of dist) if (r.a >= 0 && r.a <= RODADA) distribuicao[r.a] = r.n;
  // acertos por afirmação: soma do caractere i de "primeira" ("1" = acertou)
  const colunas = GABARITO.map((_, i) => `SUM(CASE WHEN substr(primeira, ${i + 1}, 1) = '1' THEN 1 ELSE 0 END) AS p${i},
      SUM(CASE WHEN substr(primeira, ${i + 1}, 1) IN ('0', '1') THEN 1 ELSE 0 END) AS v${i}`).join(', ');
  const porQ = await db.prepare(`SELECT ${colunas} FROM ${TABELA_QUIZ}`).first();
  const porPergunta = GABARITO.map((_, i) => (porQ && porQ['p' + i]) || 0);
  const vistas = GABARITO.map((_, i) => (porQ && porQ['v' + i]) || 0);
  const { results: top } = await db.prepare(`SELECT id, nome, melhor_acertos, melhor_tempo FROM ${TABELA_QUIZ} WHERE nome IS NOT NULL
      ORDER BY melhor_acertos DESC, melhor_tempo ASC, em_melhor ASC LIMIT ?`).bind(limite).all();
  let euInfo = null;
  if (idValido(eu)) {
    const m = await db.prepare(`SELECT nome, primeira_acertos, melhor_acertos, melhor_tempo, em_melhor, tentativas FROM ${TABELA_QUIZ} WHERE id = ?`).bind(eu).first();
    if (m) {
      const pos = await db.prepare(`SELECT COUNT(*) AS n FROM ${TABELA_QUIZ} WHERE nome IS NOT NULL AND (melhor_acertos > ?1
          OR (melhor_acertos = ?1 AND (melhor_tempo < ?2 OR (melhor_tempo = ?2 AND em_melhor < ?3))))`).bind(m.melhor_acertos, m.melhor_tempo, m.em_melhor).first();
      const abaixo = await db.prepare(`SELECT COUNT(*) AS n FROM ${TABELA_QUIZ} WHERE primeira_acertos < ?`).bind(m.primeira_acertos).first();
      euInfo = { nome: m.nome, primeira: m.primeira_acertos, melhor: m.melhor_acertos, tempo: m.melhor_tempo, tentativas: m.tentativas,
        posicao: m.nome ? (pos ? pos.n : 0) + 1 : null, acimaDe: pessoas > 1 ? Math.round(((abaixo ? abaixo.n : 0) / (pessoas - 1)) * 100) : null };
    }
  }
  return {
    total: RODADA, banco: GABARITO.length, pessoas, media: geral && geral.media != null ? Math.round(geral.media * 10) / 10 : null,
    gabaritaram: geral ? geral.gabaritaram || 0 : 0, distribuicao, porPergunta, vistas,
    top: top.map(r => ({ nome: r.nome, acertos: r.melhor_acertos, tempo: r.melhor_tempo, eu: !!eu && r.id === eu })),
    eu: euInfo,
  };
}

async function quizEnviar(req, db) {
  let corpo;
  try { corpo = await req.json(); } catch { return json({ erro: 'Dados inválidos.' }, 400); }
  const { id, escolhas, tempo_ms: tempo } = corpo || {};
  if (!idValido(id)) return json({ erro: 'Jogador inválido.' }, 400);
  let nome = null;
  if (corpo.nome != null && corpo.nome !== '') {
    nome = limparNome(corpo.nome);
    if (!nome) return json({ erro: 'Escolha um apelido de 2 a 20 letras, sem palavrões.' }, 400);
  }
  const agora = Date.now();
  const atual = await db.prepare(`SELECT * FROM ${TABELA_QUIZ} WHERE id = ?`).bind(id).first();

  // só o apelido
  if (escolhas === undefined) {
    if (!nome) return json({ erro: 'Escolha um apelido de 2 a 20 letras, sem palavrões.' }, 400);
    if (!atual) return json({ erro: 'Faça o quiz antes de entrar no placar.' }, 400);
    await db.prepare(`UPDATE ${TABELA_QUIZ} SET nome = ? WHERE id = ?`).bind(nome, id).run();
    return json({ ok: true, ...(await quizResumo(db, id)) });
  }

  const pares = escolhas && typeof escolhas === 'object' && !Array.isArray(escolhas) ? Object.entries(escolhas) : [];
  if (pares.length !== RODADA || !pares.every(([k, v]) => /^(0|[1-9]\d?)$/.test(k) && +k < GABARITO.length && typeof v === 'boolean')) return json({ erro: 'Respostas inválidas.' }, 400);
  if (!Number.isInteger(tempo) || tempo < QUIZ_TEMPO_MIN_MS || tempo > QUIZ_TEMPO_MAX_MS) return json({ erro: 'Tempo inválido.' }, 400);
  const ip = await hashIp(req.headers.get('cf-connecting-ip') || 'local');
  if (await excedeuLimite(db, ip, agora)) return json({ erro: 'Muitos envios seguidos. Tente de novo mais tarde.' }, 429);
  if (atual && agora - atual.ultimo_envio < INTERVALO_MIN_MS) return json({ erro: 'Espere alguns segundos para enviar de novo.' }, 429);

  const bits = GABARITO.map((g, i) => (String(i) in escolhas ? (escolhas[i] === g ? '1' : '0') : '-')).join('');
  const acertos = [...bits].filter(b => b === '1').length;
  const passos = [db.prepare('INSERT INTO envios (ip, em) VALUES (?, ?)').bind(ip, agora)];
  let novo;
  if (!atual) {
    novo = true;
    passos.push(db.prepare(`INSERT INTO ${TABELA_QUIZ} (id, nome, primeira, primeira_acertos, em_primeira, melhor_acertos, melhor_tempo, em_melhor, tentativas, ultimo_envio)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`).bind(id, nome, bits, acertos, agora, acertos, tempo, agora, agora));
  } else {
    novo = acertos > atual.melhor_acertos || (acertos === atual.melhor_acertos && tempo < atual.melhor_tempo);
    passos.push(novo
      ? db.prepare(`UPDATE ${TABELA_QUIZ} SET nome = COALESCE(?, nome), melhor_acertos = ?, melhor_tempo = ?, em_melhor = ?, tentativas = tentativas + 1, ultimo_envio = ? WHERE id = ?`)
          .bind(nome, acertos, tempo, agora, agora, id)
      : db.prepare(`UPDATE ${TABELA_QUIZ} SET nome = COALESCE(?, nome), tentativas = tentativas + 1, ultimo_envio = ? WHERE id = ?`).bind(nome, agora, id));
  }
  passos.push(db.prepare('INSERT INTO quiz_tentativas (id, acertos, tempo, em) VALUES (?, ?, ?, ?)').bind(id, acertos, tempo, agora));
  passos.push(db.prepare('DELETE FROM envios WHERE em < ?').bind(agora - 86400e3));
  await db.batch(passos);
  return json({ ok: true, acertos, novo, ...(await quizResumo(db, id)) });
}

/* ---------- placar do dia (tela do stand) ---------- */

const FUSO_MS = -3 * 3600e3; // horário de Brasília (sem horário de verão desde 2019)

function limitesDoDia(data) {
  let ini;
  if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data)) ini = Date.parse(data + 'T00:00:00Z') - FUSO_MS;
  if (!Number.isFinite(ini)) { const local = Date.now() + FUSO_MS; ini = local - (local % 86400e3) - FUSO_MS; }
  return { ini, fim: ini + 86400e3, data: new Date(ini + FUSO_MS).toISOString().slice(0, 10) };
}

async function quizDia(db, data) {
  const { ini, fim, data: dia } = limitesDoDia(data);
  const geral = await db.prepare(`SELECT COUNT(*) AS tentativas, COUNT(DISTINCT id) AS pessoas, AVG(acertos) AS media
      FROM quiz_tentativas WHERE em >= ? AND em < ?`).bind(ini, fim).first();
  // melhor tentativa de cada pessoa no dia (mais acertos, depois menor tempo, depois a mais antiga)
  const { results: top } = await db.prepare(`SELECT t.id, q.nome, t.acertos, t.tempo, t.em FROM (
        SELECT id, acertos, tempo, em, ROW_NUMBER() OVER (PARTITION BY id ORDER BY acertos DESC, tempo ASC, em ASC) AS n
        FROM quiz_tentativas WHERE em >= ? AND em < ?) t
      JOIN ${TABELA_QUIZ} q ON q.id = t.id
      WHERE t.n = 1 AND q.nome IS NOT NULL
      ORDER BY t.acertos DESC, t.tempo ASC, t.em ASC LIMIT 10`).bind(ini, fim).all();
  return {
    data: dia, total: RODADA, tentativas: geral ? geral.tentativas : 0, pessoas: geral ? geral.pessoas : 0,
    media: geral && geral.media != null ? Math.round(geral.media * 10) / 10 : null,
    // a chave curta do id deixa a tela do stand perceber quem entrou ou subiu sem expor o id
    top: await Promise.all(top.map(async r => ({ chave: (await hashIp('quiz:' + r.id)).slice(0, 10), nome: r.nome, acertos: r.acertos, tempo: r.tempo, em: r.em }))),
  };
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const rota = url.pathname;
    if (rota !== '/api/placar' && rota !== '/api/quiz' && rota !== '/api/quiz/dia') return env.ASSETS.fetch(req);
    if (!env.DB) return json({ erro: 'Placar indisponível.' }, 503);
    try {
      await preparar(env.DB);
      const eu = url.searchParams.get('eu');
      const limite = limiteDe(url.searchParams.get('limite'));
      if (rota === '/api/quiz/dia') {
        if (req.method === 'GET') return json(await quizDia(env.DB, url.searchParams.get('data')));
      } else if (rota === '/api/quiz') {
        if (req.method === 'GET') return json(await quizResumo(env.DB, eu, limite));
        if (req.method === 'POST') return await quizEnviar(req, env.DB);
      } else {
        if (req.method === 'GET') return json({ top: await top10(env.DB, eu, limite) });
        if (req.method === 'POST') return await enviar(req, env.DB);
      }
      return json({ erro: 'Método não permitido.' }, 405);
    } catch (e) {
      console.error(e);
      return json({ erro: 'Placar indisponível agora.' }, 500);
    }
  },
};
