# Drogaria São Carlos — loja de farmácia online

Site de e-commerce farmacêutico completo, em HTML, CSS e JavaScript puros —
sem build, sem dependências, sem back-end. Basta abrir `index.html`.

O projeto foi criado a partir do pedido de "uma cópia de uma página de produto
de farmácia para outra farmácia". Ele reproduz **a estrutura e as convenções**
de uma loja farmacêutica brasileira (PDP com galeria, preço/PIX/parcelamento,
cálculo de frete por CEP, abas de composição e bula, avaliações, carrinho),
com marca, textos, ilustrações e dados **totalmente originais**.

> **Loja fictícia.** Drogaria São Carlos, as marcas de produto (Lumiara, Nuvela,
> Solaris, Vitalis, Orallis, Soft Care), os registros sanitários, preços e
> avaliações foram inventados para esta demonstração. Nenhuma venda é
> processada e nenhum pagamento é cobrado.

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Home: carrossel de destaques, categorias, ofertas do dia com cronômetro, prateleiras, faixa do clube |
| `produto.html` | Página de produto (PDP) — a peça central. Aceita `?sku=` ou `?slug=` |
| `categoria.html` | Listagem com filtros. Aceita `?cat=`, `?q=` (busca) e `?sub=` |
| `carrinho.html` | Carrinho, cupom e frete |
| `checkout.html` | Checkout em 4 etapas: identificação, entrega, pagamento e confirmação |
| `conta.html` | Entrar, cadastrar, meus pedidos, meus dados, endereços e clube. Aceita `?aba=` |
| `favoritos.html` | Produtos salvos, com adicionar todos ao carrinho |
| `institucional.html` | 12 páginas de conteúdo, ajuda e políticas. Aceita `?p=` |

Sem parâmetros, `produto.html` abre o produto principal
(`?sku=LUM-CPH-250` — creme de pentear 250 ml).

## O que a página de produto faz

- **Galeria** com miniaturas e zoom por clique
- **Bloco de preço** com preço "de/por", percentual de desconto, valor no PIX
  (5% off), parcelamento calculado e preço do clube de fidelidade
- **Variações** de tamanho que recalculam preço, PIX, parcelas e clube
- **Estoque** com três estados (disponível, últimas unidades, esgotado →
  botão "avise-me")
- **Frete por CEP**: 13 faixas de CEP, com entrega padrão, expressa (só onde
  há cobertura) e retirada em loja; frete grátis acima de R$ 99
- **Abas**: descrição, modo de uso, composição, tabela de especificações e
  avaliações
- **Avisos regulatórios** por tipo de produto — MIP ("ao persistirem os
  sintomas…"), suplemento ("este produto não é um medicamento"), protetor solar
- **Avaliações** com média agregada, distribuição por estrela e formulário
  que publica o comentário na hora
- **Barra fixa de compra** ao rolar, relacionados e vistos recentemente
- **JSON-LD** `schema.org/Product` gerado para cada produto

## Medicamentos

O catálogo traz 26 itens. Os genéricos usam nome de substância, que é como
genérico se identifica — paracetamol, omeprazol, loratadina, losartana.

Dois estados que uma farmácia precisa e uma loja genérica não tem:

- **Venda sob prescrição** (`receita: true`). O item aparece na busca e nas
  categorias, mas não entra no carrinho: o botão vira *Reservar para retirada*,
  e a PDP explica que a receita é apresentada ao farmacêutico na loja. O
  bloqueio também vale no `Loja.adicionar`, para o caso de alguém chamar a
  função direto. Esses itens ficam fora da vitrine "Ofertas do dia", que é de
  compra por impulso.
- **Farmácia Popular** (`farmaciaPopular: 'gratuito' | 'desconto'`). Marca os
  medicamentos cobertos pelo programa, com selo no cartão e explicação na PDP
  ligando para a página do programa.

## Movimento

Tokens em `:root` (`--mov-rapido`, `--mov-medio`, `--mov-lento` e três curvas)
governam toda a animação; nenhum componente crava duração própria. Só
`transform` e `opacity` são animados — o navegador resolve na GPU, sem
recalcular layout.

- **Revelação ao rolar** (`assets/js/animacoes.js`): um `IntersectionObserver`
  marca seções, cartões e painéis, com escalonamento de até seis passos dentro
  de cada grupo de irmãos.
- **Conteúdo novo entra sozinho.** Um `MutationObserver` no container cobre
  filtros, paginação e a carga vinda do banco, sem instrumentar cada página.
- **Cartão de produto** amplia a imagem no hover, o coração pulsa ao favoritar
  e o contador do carrinho pulsa quando muda.
- **Painéis que trocam** — aba, acordeão, etapa do checkout, detalhe do pedido
  — entram com uma subida curta em vez de aparecer secos.

Três cuidados que o movimento exige:

- **Nada pode ficar escondido.** O estado inicial invisível só é aplicado com a
  classe `js-ativo`, que o próprio script adiciona; sem JS o conteúdo aparece
  normal. Há ainda uma rede de segurança que revela tudo após 3 s caso o
  observador falhe.
- **Cartão em prateleira horizontal fica de fora.** Os que estão à direita
  nunca intersectam a janela no eixo X e continuariam invisíveis — quem ganha
  a entrada é a prateleira inteira.
- **`prefers-reduced-motion` desliga tudo**, inclusive a revelação, que passa a
  nascer visível.

## Navegação e checkout

- **Quem gruda é o `#cabecalho`, não o `.cabecalho` de dentro.** `position:
  sticky` prende o elemento à caixa do **pai**. Com o sticky no filho, o pai
  media só a própria altura, e passados esses ~160px de rolagem o cabeçalho ia
  embora junto com ele. No `#cabecalho` o pai é o `<body>`, que acompanha a
  página inteira. A barra de aviso fica fora dele, para subir e sumir.
- **Blocos laterais precisam de invólucro que estica.** Filtros e resumo do
  carrinho também não grudavam: o `div` em volta encolhia até o tamanho deles e
  não sobrava curso. `align-self: stretch` no invólucro resolve. A caixa de
  compra da PDP não tem sticky de propósito — é mais alta que a coluna vizinha,
  então nunca haveria curso; quem assume ali é a `.barra-fixa`.
- **Âncoras** usam `scroll-margin-top` com a altura corrente do cabeçalho, senão
  o alvo pára atrás dele.
- **Cabeçalho retrátil.** Descendo, ele encolhe de 127px para 61px e esconde a
  régua de categorias; subindo, volta inteiro na hora, sem precisar chegar ao
  topo. A decisão é por direção, mas não pode ser tomada a cada quadro:
  encolher o cabeçalho encurta o documento, o navegador dispara rolagem por
  causa disso e a direção aparente se inverte, fazendo o estado piscar. Duas
  defesas resolvem — um acumulador com limiar de 50px, para que um
  deslocamento de poucos pixels nunca troque o estado, e a ressincronização da
  referência depois que o layout assenta. A altura corrente fica na variável
  CSS `--topo-fixo`, usada pelos blocos `sticky` para não passarem por baixo.
- **Menu mobile.** Abaixo de 860px a régua de categorias vira uma gaveta
  lateral com categorias, conta e ajuda, aberta pelo hambúrguer.
- **Checkout em etapas.** Identificação → entrega (com CEP, endereços salvos e
  escolha de frete) → pagamento (PIX, cartão ou boleto) → confirmação. O pedido
  é gravado e aparece em *Meus pedidos*, com detalhamento e recompra.

## Estrutura

```
index.html      produto.html   categoria.html   carrinho.html
checkout.html   conta.html     favoritos.html   institucional.html
supabase/
  migrations/          esquema e carga inicial do banco
assets/
  css/estilos.css      tokens de design, componentes e responsivo
  js/dados.js          catálogo local e configuração da loja
  js/api.js            carga do banco, com volta ao catálogo local
  js/loja.js           cabeçalho, rodapé, carrinho, favoritos, sessão, pedidos
  js/home.js  js/produto.js  js/categoria.js  js/carrinho.js
  js/checkout.js  js/conta.js  js/favoritos.js  js/institucional.js
  img/                 ilustrações SVG originais, logo e banners
```

Cabeçalho e rodapé são montados por `loja.js` em todas as páginas, então
mudanças neles valem para o site inteiro.

## Como rodar

```bash
python3 -m http.server 8000
# http://localhost:8000
```

Abrir os arquivos direto pelo `file://` também funciona.

## Como adaptar para outra farmácia

Quase tudo vive em dois lugares:

1. **`assets/js/dados.js`** — o objeto `CONFIG` no fim do arquivo tem nome da
   loja, CNPJ, farmacêutico responsável, telefone, regra de frete grátis,
   desconto do PIX, limite de parcelas e cupons. O array `PRODUTOS` é o
   catálogo; cada item aceita descrição, modo de uso, composição, tabela de
   especificações, aviso legal e avaliações.
2. **`assets/css/estilos.css`** — o bloco `:root` no topo concentra as cores.
   Trocar `--marca-*` e `--oferta-*` muda a identidade do site inteiro.

Logo e favicon estão em `assets/img/logo.svg`, `logo-claro.svg` e `favicon.svg`.

## Banco de dados

O catálogo vive hoje em `assets/js/dados.js`, mas o site já sabe ler de um
banco. Em `supabase/migrations/` estão o esquema e a carga inicial:

| Arquivo | Conteúdo |
|---|---|
| `0001_schema.sql` | 11 tabelas no schema `farmacia`, índices, triggers, RLS e privilégios |
| `0002_carga_inicial.sql` | 7 categorias, 26 produtos, 17 lojas, 9 serviços, 3 cupons, 13 faixas de frete |

Decisões que valem saber:

- **Dinheiro em centavos.** Toda coluna monetária é `integer`. Reais em ponto
  flutuante acumulam erro de arredondamento ao somar um carrinho, e `89.90`
  não é exatamente `89.90` em binário. As variações de produto, guardadas em
  JSONB, usam a mesma unidade.
- **Coluna `ordem` nos produtos.** A vitrine tem sequência curada. Sem ela a
  listagem sairia por SKU e embaralharia as prateleiras.
- **RLS em todas as tabelas.** O catálogo é leitura pública; escrever nele só
  com `service_role`, que ignora RLS. Pedido é do dono e de mais ninguém.
  Avaliar exige conta — sem isso a caixa de comentários vira alvo de robô.
- **Conta e perfil.** O login é do Supabase Auth; `clientes` é o perfil (nome, CPF,
  telefone, clube), criado por trigger no cadastro, e `enderecos` guarda um endereço
  por CEP. Cada cliente só enxerga os próprios dados.
- **Pedidos são criados pelo servidor.** O cliente só lê os próprios pedidos; criar
  pedido e mudar status é com `service_role`, numa Edge Function que recalcula preços
  e frete — o navegador não é confiável para dizer quanto custa o carrinho. É o mesmo
  ponto em que a cobrança entra (`cobrar()` em `checkout.js`).
- **Item de pedido guarda nome e preço.** O catálogo muda de preço; o pedido
  antigo tem de continuar mostrando o que o cliente pagou.

Para aplicar, preencha `config.supabase` em `dados.js`:

```js
supabase: { url: 'https://SEU-PROJETO.supabase.co', chave: 'sb_publishable_...', schema: 'farmacia' }
```

A chave publicável é pública por natureza — o que protege os dados é o RLS, não
o segredo da chave. Exponha o schema `farmacia` em *Settings → API → Exposed
schemas* do projeto.

`assets/js/api.js` cuida da carga: converte as linhas do banco para a forma que
as páginas esperam e substitui o catálogo em memória. Sem configuração, ou se a
rede falhar, o site segue com o catálogo local — avisa no console e não quebra.

## Pagamento

O checkout está pronto, mas nenhum provedor foi integrado — nenhuma cobrança
acontece e nenhum dado de cartão sai do navegador. O ponto de integração está
isolado na função `cobrar()` em `assets/js/checkout.js`: é ali que a cobrança
será criada e o retorno do provedor (QR do PIX, 3DS do cartão, linha digitável
do boleto) tratado. O pedido já nasce com um campo `status` correspondente.

## Estado salvo no navegador

Carrinho, favoritos, CEP, produtos vistos, avaliações escritas, sessão do
cliente, pedidos e endereços ficam em `localStorage` (prefixo `dsc:`). Toda
leitura é protegida por `try/catch`, então o site funciona normalmente em
janela anônima.

## Acessibilidade

HTML semântico, link "pular para o conteúdo", abas navegáveis por setas do
teclado, `aria-live` nos avisos e no resultado do frete, foco visível,
alvos de toque adequados e suporte a `prefers-reduced-motion`.

## Testes

São oito suítes, somando 209 checagens. O esquema é validado contra um
Postgres real: as duas migrations são aplicadas
do zero e 12 checagens confirmam as políticas de acesso — visitante lê o
catálogo, não lê pedido, não escreve no catálogo, não avalia sem conta. Um teste
de mapeamento pega as linhas reais do banco e confirma que o catálogo resultante
é idêntico ao estático, campo a campo. Outro derruba o banco de propósito para
garantir que a loja abre mesmo assim.

A interface foi verificada com Playwright em 1360px e 390px, em duas suítes
que somam mais de 100 checagens: renderização, busca, carrinho, variações de
produto, frete (válido e inválido), filtros, ordenação, cupons, cabeçalho
retrátil, menu mobile, favoritos, conta, checkout completo, gravação do pedido
e ausência de rolagem horizontal no mobile em todas as páginas.
