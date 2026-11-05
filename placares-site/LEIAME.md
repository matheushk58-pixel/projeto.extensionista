# Placares ao vivo (site independente)

Site à parte, com projeto e endereço próprios na Cloudflare. A **única ligação** com o site
principal é o banco D1 `placar-microplasticos`: este projeto só **lê** as marcas do quiz
(`quiz_v3`) e da Missão: limpar o oceano (`placar`). Não grava nada e não cria tabelas.

- `public/index.html`: os dois placares juntos.
- `public/quiz.html`: só o placar do quiz (`/quiz`).
- `public/missao.html`: só o placar da Missão (`/missao`).
- `worker.js`: `GET /api/quiz` e `GET /api/placar` (até 50 posições, `?limite=N`).

## Publicar (uma vez)

No painel da Cloudflare: **Workers e Pages → Criar → Importar um repositório**, escolher este
repositório e configurar:

- **Nome do projeto:** `placares-microplasticos`
- **Diretório raiz:** `placares-site`
- **Comando de build:** (vazio)
- **Comando de deploy:** `npx wrangler deploy`
- **Branch de produção:** `main`

O `wrangler.jsonc` desta pasta já aponta para o banco certo. Depois disso, cada push na `main`
publica o site sozinho, e o endereço será `https://placares-microplasticos.<sua-conta>.workers.dev`.
