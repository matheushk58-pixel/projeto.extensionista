# Placar de líderes com login Google

O placar do minijogo usa o **Firebase** (Google): o login é feito com a conta Google
e as pontuações ficam no **Firestore**. O plano gratuito (Spark) é suficiente.

Enquanto `FIREBASE_CONFIG` estiver vazio no `index.html`, o placar online fica
desativado e o jogo mostra só o recorde salvo no navegador.

## 1. Criar o projeto

1. Acesse <https://console.firebase.google.com> com sua conta Google.
2. **Adicionar projeto** → dê um nome (ex.: `microplasticos-saude`) → pode desativar o Google Analytics.

## 2. Ativar o login com Google

1. Menu **Build › Authentication** → **Começar**.
2. Aba **Sign-in method** → **Google** → **Ativar** → escolha o e-mail de suporte → **Salvar**.
3. Aba **Settings › Authorized domains** → adicione o domínio onde o site vai ficar
   (ex.: `seu-usuario.github.io`, `seu-site.vercel.app` ou `seu-site.netlify.app`).
   `localhost` já vem autorizado para testes.

## 3. Criar o banco de dados

1. Menu **Build › Firestore Database** → **Criar banco de dados** → escolha a região
   `southamerica-east1 (São Paulo)` → **modo de produção**.
2. Aba **Regras** → apague o conteúdo e cole o arquivo [`firestore.rules`](./firestore.rules) → **Publicar**.

## 4. Ligar o site ao projeto

1. Na página inicial do projeto, clique no ícone **Web `</>`** → registre o app (sem Hosting).
2. O Firebase mostra um objeto `firebaseConfig`. Copie `apiKey`, `authDomain`, `projectId` e `appId`.
3. No `index.html`, procure `const FIREBASE_CONFIG` e preencha:

```js
const FIREBASE_CONFIG = {
  apiKey: 'AIza...',
  authDomain: 'microplasticos-saude.firebaseapp.com',
  projectId: 'microplasticos-saude',
  appId: '1:123456789:web:abc123',
};
```

> A `apiKey` do Firebase para web **não é uma senha**: ela fica pública no site de propósito.
> Quem protege os dados são as regras do `firestore.rules`.

## 5. Publicar o site na Cloudflare

A pasta já vem pronta para virar um **Cloudflare Worker** só de arquivos estáticos
(`wrangler.jsonc`, `_headers` e `.assetsignore`). O repositório já está ligado à
Cloudflare, então é só criar um Worker novo apontando para esta pasta:

1. Painel da Cloudflare → **Workers & Pages** → **Create** → **Import a repository**.
2. Escolha `matheushk58-pixel/projeto.extensionista`.
3. Configure:
   - **Project name:** `microplasticos-saude`
   - **Production branch:** a branch com o site (ou `main`, depois de juntar as mudanças)
   - **Root directory:** `extensionista 4`
   - **Build command:** deixe em branco
   - **Deploy command:** `npx wrangler deploy`
4. **Save and Deploy**. O endereço fica `https://microplasticos-saude.<sua-conta>.workers.dev`.
5. No Firebase, em **Authentication › Settings › Authorized domains**, adicione
   `microplasticos-saude.<sua-conta>.workers.dev` (e o seu domínio próprio, se usar um).

A cada `git push` nessa branch, a Cloudflare publica a versão nova sozinha.

Pelo terminal também funciona: dentro de `extensionista 4`, rode `npx wrangler login`
e depois `npx wrangler deploy`.

Dentro da prévia do Claude (artifact) o pop-up do Google é bloqueado: o placar
online só funciona no endereço publicado.

## O que as regras garantem

- Qualquer pessoa vê o placar (top 10).
- Só quem entrou com Google grava, e apenas o **próprio** registro (`placar/<uid>`).
- A marca só pode **aumentar**, com campos e limites conferidos no servidor.
- Ninguém apaga registros pelo site (o dono do projeto apaga pelo console, se precisar).
- No placar aparece só o primeiro nome e a inicial do sobrenome, mais a foto da conta Google.
