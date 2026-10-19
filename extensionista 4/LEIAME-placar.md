# Placar de líderes

O placar do minijogo usa apelidos, sem login. As marcas ficam num banco **D1** da
Cloudflare, na mesma conta que publica o site.

## Como funciona

- `worker.js` (raiz do repositório) atende `GET` e `POST` em `/api/placar`. O resto do site
  sai direto dos arquivos estáticos.
- O `wrangler.jsonc` da raiz declara o banco `placar-microplasticos` sem `database_id`:
  o Wrangler cria o banco sozinho no primeiro deploy e as tabelas são criadas na primeira chamada.
- Cada navegador recebe um id aleatório. O apelido e a melhor marca ficam salvos nele, então
  quem limpar os dados do navegador começa uma linha nova no placar.

## Proteções

- Apelido de 2 a 20 caracteres, só letras, números, espaço, ponto, hífen e sublinhado, com
  uma lista de palavrões barrados.
- A pontuação precisa ser coerente com a distância e o plástico recolhido (no máximo 30 pontos
  por item com combo x5), com teto de 200 mil pontos.
- No máximo um envio a cada 8 segundos por jogador e 40 por hora por endereço IP.

## Apagar uma linha do placar

No painel da Cloudflare: **Storage & Databases › D1 › placar-microplasticos › Console**, e rode:

```sql
DELETE FROM placar WHERE nome = 'Apelido aqui';
```

## Testar localmente

Na raiz do repositório: `npx wrangler dev` e abra `http://localhost:8787/`.
O Wrangler usa um banco D1 local para os testes.
