# Drogaria Runner (Deploy Guide)

Este repositório contém o frontend (index.html) e o backend (FastAPI) do jogo Drogaria Runner.

## 1) Deploy do Backend (placar)

O backend serve a API `/api/leaderboard` e salva os dados em `leaderboard.db`.

### Requisitos
- Python 3.10+ (no servidor de deploy)

### Recomendado: Render (gratuito para apps pequenos)

1. Crie uma conta em https://render.com
2. Crie um novo **Web Service (Python)** apontando para este repositório GitHub.
3. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn api_server:app --host 0.0.0.0 --port $PORT`

O Render vai gerar uma URL pública (ex: `https://meu-backend.onrender.com`).

> **Importante:** o arquivo `leaderboard.db` será criado no próprio container do Render. Quando você reimplanta, os dados podem ser reiniciados.

## 2) Deploy do Frontend (HTML + JS)

O frontend é apenas `index.html` e funciona como um site estático. Ele se comunica com o backend via `API`.

### Recomendado: Netlify (gratuito)

1. Crie uma conta em https://app.netlify.com
2. Conecte o repositório GitHub e habilite deploy automático.
3. Defina o diretório de publicação (`publish directory`) como a raiz (`/`).

### Ajuste final: apontar para o backend

No arquivo `index.html`, localize a linha:

```js
const API = "http://localhost:8000";
```

E substitua pelo URL do backend que foi gerado (por exemplo):

```js
const API = "https://meu-backend.onrender.com";
```

## 3) Qual link devo compartilhar?

Depois que o frontend estiver hospedado (por exemplo no Netlify) você terá uma URL pública do tipo:

- `https://seu-jogo.netlify.app`

**É esse link do frontend que você compartilha com as pessoas** para elas jogarem (o backend fica escondido e armazenado na URL do backend).

> Se você quiser, me diga qual serviço escolheu para hospedar o frontend e eu posso te ajudar a confirmar o link exato.

## 4) Usando um domínio próprio (opcional)

1. Compre um domínio (Namecheap, GoDaddy, etc.)
2. No serviço onde você hospedou o frontend (Netlify, Vercel, etc), configure o domínio personalizado.
3. Se quiser, informe o domínio também ao backend (algumas plataformas permitem domínio customizado).

---

**Dica rápida:**
- Se precisar de ajuda para configurar o domínio ou os deploys, envie o nome do serviço que você quer usar (por exemplo: Render + Netlify) e eu te guio passo a passo.
