"""Monta o guia de apoio em HTML (para imprimir em PDF com o Chromium).

Uso: python3 montar_guia.py <index.html do site> <pasta das fontes> <saida.html>
"""
import re
import sys

import segno

SITE = "https://projeto-extensionista.qjperfumaria.workers.dev/"
SITE_CURTO = "projeto-extensionista.qjperfumaria.workers.dev"

index_html, pasta_fontes, saida = sys.argv[1:4]

html_site = open(index_html, encoding="utf-8").read()
refs = re.findall(r'<li id="r-[^"]+">(.*?)</li>', html_site)
assert len(refs) == 24, len(refs)
refs = [re.sub(r'<a class="doi" href="[^"]+">([^<]+)</a>', r"\1", r) for r in refs]

qr = segno.make(SITE, error="m")


def qr_svg(cor, tamanho):
    svg = qr.svg_inline(scale=1, border=0, dark=cor, light=None, omitsize=True)
    return svg.replace("<svg ", f'<svg style="width:{tamanho}mm;height:{tamanho}mm" ', 1)


def c(*n):
    return '<sup class="ref">[' + ", ".join(str(x) for x in n) + "]</sup>"


ROTEIRO = [
    ("0:00", "Abertura", "Tema, grupo e universidade."),
    ("0:06", "O que são", "Definição, tamanho e nanoplásticos."),
    ("0:20", "Escala", "Do grão de arroz ao micrômetro: até onde a partícula chega."),
    ("0:35", "Oceanos", "Quanto plástico chega ao mar e flutua na superfície."),
    ("0:43", "Cadeia alimentar", "Plâncton, filtradores, peixes e pessoas."),
    ("0:58", "Efeitos nos animais", "Danos físicos, poluentes e biofilme."),
    ("1:08", "Exposição humana", "Ingestão, inalação e pele; quanto ingerimos."),
    ("1:22", "Mapa do corpo", "Órgãos onde já se encontrou plástico."),
    ("1:38", "Artérias", "O estudo do NEJM e o que ele prova (e não prova)."),
    ("1:48", "Brasil", "As pesquisas da USP: pulmão e bulbo olfatório."),
    ("1:59", "Incertezas", "Por que ainda não há conclusão sobre riscos."),
    ("2:15", "O que fazer", "Ações no dia a dia e na comunidade."),
    ("2:28", "O projeto", "O site, o quiz e o minijogo."),
    ("2:38", "Fontes", "As principais referências."),
    ("2:45", "Equipe", "Integrantes do Grupo 4."),
    ("2:52", "Encerramento", "Agradecimento e convite ao site."),
]

SECOES = [
    ("O que são", "Animação com os cinco tipos de partícula e um controle para encolher a partícula e ver até onde ela chega no corpo."),
    ("Ecossistemas aquáticos", "Números do oceano e um recife em 3D: clique nos animais para seguir o plástico na cadeia alimentar."),
    ("Corpo humano", "Vias de exposição, a comparação entre água da torneira e engarrafada e o mapa interativo dos órgãos."),
    ("Quiz", "Seis afirmações de verdadeiro ou falso, cada uma com a explicação e a fonte."),
    ("Jogo", "“Missão: limpar o oceano”: corra pelo fundo do mar recolhendo plástico antes que ele vire microplástico."),
    ("O que fazer", "Lista de ações para marcar: no dia a dia e na comunidade."),
    ("Pesquisa", "A pesquisa anônima do projeto, para responder ali mesmo."),
    ("Referências", "As 24 fontes no formato ABNT, com DOI."),
    ("Apresentação", "Os slides da apresentação, para rever em tela cheia."),
]

FAQ = [
    ("O que são microplásticos?",
     f"Partículas de plástico com menos de 5 milímetros{c(22)}. Abaixo de 1 micrômetro (um milésimo de milímetro), passam a ser chamadas de nanoplásticos. O termo ficou conhecido em 2004, quando pesquisadores britânicos mostraram que esses fragmentos se acumulavam em praias e no plâncton desde a década de 1960{c(1)}."),
    ("De onde eles vêm?",
     f"Há dois tipos. Os <b>primários</b> já são fabricados pequenos, como as microesferas de cosméticos e os pellets industriais. Os <b>secundários</b> vêm da quebra de objetos maiores: garrafas, sacolas, redes de pesca, pneus e fibras de roupas. São a maior parte do que se encontra no ambiente{c(3)}. Uma carga de 6 kg de roupas de acrílico pode soltar cerca de 700 mil fibras na lavagem{c(20)}."),
    ("Como o plástico chega ao oceano?",
     f"Por rios, esgotos, ventos e pela pesca{c(23)}. Em 2010, de 4,8 a 12,7 milhões de toneladas de resíduos plásticos chegaram ao mar vindos de países costeiros{c(5)}. Uma estimativa mínima calcula 5,25 trilhões de partículas flutuando nos oceanos{c(4)}."),
    ("Como ele chega até nós?",
     f"Pela cadeia alimentar: o plâncton confunde partículas com alimento, os mexilhões e ostras as retêm ao filtrar a água, e os peixes comem esses organismos{c(7, 8)}. Em mercados da Indonésia e dos EUA, 1 em cada 4 peixes vendidos tinha detritos de origem humana{c(6)}. Frutos do mar, sal marinho e água potável estão entre as vias de exposição{c(2)}."),
    ("Quanto microplástico uma pessoa ingere?",
     f"Uma revisão estimou entre 39 mil e 52 mil partículas por ano pela alimentação, e mais de 74 mil somando o que é inalado{c(11)}. Os próprios autores consideram os números subestimados. Em 2024, uma técnica nova de microscopia contou cerca de 240 mil partículas por litro de água engarrafada, a maioria nanoplásticos{c(12)}."),
    ("Água engarrafada ou da torneira?",
     f"Quem bebe só água engarrafada ingere, segundo a estimativa, cerca de 90 mil partículas a mais por ano; só pela torneira, seriam cerca de 4 mil{c(11)}. Por isso a recomendação é preferir água filtrada da torneira, quando a água local for tratada e segura."),
    ("Por que o tamanho da partícula importa?",
     f"Quanto menor a partícula, mais fácil ela atravessa barreiras do corpo e mais difícil é medi-la{c(2)}. Segundo a Autoridade Europeia para a Segurança dos Alimentos, as maiores tendem a ficar no intestino; as menores podem atravessá-lo e chegar a órgãos{c(19)}."),
    ("Em que partes do corpo já foram encontrados?",
     f"Placenta, pulmão, sangue, placas das artérias carótidas, bulbo olfatório, cérebro, fígado e rim. A tabela da página {{PAG_CORPO}} resume cada estudo{c(13, 14, 15, 16, 17, 18)}."),
    ("Então microplásticos causam doenças?",
     f"<b>Ainda não está provado.</b> Encontrar plástico em um órgão não é o mesmo que provar que ele causa doença. O estudo do NEJM viu 4,5 vezes mais infarto, AVC ou morte em quem tinha plástico na placa da carótida, mas é um estudo observacional: mostra associação, não causa{c(16)}. A OMS concluiu em 2022 que os dados ainda não bastam para uma avaliação completa de risco{c(2)}."),
    ("O que as pesquisas brasileiras encontraram?",
     f"Equipes da USP analisaram autópsias de moradores de São Paulo. Encontraram partículas de plástico em 13 de 20 amostras de pulmão{c(14)} e no bulbo olfatório de 8 de 15 pessoas{c(17)}. A hipótese é que o nariz seja uma porta de entrada para o cérebro."),
    ("E os animais, o que sofrem?",
     f"As partículas podem bloquear ou ferir o trato digestivo e dar uma falsa sensação de saciedade, tirando energia para crescer e se reproduzir{c(8, 24)}. O plástico também atrai poluentes e metais da água, carrega aditivos e serve de casa para bactérias que viajam com ele{c(9)}. Tartarugas marinhas do mundo todo ingerem detritos plásticos{c(21)}."),
    ("Está só no mar?",
     f"Não. Rios, lagos, o solo, o ar e a água de torneira e engarrafada também têm microplásticos; a OMS dedicou um relatório só à água potável{c(10)}."),
    ("Dá para evitar completamente?",
     "Não é possível zerar a exposição, mas é possível reduzi-la e, principalmente, reduzir o plástico que chega à água. A lista de ações do site está logo abaixo."),
]

CORPO = [
    ("Placenta", "4 de 6 placentas com microplásticos", "Ragusa et al., 2021", 13, False),
    ("Pulmão", "13 de 20 amostras com partículas de plástico", "Amato-Lourenço et al., 2021", 14, True),
    ("Sangue", "1,6 µg/mL em média; cerca de 3 em 4 doadores com plástico", "Leslie et al., 2022", 15, False),
    ("Artérias carótidas", "4,5× mais infarto, AVC ou morte no grupo com plástico na placa", "Marfella et al., 2024", 16, False),
    ("Bulbo olfatório", "8 de 15 pessoas com plástico", "Amato-Lourenço et al., 2024", 17, True),
    ("Cérebro", "+50% de plástico entre 2016 e 2024; 7 a 30× mais que fígado e rim", "Nihart et al., 2025", 18, False),
    ("Fígado e rim", "Plástico em todas as amostras", "Nihart et al., 2025", 18, False),
]

INCERTEZAS = [
    "<b>Amostras pequenas:</b> muitos estudos analisaram poucas dezenas de pessoas.",
    "<b>Falta de métodos padronizados</b>, principalmente para partículas abaixo de 10 µm.",
    "<b>Risco de contaminação</b> das amostras pelo próprio ambiente do laboratório.",
    "<b>Associação não é causa:</b> estudos observacionais mostram associação; testes em células e animais sugerem inflamação, mas em doses nem sempre comparáveis à exposição real.",
]

ACOES_DIA = [
    "Prefira água filtrada da torneira à engarrafada, quando a água local for tratada e segura.",
    "Não aqueça comida em potes plásticos no micro-ondas; use vidro ou cerâmica.",
    "Limpe a casa com pano úmido e ventile: a poeira doméstica concentra fibras sintéticas.",
    "Lave roupas sintéticas com menos frequência, em ciclos frios e com a máquina cheia.",
    "Evite cosméticos com microesferas (procure “polietileno” ou “polyethylene” no rótulo).",
]
ACOES_COMUNIDADE = [
    "Separe o lixo reciclável e apoie cooperativas de catadores.",
    "Participe de mutirões de limpeza de praias, rios e córregos.",
    "Reduza descartáveis: garrafa, sacola e copo reutilizáveis.",
    "Cobre políticas de saneamento: esgoto sem tratamento leva plástico aos rios.",
    "Compartilhe informação confiável, sempre com a fonte.",
]

GLOSSARIO = [
    ("Nanoplástico", "Partícula de plástico menor que 1 micrômetro."),
    ("Micrômetro (µm)", "Um milésimo de milímetro."),
    ("Polímero", "O material de que o plástico é feito, como polietileno (PE), polipropileno (PP), PET e poliestireno."),
    ("Biofilme", "Comunidade de bactérias que cresce grudada na superfície do plástico."),
    ("Filtradores", "Animais, como mexilhões e ostras, que se alimentam filtrando a água."),
    ("Bulbo olfatório", "Parte do cérebro ligada ao olfato, logo acima do nariz."),
    ("Barreira hematoencefálica", "Proteção natural que controla o que passa do sangue para o cérebro."),
    ("Estudo observacional", "Pesquisa que observa pessoas sem intervir; mostra associação, mas não prova causa."),
    ("Revisado por pares", "Artigo avaliado por outros cientistas antes de ser publicado."),
]

EQUIPE = [
    "Matheus Henrique Quintino Julio", "Rafael Sobreira Feitoza", "João Fabrício Sivero",
    "Fabiana Bernadino da Costa Rodrigues", "Sara dos Santos Rocha", "Maiara Rosa da Silva",
    "Eduardo Talhoni Ribeiro", "Emily Janaína Santos Silva", "Maria Letícia Lima Madrid",
    "Victoria Gabriely Oliveira Santos", "Ana Clara Silva Dantas", "Ana Lívia de Freitas Rocha",
]

PAG = {"PAG_CORPO": "5", "PAG_ACOES": "6"}


def rodape(n):
    return f'<footer><span>Microplásticos e Saúde · Guia de apoio</span><span>{SITE_CURTO}</span><span>{n}</span></footer>'


def fragmentos():
    return """<svg class="frag" viewBox="0 0 210 297" aria-hidden="true"><g opacity="0.9">
<path d="M150 40 l14 -5 6 13 -13 6z" fill="#D9366B"/><circle cx="178" cy="72" r="3.2" fill="#E3A821"/>
<path d="M188 120 l12 4 -4 11 -10 -4z" fill="#7A55C9"/><path d="M128 64 q8 -12 18 -4 t18 2" stroke="#6FD0EA" stroke-width="1.3" fill="none" stroke-linecap="round"/>
<circle cx="160" cy="150" r="2.4" fill="#1C9CC0"/><circle cx="196" cy="52" r="1.6" fill="#2EA36B"/>
<path d="M140 108 l7 -2 3 7 -7 3z" fill="#2EA36B"/><circle cx="120" cy="30" r="1.8" fill="#D9366B"/></g></svg>"""


def sub(texto):
    for k, v in PAG.items():
        texto = texto.replace("{" + k + "}", v)
    return texto


paginas = []

# 1. Capa
paginas.append(f"""
<section class="pag escura capa">
{fragmentos()}
<p class="sobre">Projeto extensionista · Guia de apoio</p>
<h1>Microplásticos<br><span>e Saúde</span></h1>
<div class="barra"></div>
<p class="lead">Impactos no corpo humano e nos ecossistemas aquáticos</p>
<p class="capa-txt">Perguntas e respostas para depois do vídeo e do site: o roteiro da apresentação, os dados principais e onde conferir cada fonte.</p>
<div class="capa-qr">
  <div class="qr-caixa">{qr_svg('#0F2733', 34)}</div>
  <div><p class="qr-rot">Acesse o site</p><p class="qr-url">{SITE_CURTO}</p><p class="qr-nota">Aponte a câmera do celular para o código.</p></div>
</div>
<p class="capa-rodape">Grupo 4 · Curso de Farmácia · Universidade Nove de Julho · São Paulo, 2026</p>
</section>""")

# 2. Como usar + materiais + mapa do site
secoes = "".join(f"<li><b>{t}</b><span>{d}</span></li>" for t, d in SECOES)
paginas.append(f"""
<section class="pag">
<p class="sobre">Comece por aqui</p>
<h2>Como usar este guia</h2>
<p class="lead-claro">A apresentação tem três partes que se completam. Este guia organiza tudo em um só lugar para responder às dúvidas da turma depois da exibição.</p>
<div class="tres">
  <div class="card"><p class="num-g">2:58</p><h3>Vídeo</h3><p>Resumo animado do tema, do oceano ao corpo humano. O roteiro com a minutagem está na página 3.</p></div>
  <div class="card"><p class="num-g">9</p><h3>Seções no site</h3><p>Conteúdo completo, com cenas 3D, quiz, minijogo e as 24 referências.</p></div>
  <div class="card"><p class="num-g">18</p><h3>Slides</h3><p>A apresentação em tela cheia, dentro do próprio site, na seção Apresentação.</p></div>
</div>
<h3 class="h3-sec">O que tem em cada seção do site</h3>
<ul class="secoes">{secoes}</ul>
<div class="aviso"><b>Sobre as fontes.</b> Os números entre colchetes, como {c(11).replace('sup class="ref"', 'span class="ref"').replace('</sup>', '</span>')}, indicam a referência na lista da página 7, a mesma numeração usada no site.</div>
<div class="aviso"><b>Pesquisa do projeto.</b> Ajude o curso de Farmácia da Uninove respondendo à pesquisa anônima sobre microplásticos: <b>forms.gle/bjmRArt5MXB87Ryv9</b>. O link também está no site, na seção Pesquisa.</div>
{rodape(2)}
</section>""")

# 3. Roteiro do vídeo
linhas = "".join(f'<tr><td class="tempo">{t}</td><td class="cena">{n}</td><td>{d}</td></tr>' for t, n, d in ROTEIRO)
paginas.append(f"""
<section class="pag">
<p class="sobre">Vídeo</p>
<h2>Roteiro da apresentação</h2>
<p class="lead-claro">Use a minutagem para voltar ao trecho certo quando alguém perguntar sobre um ponto específico.</p>
<table class="roteiro"><thead><tr><th>Tempo</th><th>Cena</th><th>O que mostra</th></tr></thead><tbody>{linhas}</tbody></table>
<div class="faixa">
  <div><p class="faixa-rot">Ambiente aquático</p><p>0:06 a 1:08</p></div>
  <div><p class="faixa-rot">Corpo humano</p><p>1:08 a 2:15</p></div>
  <div><p class="faixa-rot">O que fazer e o projeto</p><p>2:15 a 2:58</p></div>
</div>
{rodape(3)}
</section>""")

# 4-5. Perguntas frequentes
faq_html = [f'<div class="q"><h3><span class="qn">{i + 1:02d}</span>{p}</h3><p>{sub(r)}</p></div>' for i, (p, r) in enumerate(FAQ)]
paginas.append(f"""
<section class="pag">
<p class="sobre">Dúvidas</p>
<h2>Perguntas frequentes</h2>
<div class="faq">{''.join(faq_html[:7])}</div>
{rodape(4)}
</section>""")

corpo = "".join(
    f'<tr><td class="cena">{o}{" <span class=br>Brasil</span>" if br else ""}</td><td>{d}</td><td class="est">{e} {c(n)}</td></tr>'
    for o, d, e, n, br in CORPO
)
incert = "".join(f"<li>{x}</li>" for x in INCERTEZAS)
paginas.append(f"""
<section class="pag">
<div class="faq">{''.join(faq_html[7:11])}</div>
<h3 class="h3-sec">Onde já foram encontrados no corpo</h3>
<table class="corpo"><thead><tr><th>Órgão</th><th>Dado principal</th><th>Estudo</th></tr></thead><tbody>{corpo}</tbody></table>
{rodape(5)}
</section>""")

dia = "".join(f"<li>{x}</li>" for x in ACOES_DIA)
com = "".join(f"<li>{x}</li>" for x in ACOES_COMUNIDADE)
glos = "".join(f"<div><dt>{t}</dt><dd>{d}</dd></div>" for t, d in GLOSSARIO)
paginas.append(f"""
<section class="pag">
<div class="faq">{''.join(faq_html[11:])}</div>
<div class="duas">
  <div class="incerto"><h3>O que a ciência ainda não sabe</h3><p>A OMS concluiu em 2022 que os dados ainda não bastam para uma avaliação completa de risco{c(2)}. Os principais limites:</p><ul>{incert}</ul></div>
  <div><h3 class="h3-sec sem-topo">O que dá para fazer</h3><p class="mini-rot">No dia a dia</p><ul class="check">{dia}</ul><p class="mini-rot">Na comunidade</p><ul class="check">{com}</ul></div>
</div>
<h3 class="h3-sec">Glossário</h3>
<dl class="glos">{glos}</dl>
{rodape(6)}
</section>""")

# 7. Referências
refs_html = "".join(f"<li>{r}</li>" for r in refs)
paginas.append(f"""
<section class="pag">
<p class="sobre">Fontes</p>
<h2>Referências</h2>
<p class="lead-claro pequeno">Artigos revisados por pares e relatórios de organismos internacionais, no formato ABNT NBR 6023. No site, cada referência tem o link do DOI.</p>
<ol class="refs">{refs_html}</ol>
{rodape(7)}
</section>""")

# 8. Equipe + contracapa
equipe = "".join(f"<li>{n}</li>" for n in EQUIPE)
paginas.append(f"""
<section class="pag escura fim">
<p class="sobre">Equipe</p>
<h2 class="claro">Grupo 4</h2>
<ul class="equipe">{equipe}</ul>
<p class="uni">Curso de Farmácia · Universidade Nove de Julho · São Paulo, 2026</p>
<div class="fim-qr">
  <div class="qr-caixa">{qr_svg('#0F2733', 40)}</div>
  <div><p class="fim-titulo">Ficou com alguma dúvida?</p><p class="fim-txt">Teste o que aprendeu no quiz e no minijogo do site, e confira cada número na fonte original. Ajude o projeto respondendo à nossa pesquisa anônima: <b class="pesq">forms.gle/bjmRArt5MXB87Ryv9</b></p><p class="qr-url grande">{SITE_CURTO}</p></div>
</div>
</section>""")

CSS = f"""
@font-face {{ font-family: 'Bricolage'; src: url('file://{pasta_fontes}/bricolage.woff2') format('woff2'); font-weight: 200 800; }}
@font-face {{ font-family: 'SourceSerif'; src: url('file://{pasta_fontes}/source-serif.woff2') format('woff2'); font-weight: 200 900; }}
@page {{ size: A4; margin: 0; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
body {{ font-family: 'SourceSerif', Georgia, serif; color: #0F2733; font-size: 10.2pt; line-height: 1.45; }}
.pag {{ width: 210mm; height: 297mm; padding: 20mm 18mm 22mm; position: relative; overflow: hidden; background: #F1F4F2; page-break-after: always; }}
.pag:last-child {{ page-break-after: auto; }}
.escura {{ background: #0F2733; color: #E8EFEC; }}
h1, h2, h3, .sobre, .num-g, .qr-url, .qr-rot, footer, th, .tempo, .cena, .qn, .mini-rot, .faixa-rot, dt, .fim-titulo, .uni, .capa-rodape {{ font-family: 'Bricolage', Arial, sans-serif; }}
.sobre {{ font-size: 9.5pt; font-weight: 600; letter-spacing: .02em; color: #1C9CC0; margin-bottom: 3mm; }}
.escura .sobre {{ color: #6FD0EA; }}
h2 {{ font-size: 25pt; font-weight: 800; letter-spacing: -.02em; line-height: 1.05; margin-bottom: 5mm; }}
h2.claro {{ color: #fff; }}
h3 {{ font-size: 11.5pt; font-weight: 700; line-height: 1.25; }}
.h3-sec {{ margin: 7mm 0 3mm; font-size: 13pt; }}
.h3-sec.sem-topo {{ margin-top: 0; }}
.lead-claro {{ font-size: 11.5pt; color: #2B4350; max-width: 160mm; margin-bottom: 6mm; }}
.lead-claro.pequeno {{ font-size: 10pt; margin-bottom: 4mm; }}
.ref {{ font-family: 'Bricolage', Arial, sans-serif; font-size: 7pt; font-weight: 600; color: #C42A5C; vertical-align: super; line-height: 0; margin-left: .3mm; }}
footer {{ position: absolute; left: 18mm; right: 18mm; bottom: 9mm; display: flex; justify-content: space-between; font-size: 7.5pt; color: #4E626C; border-top: .3mm solid #D3DCD8; padding-top: 2.5mm; }}
.frag {{ position: absolute; inset: 0; width: 210mm; height: 297mm; }}

.capa {{ display: flex; flex-direction: column; justify-content: flex-end; padding-bottom: 24mm; }}
.capa h1 {{ font-size: 56pt; font-weight: 800; line-height: .95; letter-spacing: -.03em; color: #fff; position: relative; }}
.capa h1 span {{ color: #6FD0EA; }}
.barra {{ width: 42mm; height: 2.2mm; background: #D9366B; border-radius: 1mm; margin: 6mm 0; }}
.lead {{ font-size: 16pt; color: #BFD3D9; max-width: 150mm; margin-bottom: 4mm; }}
.capa-txt {{ font-size: 11pt; color: #AFC2C9; max-width: 140mm; }}
.capa-qr, .fim-qr {{ display: flex; gap: 7mm; align-items: center; margin-top: 12mm; background: #16384A; border-radius: 5mm; padding: 6mm; }}
.qr-caixa {{ background: #fff; border-radius: 3mm; padding: 3.5mm; line-height: 0; }}
.qr-rot {{ font-size: 9.5pt; font-weight: 600; color: #6FD0EA; }}
.qr-url {{ font-size: 13pt; font-weight: 700; color: #F2B84B; word-break: break-all; margin: 1mm 0; }}
.qr-url.grande {{ font-size: 11.5pt; margin-top: 3mm; white-space: nowrap; }}
.qr-nota {{ font-size: 9pt; color: #AFC2C9; }}
.capa-rodape {{ margin-top: 10mm; font-size: 10pt; color: #AFC2C9; }}

.tres {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }}
.card {{ background: #fff; border: .3mm solid #D3DCD8; border-radius: 4mm; padding: 5mm; }}
.card p {{ font-size: 9.5pt; color: #2B4350; margin-top: 1.5mm; }}
.num-g {{ font-size: 24pt !important; font-weight: 800; color: #1C9CC0 !important; line-height: 1; margin: 0 0 2mm !important; }}
.secoes {{ list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 2.5mm 6mm; }}
.secoes li {{ display: flex; flex-direction: column; border-left: 1mm solid #6FD0EA; padding: .5mm 0 .5mm 3mm; }}
.secoes b {{ font-family: 'Bricolage', Arial, sans-serif; font-size: 10.5pt; }}
.secoes span {{ font-size: 9.2pt; color: #2B4350; }}
.aviso {{ margin-top: 7mm; background: #E3E9E6; border-radius: 3mm; padding: 4mm 5mm; font-size: 9.5pt; color: #2B4350; }}
.aviso .ref {{ vertical-align: baseline; font-size: 8.5pt; }}

table {{ width: 100%; border-collapse: collapse; }}
th {{ text-align: left; font-size: 8.5pt; font-weight: 600; color: #4E626C; padding: 0 3mm 2mm 0; border-bottom: .4mm solid #0F2733; }}
td {{ padding: 2.6mm 3mm 2.6mm 0; border-bottom: .3mm solid #D3DCD8; vertical-align: top; font-size: 9.8pt; }}
.tempo {{ font-weight: 700; color: #1C9CC0; width: 16mm; font-variant-numeric: tabular-nums; }}
.cena {{ font-weight: 600; width: 42mm; }}
.est {{ width: 52mm; color: #2B4350; font-size: 9pt; }}
.br {{ font-family: 'Bricolage', Arial, sans-serif; font-size: 7pt; font-weight: 700; color: #fff; background: #2EA36B; border-radius: 1mm; padding: .3mm 1.3mm; margin-left: 1mm; vertical-align: 1px; }}
.faixa {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin-top: 6mm; }}
.faixa div {{ background: #0F2733; color: #BFD3D9; border-radius: 3mm; padding: 3.5mm 4mm; font-size: 9.5pt; }}
.faixa-rot {{ color: #fff; font-weight: 700; font-size: 10pt; }}

.faq {{ display: flex; flex-direction: column; gap: 4.2mm; }}
.q h3 {{ display: flex; gap: 3mm; align-items: baseline; margin-bottom: 1.2mm; font-size: 12pt; }}
.qn {{ font-size: 9pt; font-weight: 700; color: #fff; background: #1C9CC0; border-radius: 1.2mm; padding: .4mm 1.6mm; }}
.q p {{ padding-left: 10mm; color: #2B4350; }}

.duas {{ display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: 5mm; }}
.incerto {{ align-self: start; background: #0F2733; color: #BFD3D9; border-radius: 4mm; padding: 5mm; font-size: 9.4pt; }}
.incerto h3 {{ color: #fff; margin-bottom: 2mm; }}
.incerto ul {{ margin-top: 2mm; padding-left: 4mm; display: flex; flex-direction: column; gap: 1.6mm; }}
.incerto b {{ color: #F2B84B; }}
.incerto .ref {{ color: #F2B84B; }}
.mini-rot {{ font-size: 9pt; font-weight: 700; color: #1C9CC0; margin: 2mm 0 1mm; }}
.check {{ list-style: none; display: flex; flex-direction: column; gap: 1.3mm; font-size: 9.2pt; color: #2B4350; }}
.check li {{ padding-left: 5.5mm; position: relative; }}
.check li::before {{ content: ''; position: absolute; left: 0; top: 1.1mm; width: 2.8mm; height: 2.8mm; border: .4mm solid #2EA36B; border-radius: .8mm; }}
.glos {{ display: grid; grid-template-columns: 1fr 1fr; gap: 2mm 7mm; font-size: 8.9pt; line-height: 1.35; }}
dt {{ font-weight: 700; font-size: 9.6pt; }}
dd {{ color: #2B4350; }}

.refs {{ columns: 2; column-gap: 8mm; font-size: 7.9pt; line-height: 1.38; color: #2B4350; padding-left: 5mm; }}
.refs li {{ break-inside: avoid; margin-bottom: 1.8mm; }}
.refs li::marker {{ font-family: 'Bricolage', Arial, sans-serif; font-weight: 700; color: #C42A5C; }}

.fim .equipe {{ list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 0 8mm; position: relative; }}
.fim .equipe li {{ font-family: 'Bricolage', Arial, sans-serif; font-size: 12pt; color: #fff; padding: 2.4mm 0; border-bottom: .3mm solid #2B4F60; }}
.uni {{ margin-top: 6mm; font-size: 10.5pt; color: #AFC2C9; position: relative; }}
.fim-qr {{ position: absolute; left: 18mm; right: 18mm; bottom: 20mm; }}
.fim-titulo {{ font-size: 17pt; font-weight: 800; color: #fff; }}
.fim-txt {{ font-size: 10.5pt; color: #BFD3D9; margin-top: 1.5mm; max-width: 105mm; }}
.fim-txt .pesq {{ font-family: 'Bricolage', Arial, sans-serif; color: #6FD0EA; white-space: nowrap; }}
"""

doc = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Guia de apoio · Microplásticos e Saúde</title><style>{CSS}</style></head><body>{''.join(paginas)}</body></html>"""
open(saida, "w", encoding="utf-8").write(doc)
print("ok", len(paginas), "páginas")
