# Drogaria Runner (Deploy Guide)

Este repositório contém o frontend (`index.html`) e o backend do jogo Drogaria Runner. Para produção, o backend já está implementado como um **Cloudflare Worker** (`_worker.js`) que serve a API e os ativos estáticos, enquanto o Python/FastAPI (`api_server.py`) continua disponível para desenvolvimento local.

## 1) Deploy do Backend (placar)

O backend expõe `/api/leaderboard` (GET/POST) e `/api/leaderboard/rank/{score}`, calcula rankings e persiste os dados em uma instância **D1** da Cloudflare com fallback para KV. Assim, não é mais necessário o arquivo `leaderboard.db` para deploy; o armazenamento é remoto e persistente.

### Recomendado: Cloudflare Workers + D1

1. Instale o Wrangler globalmente (`npm install -g wrangler`) e autentique com `wrangler login`.
2. No diretório do projeto, o arquivo `wrangler.jsonc` já referencia `_worker.js`, os assets e o binding `DB` para o D1.
3. No painel da Cloudflare:
   - Crie o banco D1 chamado `projeto-extensionista-db` e execute o SQL em [schema.sql](./schema.sql) para criar a tabela `scores` e o índice.
   - Crie um namespace KV `LEADERBOARD_KV` caso queira fallback em JSON (o worker já lê esse namespace quando o D1 não estiver disponível).
4. Rode `wrangler publish` para implantar o worker e receber a URL pública (<code>https://projeto-extensionista.YOUR_ZONE.workers.dev</code> ou semelhante). O mesmo worker já serve `index.html`, vídeos e cutscenes via `env.ASSETS`.
5. Para testar localmente, use `wrangler dev --local`. O backend Python (`api_server.py`) permanece útil apenas para desenvolvimento offline com `uvicorn api_server:app`.

### D1 e KV (persistência)

- **D1:** abra o banco no painel da Cloudflare, cole o conteúdo de [`schema.sql`](./schema.sql) e execute-o para criar a tabela `scores` com os campos esperados pelo worker.
- **KV (fallback):** o namespace `LEADERBOARD_KV` guarda até 100 registros ordenados por pontuação, e o worker gera rank/total a partir desse JSON. Se o D1 estiver configurado, ele sempre é priorizado.
- O worker já aplica CORS, valida os campos e responde com `rank`/`created_at`, então publicar e conectar ao worker é o suficiente para ter o backend em produção.

> **Nota:** o arquivo `leaderboard.db` ainda aparece no repositório somente para testes locais com FastAPI; não é utilizado pela implantação no Cloudflare Worker.

### Alternativa: Render (legado)

Se você ainda quiser manter o backend em Python, pode usar Render:

1. Crie uma conta em [https://render.com](https://render.com).
2. Crie um novo **Web Service (Python)** apontando para este repositório no GitHub.
3. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn api_server:app --host 0.0.0.0 --port $PORT`

O Render gera uma URL pública (ex: `https://meu-backend.onrender.com`).

> **Importante:** o `leaderboard.db` será criado dentro do container do Render e pode ser resetado a cada deploy.

## 2) Deploy do Frontend (HTML + JS)

O frontend é apenas `index.html` e funciona como um site estático. Ele se comunica com o backend via `API`.

### Recomendado: Netlify (gratuito)

1. Crie uma conta em [https://app.netlify.com](https://app.netlify.com).
2. Conecte o repositório GitHub e habilite deploy automático.
3. Defina o diretório de publicação (`publish directory`) como a raiz (`/`).

### Ajuste final: apontar para o backend

No arquivo `index.html`, localize a linha:

```js
const API = "http://localhost:8000";
```

E substitua pelo URL do worker publicado, por exemplo:

```js
const API = "https://projeto-extensionista.YOUR_ZONE.workers.dev";
```

Se o worker estiver servindo o frontend diretamente, basta acessar a URL fornecida pelo `wrangler publish`, pois o asset `index.html` está incluído no que a função Cloudflare expõe.

## 3) Qual link devo compartilhar?

Depois que o frontend estiver hospedado (Netlify, Cloudflare Worker ou outro), você terá uma URL pública do tipo:

- `https://seu-jogo.netlify.app`
- ou `https://projeto-extensionista.YOUR_ZONE.workers.dev` (quando o worker serve tudo)

**É esse link do frontend que você compartilha com as pessoas** para elas jogarem (o backend fica escondido e armazenado na URL do worker ou do Render).

> Se quiser, me diga qual serviço escolheu para hospedar o frontend e posso ajudar a confirmar o link exato.

## 4) Usando um domínio próprio (opcional)

1. Compre um domínio (Namecheap, GoDaddy, etc.).
2. No serviço onde hospedou o frontend (Netlify, Cloudflare Workers, Vercel, etc.), configure o domínio personalizado.
3. Informe o domínio ao backend se a plataforma permitir.

---

**Dica rápida:**
- Se precisar de ajuda para configurar o domínio ou os deploys, envie o nome do serviço que você quer usar (por exemplo: Cloudflare Workers ou Render + Netlify) e eu te guio passo a passo.

## iFood Dashboard (opcional)

Este repositório também inclui um pequeno dashboard de controle de estoque/vendas (`ifood_dashboard.html`) e um servidor FastAPI que serve o dashboard + endpoints de API (`ifood_server.py`). Ele já vem pré-configurado para funcionar de forma similar ao Drogaria Runner:

- O dashboard usa sempre a origem atual (`window.location.origin`) para acessar `/api`, então você não precisa alterar URLs ao implantar.
- O dashboard possui funções de **exportação/importação de planilha (CSV)** diretamente do menu.
- O servidor lê as variáveis de ambiente `PORT` (e opcionalmente `HOST`) para ser compatível com plataformas como Render/Heroku.

### Como rodar localmente

1. Instale dependências:

   ```bash
   pip install -r requirements.txt
   ```

2. Inicie o servidor:

   ```bash
   python ifood_server.py
   ```

3. Abra no navegador:

   - `http://localhost:8001/`

### Como rodar em background (Windows)

Use o script preparado para rodar o servidor em segundo plano (não precisa manter o terminal aberto):

- Abra o Explorador do Windows na pasta do projeto e dê duplo clique em `run_ifood_server.bat`.

Ou, no PowerShell, execute:

```powershell
.\run_ifood_server.ps1
```

> Se você estiver usando Linux/macOS, basta rodar:
>
> ```bash
> nohup python ifood_server.py &
> ```
