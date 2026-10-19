# Vídeo: Microplásticos e Saúde

Vídeo de apresentação do projeto extensionista, feito com [Remotion](https://www.remotion.dev)
(cada cena é um componente React em `src/cenas`). 1920 × 1080, 30 fps, sem narração.

## Como usar

```bash
npm i
npx remotion studio          # pré-visualizar e ajustar no navegador
npx remotion render Apresentacao out/microplasticos-e-saude.mp4
```

- Textos e tempos de cada cena: `src/cenas/*.tsx` e a lista `CENAS` em `src/Apresentacao.tsx`.
- Cores, fontes e tamanhos de texto: `src/tema.tsx`.
- As fontes ficam em `public/fontes` (Bricolage Grotesque e Source Serif 4, licença SIL OFL).
- Antes de exportar, troque os campos entre colchetes: `[Nomes do grupo]`, `[Curso]`,
  `[Instituição]` e `[endereço do site]` (cenas `Projeto` e `Encerramento`).
