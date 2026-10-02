/* =========================================================================
   Página de produto (PDP)
   ========================================================================= */
(function (janela, documento) {
  'use strict';

  var D = janela.LojaDados;
  var L = janela.Loja;
  var CFG = D.config;

  var parametros = new janela.URLSearchParams(janela.location.search);

  /* resolvidos em montar(): o catálogo pode vir do banco depois deste script */
  var produto = null;
  var variacaoAtual = null;

  function resolverProduto() {
    produto = D.porSku(parametros.get('sku') || '') ||
              D.porSlug(parametros.get('slug') || '') ||
              D.produtos[0];

    variacaoAtual = null;
    if (produto.variacoes) {
      produto.variacoes.forEach(function (v) { if (v.padrao) variacaoAtual = v; });
      if (!variacaoAtual) variacaoAtual = produto.variacoes[0];
    }
  }

  function precoAtual()   { return variacaoAtual ? variacaoAtual.preco   : produto.preco; }
  function precoDeAtual() { return variacaoAtual ? variacaoAtual.precoDe : produto.precoDe; }
  function precoClubeAtual() {
    return produto.precoClube ? precoAtual() * (1 - CFG.descontoClube) : null;
  }

  /* ------------------------------------------------------------ trilha */
  function trilha() {
    documento.getElementById('trilha').innerHTML =
      '<nav class="trilha" aria-label="Você está aqui"><div class="container"><ol>' +
        '<li><a href="index.html">Início</a></li>' +
        '<li><a href="categoria.html?cat=' + produto.categoria + '">' +
          L.escapar(D.nomeCategoria(produto.categoria)) + '</a></li>' +
        '<li><a href="categoria.html?cat=' + produto.categoria + '&sub=' +
          encodeURIComponent(produto.subcategoria) + '">' + L.escapar(produto.subcategoria) + '</a></li>' +
        '<li aria-current="page">' + L.escapar(produto.nome) + '</li>' +
      '</ol></div></nav>';
  }

  /* ------------------------------------------------------------ galeria */
  function galeria() {
    var imagens = produto.galeria && produto.galeria.length ? produto.galeria : [produto.imagem];
    var off = produto.precoDe ? Math.round((1 - produto.preco / produto.precoDe) * 100) : 0;

    var selos = '';
    if (produto.estoque <= 0) selos += '<span class="selo selo--esgotado">Indisponível</span>';
    else if (off > 0) selos += '<span class="selo selo--oferta">-' + off + '% OFF</span>';
    if (produto.generico) selos += '<span class="selo selo--generico">Genérico</span>';
    if (produto.receita) selos += '<span class="selo selo--receita">Sob prescrição</span>';
    if (produto.farmaciaPopular) {
      selos += '<span class="selo selo--popular">Farmácia Popular' +
        (produto.farmaciaPopular === 'gratuito' ? ' · grátis' : '') + '</span>';
    }

    return '<div class="galeria">' +
      '<div class="galeria__miniaturas" role="tablist" aria-label="Imagens do produto">' +
        imagens.map(function (img, i) {
          return '<button class="galeria__miniatura" type="button" role="tab" data-img="' + i + '" ' +
            'aria-current="' + (i === 0 ? 'true' : 'false') + '" ' +
            'aria-label="Ver imagem ' + (i + 1) + ' de ' + imagens.length + '">' +
            '<img src="assets/img/' + L.escapar(img) + '" alt="" width="72" height="72"></button>';
        }).join('') +
      '</div>' +
      '<div class="galeria__palco" id="palco">' +
        '<div class="galeria__selos">' + selos + '</div>' +
        '<img id="imagem-principal" src="assets/img/' + L.escapar(imagens[0]) + '" ' +
          'alt="' + L.escapar(produto.nome) + '" width="480" height="480">' +
      '</div></div>';
  }

  /* ------------------------------------------------------------ ficha */
  function ficha() {
    var beneficios = (produto.beneficios || []).map(function (b) {
      return '<li>' + L.icone('cheque', 16) + '<span>' + L.escapar(b) + '</span></li>';
    }).join('');

    var variacoes = '';
    if (produto.variacoes && produto.variacoes.length > 1) {
      variacoes = '<div class="variacoes"><span class="variacoes__titulo">Escolha o tamanho:</span>' +
        '<div class="variacoes__opcoes">' +
          produto.variacoes.map(function (v) {
            return '<button class="variacao" type="button" data-variacao="' + L.escapar(v.id) + '" ' +
              'aria-pressed="' + (v.id === variacaoAtual.id ? 'true' : 'false') + '">' +
              L.escapar(v.rotulo) + '<small>' + L.escapar(v.detalhe || '') + '</small></button>';
          }).join('') +
        '</div></div>';
    }

    return '<div class="ficha">' +
      '<span class="ficha__marca">' + L.escapar(produto.marca) + '</span>' +
      '<h1>' + L.escapar(produto.nome) + '</h1>' +
      '<div class="ficha__meta">' +
        '<span class="avaliacao">' + L.estrelas(produto.nota, 16) +
          '<strong>' + produto.nota.toFixed(1).replace('.', ',') + '</strong></span>' +
        '<a href="#avaliacoes">' + produto.qtdAvaliacoes + ' avaliações</a>' +
        '<span>Ref.: ' + L.escapar(produto.sku) + '</span>' +
        '<button class="btn btn--fantasma" type="button" data-favorito="' + L.escapar(produto.sku) + '" ' +
          'aria-pressed="' + (L.ehFavorito(produto.sku) ? 'true' : 'false') + '">' +
          L.icone('coracao', 16, L.ehFavorito(produto.sku)) + ' Favoritar</button>' +
      '</div>' +
      '<p class="ficha__resumo">' + L.escapar(produto.resumo) + '</p>' +
      '<ul class="ficha__beneficios">' + beneficios + '</ul>' +
      variacoes +
      '</div>';
  }

  /* ------------------------------------------------------------ compra */
  function caixaCompra() {
    var preco = precoAtual();
    var precoDe = precoDeAtual();
    var off = precoDe && precoDe > preco ? Math.round((1 - preco / precoDe) * 100) : 0;
    var parc = L.parcelamento(preco);
    var clube = precoClubeAtual();
    var fora = produto.estoque <= 0;

    var estoqueTexto, estoqueClasse;
    if (fora) { estoqueTexto = 'Produto indisponível'; estoqueClasse = 'fora'; }
    else if (produto.estoque <= 10) { estoqueTexto = 'Últimas ' + produto.estoque + ' unidades'; estoqueClasse = 'baixo'; }
    else { estoqueTexto = 'Em estoque — envio imediato'; estoqueClasse = 'ok'; }

    return '' +
      '<div class="compra__precos">' +
        (off > 0 ? '<div class="compra__linha-antiga">' +
          '<span class="preco-antigo">' + L.moeda(precoDe) + '</span>' +
          '<span class="selo selo--oferta">-' + off + '%</span></div>' : '') +
        '<div class="compra__principal">' + L.moeda(preco) + '</div>' +
        '<div class="compra__pix">' + L.icone('pix', 15) +
          L.moeda(L.precoPix(preco)) + ' no PIX (5% de desconto)</div>' +
        (parc.vezes > 1
          ? '<div class="compra__parcelas">ou até ' + parc.vezes + 'x de ' +
            L.moeda(parc.valor) + ' sem juros no cartão</div>'
          : '<div class="compra__parcelas">ou à vista no cartão</div>') +
      '</div>' +

      (clube ? '<div class="compra__clube">' +
        '<b>' + L.icone('coracao', 14, true) + ' Preço Clube São Carlos</b>' +
        '<span class="valor">' + L.moeda(clube) + '</span>' +
        '<small>Economize ' + L.moeda(preco - clube) + ' — a assinatura do clube é gratuita.</small>' +
      '</div>' : '') +

      '<div class="estoque estoque--' + estoqueClasse + '">' +
        '<span class="ponto"></span>' + estoqueTexto + '</div>' +

      (produto.receita ? '' :
      '<div class="quantidade">' +
        '<div class="contador">' +
          '<button type="button" data-qtd="-1" aria-label="Diminuir quantidade">−</button>' +
          '<label class="so-leitor" for="qtd">Quantidade</label>' +
          '<input id="qtd" type="number" value="1" min="1" max="' + Math.max(1, produto.estoque) + '">' +
          '<button type="button" data-qtd="1" aria-label="Aumentar quantidade">+</button>' +
        '</div>' +
        '<span style="font-size:12.5px;color:var(--tinta-500)">Máx. ' +
          Math.max(1, produto.estoque) + ' un. por pedido</span>' +
      '</div>') +

      (produto.receita
        ? '<div class="caixa-receita">' +
            '<b>' + L.icone('escudo', 16) + ' Venda sob prescrição médica</b>' +
            '<p>Este medicamento não é vendido pelo site. Reserve aqui e retire em uma das ' +
            D.config.totalLojas + ' lojas, apresentando a receita válida ao farmacêutico.</p>' +
            (produto.farmaciaPopular
              ? '<p class="popular-nota">' + L.icone('cheque', 14) + ' ' +
                (produto.farmaciaPopular === 'gratuito'
                  ? 'Disponível <strong>gratuitamente</strong> pelo Farmácia Popular.'
                  : 'Disponível <strong>com desconto</strong> pelo Farmácia Popular.') +
                ' <a href="institucional.html?p=farmacia-popular">Como funciona</a></p>'
              : '') +
          '</div>' +
          '<button class="btn btn--compra btn--bloco" type="button" id="btn-reservar">' +
            L.icone('local', 18) + ' Reservar para retirada</button>'
        : '<button class="btn btn--compra btn--bloco" type="button" id="btn-comprar"' +
          (fora ? ' disabled' : '') + '>' +
          L.icone('sacola', 18) + (fora ? ' Produto indisponível' : ' Adicionar ao carrinho') + '</button>' +
          (fora ? '<button class="btn btn--contorno btn--bloco" type="button" id="btn-avise">Avise-me quando chegar</button>' : '')) +

      '<div class="frete">' +
        '<span class="frete__titulo">' + L.icone('caminhao', 17) + ' Calcular frete e prazo</span>' +
        '<form class="frete__form" id="form-frete">' +
          '<label class="so-leitor" for="cep">CEP de entrega</label>' +
          '<input id="cep" type="text" inputmode="numeric" placeholder="00000-000" maxlength="9" autocomplete="postal-code">' +
          '<button class="btn btn--contorno" type="submit">Calcular</button>' +
        '</form>' +
        '<div class="frete__resultado" id="frete-resultado" role="status" aria-live="polite"></div>' +
        '<a href="#" style="font-size:12.5px">Não sei meu CEP</a>' +
      '</div>' +

      '<div class="seguranca">' +
        '<div>' + L.icone('escudo', 15) + ' Compra 100% segura e dados criptografados</div>' +
        '<div>' + L.icone('devolucao', 15) + ' Troca ou devolução em até 7 dias corridos</div>' +
        '<div>' + L.icone('chat', 15) + ' Dúvidas? Fale com nosso farmacêutico</div>' +
      '</div>';
  }

  /* ------------------------------------------------------------ abas */
  function avaliacoesTodas() {
    var extras = L.recuperar(L.chaves.avaliacoes, {})[produto.sku] || [];
    return extras.concat(produto.avaliacoes || []);
  }

  /* Distribui `total` avaliações entre 1 e 5 estrelas de modo que a média
     resultante seja a nota agregada do produto. A cauda baixa recebe uma
     fração fixa e o restante é dividido entre 4 e 5 estrelas. */
  function distribuir(nota, total) {
    if (total <= 0) return [0, 0, 0, 0, 0];

    var c1 = Math.round(total * 0.01);
    var c2 = Math.round(total * 0.01);
    var c3 = Math.round(total * 0.04);
    var resto = total - c1 - c2 - c3;
    if (resto < 0) return [0, 0, 0, 0, total];

    var somaAlvo = nota * total - (c1 + 2 * c2 + 3 * c3);
    var c5 = Math.round(somaAlvo - 4 * resto);
    c5 = Math.max(0, Math.min(resto, c5));

    return [c1, c2, c3, resto - c5, c5];
  }

  /* Resumo agregado: parte da nota oficial do produto e soma as avaliações
     que a pessoa escreveu nesta sessão. */
  function resumoAvaliacoes() {
    var extras = L.recuperar(L.chaves.avaliacoes, {})[produto.sku] || [];
    var total = produto.qtdAvaliacoes + extras.length;
    var soma = produto.nota * produto.qtdAvaliacoes;

    var contagem = distribuir(produto.nota, produto.qtdAvaliacoes);
    extras.forEach(function (a) { soma += a.nota; contagem[a.nota - 1]++; });

    return { total: total, media: total ? soma / total : produto.nota, contagem: contagem };
  }

  function blocoAvaliacoes() {
    var lista = avaliacoesTodas();
    var resumo = resumoAvaliacoes();
    var total = resumo.total;
    var media = resumo.media;
    var contagem = resumo.contagem;

    var barras = '';
    for (var n = 5; n >= 1; n--) {
      var pct = total ? (contagem[n - 1] / total) * 100 : 0;
      barras += '<div class="barra-nota"><span>' + n + ' estrela' + (n > 1 ? 's' : '') + '</span>' +
        '<span class="barra-nota__trilho"><span class="barra-nota__preenchimento" style="width:' +
        pct.toFixed(0) + '%"></span></span><span>' + contagem[n - 1] + '</span></div>';
    }

    var comentarios = lista.length
      ? lista.map(function (a) {
          return '<article class="comentario">' +
            '<div class="comentario__topo">' + L.estrelas(a.nota, 15) +
              '<span class="comentario__autor">' + L.escapar(a.autor) + '</span>' +
              '<span class="comentario__data">' + L.dataBr(a.data) + '</span>' +
              (a.verificada ? '<span class="comentario__verificado">' + L.icone('cheque', 13) +
                ' Compra verificada</span>' : '') +
            '</div>' +
            (a.titulo ? '<h4>' + L.escapar(a.titulo) + '</h4>' : '') +
            '<p>' + L.escapar(a.texto) + '</p></article>';
        }).join('')
      : '<p>Este produto ainda não recebeu avaliações. Seja a primeira pessoa a avaliar.</p>';

    return '<div class="avaliacoes">' +
      '<div class="avaliacoes__resumo">' +
        '<div><span class="avaliacoes__nota">' + media.toFixed(1).replace('.', ',') + '</span></div>' +
        L.estrelas(media, 20) +
        '<p style="font-size:13px;color:var(--tinta-500);margin:0">' + total +
          ' avaliação' + (total === 1 ? '' : 'ões') + ' de clientes</p>' +
        barras +
      '</div>' +
      '<div><h3 style="margin-top:0">Comentários de quem comprou</h3>' +
        '<p style="font-size:12.5px;color:var(--tinta-500);margin-top:-6px">Exibindo ' +
          lista.length + ' de ' + total + ' avaliações</p>' + comentarios +
        '<h3>Avaliar este produto</h3>' +
        '<form class="form-avaliacao" id="form-avaliacao">' +
          '<div><label id="rot-nota">Sua nota</label>' +
            '<div class="seletor-estrelas" id="seletor-nota" role="radiogroup" aria-labelledby="rot-nota">' +
              [1, 2, 3, 4, 5].map(function (n) {
                return '<button type="button" role="radio" aria-checked="false" data-nota="' + n + '" ' +
                  'aria-label="' + n + ' estrela' + (n > 1 ? 's' : '') + '">' +
                  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"/></svg>' +
                  '</button>';
              }).join('') +
            '</div></div>' +
          '<div><label for="av-nome">Seu nome</label>' +
            '<input id="av-nome" name="nome" required maxlength="40" placeholder="Como quer ser identificado"></div>' +
          '<div><label for="av-titulo">Título da avaliação</label>' +
            '<input id="av-titulo" name="titulo" maxlength="60" placeholder="Resuma sua experiência"></div>' +
          '<div><label for="av-texto">Seu comentário</label>' +
            '<textarea id="av-texto" name="texto" required maxlength="600" ' +
            'placeholder="Conte o que achou do produto"></textarea></div>' +
          '<button class="btn btn--principal" type="submit" style="justify-self:start">Enviar avaliação</button>' +
        '</form>' +
      '</div></div>';
  }

  function abas() {
    var specs = (produto.especificacoes || []).map(function (par) {
      return '<tr><th scope="row">' + L.escapar(par[0]) + '</th><td>' + L.escapar(par[1]) + '</td></tr>';
    }).join('');

    var aviso = produto.avisoLegal
      ? '<div class="aviso-legal"><strong>Atenção</strong>' + L.escapar(produto.avisoLegal) + '</div>'
      : '';

    var paineis = [
      ['descricao', 'Descrição', produto.descricao + aviso],
      ['uso', 'Modo de uso', produto.modoUso],
      ['composicao', 'Composição', produto.ingredientes],
      ['specs', 'Especificações', '<table class="tabela-specs"><tbody>' + specs + '</tbody></table>'],
      ['avaliacoes', 'Avaliações (' + resumoAvaliacoes().total + ')', blocoAvaliacoes()]
    ];

    return '<section class="abas" id="detalhes">' +
      '<div class="abas__lista" role="tablist" aria-label="Detalhes do produto">' +
        paineis.map(function (p, i) {
          return '<button class="abas__botao" type="button" role="tab" id="aba-' + p[0] + '" ' +
            'aria-controls="painel-' + p[0] + '" aria-selected="' + (i === 0) + '">' + p[1] + '</button>';
        }).join('') +
      '</div>' +
      paineis.map(function (p, i) {
        return '<div class="abas__painel" role="tabpanel" id="painel-' + p[0] + '" ' +
          'aria-labelledby="aba-' + p[0] + '"' + (i === 0 ? '' : ' hidden') + '>' + p[2] + '</div>';
      }).join('') +
    '</section>';
  }

  /* ------------------------------------------------------------ barra fixa */
  function barraFixa() {
    return '<div class="barra-fixa" id="barra-fixa"><div class="container barra-fixa__interno">' +
      '<img src="assets/img/' + L.escapar(produto.imagem) + '" alt="" width="48" height="48">' +
      '<span class="barra-fixa__nome">' + L.escapar(produto.nome) + '</span>' +
      '<span class="barra-fixa__preco" id="barra-preco">' + L.moeda(precoAtual()) + '</span>' +
      (produto.receita
        ? '<a class="btn btn--compra" href="#compra">Reservar</a>'
        : '<button class="btn btn--compra" type="button" id="btn-comprar-fixo"' +
          (produto.estoque <= 0 ? ' disabled' : '') + '>Adicionar</button>') +
    '</div></div>';
  }

  /* ------------------------------------------------------------ relacionados */
  function relacionados() {
    var lista = (produto.relacionados || [])
      .map(function (s) { return D.porSku(s); })
      .filter(Boolean);
    if (!lista.length) return '';

    var vistos = L.vistosRecentemente(produto.sku);
    var blocoVistos = vistos.length > 1
      ? '<section class="secao"><div class="secao__cabecalho"><div>' +
        '<h2>Vistos recentemente</h2></div></div>' +
        L.prateleira(vistos, 'trilho-vistos') + '</section>'
      : '';

    return '<section class="secao">' +
      '<div class="secao__cabecalho"><div><h2>Quem viu este produto também levou</h2>' +
      '<p>Combinações frequentes na mesma compra</p></div></div>' +
      L.prateleira(lista, 'trilho-relacionados') + '</section>' + blocoVistos;
  }

  /* ------------------------------------------------------------ interações */
  function ligarGaleria() {
    var palco = documento.getElementById('palco');
    var principal = documento.getElementById('imagem-principal');
    var imagens = produto.galeria && produto.galeria.length ? produto.galeria : [produto.imagem];

    documento.querySelectorAll('[data-img]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = Number(btn.getAttribute('data-img'));
        principal.src = 'assets/img/' + imagens[i];
        documento.querySelectorAll('[data-img]').forEach(function (b) {
          b.setAttribute('aria-current', b === btn ? 'true' : 'false');
        });
        palco.classList.remove('ampliado');
      });
    });

    if (palco) {
      palco.addEventListener('click', function (e) {
        if (e.target === principal) palco.classList.toggle('ampliado');
      });
    }
  }

  function ligarVariacoes() {
    documento.querySelectorAll('[data-variacao]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-variacao');
        produto.variacoes.forEach(function (v) { if (v.id === id) variacaoAtual = v; });
        documento.querySelectorAll('[data-variacao]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        documento.getElementById('compra').innerHTML = caixaCompra();
        documento.getElementById('barra-preco').textContent = L.moeda(precoAtual());
        ligarCompra();
      });
    });
  }

  function ligarCompra() {
    var campoQtd = documento.getElementById('qtd');

    documento.querySelectorAll('[data-qtd]').forEach(function (btn) {
      if (!campoQtd) return;
      btn.addEventListener('click', function () {
        var delta = Number(btn.getAttribute('data-qtd'));
        var novo = Math.min(Math.max(1, Number(campoQtd.value) + delta), Math.max(1, produto.estoque));
        campoQtd.value = novo;
      });
    });

    var reservar = documento.getElementById('btn-reservar');
    if (reservar) {
      reservar.addEventListener('click', function () {
        L.aviso('Reserva registrada. Retire na loja com a receita em mãos.', 'ok');
      });
    }

    var comprar = documento.getElementById('btn-comprar');
    if (comprar) {
      comprar.addEventListener('click', function () {
        L.adicionar(produto.sku, (campoQtd && Number(campoQtd.value)) || 1,
                    variacaoAtual ? variacaoAtual.id : null);
      });
    }

    var avise = documento.getElementById('btn-avise');
    if (avise) {
      avise.addEventListener('click', function () {
        L.aviso('Avisaremos por e-mail assim que o produto voltar ao estoque.', 'ok');
      });
    }

    /* frete */
    var form = documento.getElementById('form-frete');
    var campoCep = documento.getElementById('cep');
    var saida = documento.getElementById('frete-resultado');
    if (!form || !campoCep || !saida) return;

    L.mascaraCep(campoCep);
    var salvo = L.recuperar(L.chaves.cep, '');
    if (salvo) { campoCep.value = salvo; mostrarFrete(salvo); }

    function mostrarFrete(cep) {
      var r = L.calcularFrete(cep, precoAtual() * (campoQtd ? Number(campoQtd.value) || 1 : 1));
      if (r.erro) { saida.innerHTML = '<p class="frete__erro">' + L.escapar(r.erro) + '</p>'; return; }

      L.guardar(L.chaves.cep, cep);
      saida.innerHTML =
        '<p style="font-size:12.5px;color:var(--tinta-500);margin:0 0 4px">' +
          L.icone('local', 13) + ' Entregas para ' + L.escapar(r.regiao.nome) + ' — CEP ' + r.cep + '</p>' +
        r.opcoes.map(function (o) {
          return '<div class="frete__opcao"><div><b>' + L.escapar(o.nome) + '</b>' +
            '<small>' + L.escapar(o.prazo) + '</small></div>' +
            '<span class="valor' + (o.gratis ? ' gratis' : '') + '">' +
              (o.gratis ? 'Grátis' : L.moeda(o.valor)) + '</span></div>';
        }).join('');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      mostrarFrete(campoCep.value);
    });
  }

  function ligarAbas() {
    var botoes = Array.prototype.slice.call(documento.querySelectorAll('.abas__botao'));

    function selecionar(btn) {
      botoes.forEach(function (b) {
        var alvo = documento.getElementById(b.getAttribute('aria-controls'));
        var ativo = b === btn;
        b.setAttribute('aria-selected', ativo ? 'true' : 'false');
        if (alvo) alvo.hidden = !ativo;
      });
    }

    botoes.forEach(function (btn, i) {
      btn.addEventListener('click', function () { selecionar(btn); });
      btn.addEventListener('keydown', function (e) {
        var j = e.key === 'ArrowRight' ? i + 1 : (e.key === 'ArrowLeft' ? i - 1 : -1);
        if (j < 0 || j >= botoes.length) return;
        e.preventDefault();
        botoes[j].focus();
        selecionar(botoes[j]);
      });
    });

    /* link "N avaliações" abre a aba correspondente */
    documento.querySelectorAll('a[href="#avaliacoes"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var aba = documento.getElementById('aba-avaliacoes');
        if (aba) { selecionar(aba); aba.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      });
    });
  }

  function ligarFormAvaliacao() {
    var form = documento.getElementById('form-avaliacao');
    if (!form) return;

    var nota = 0;
    var estrelasBtn = Array.prototype.slice.call(documento.querySelectorAll('#seletor-nota button'));

    estrelasBtn.forEach(function (btn) {
      btn.addEventListener('click', function () {
        nota = Number(btn.getAttribute('data-nota'));
        estrelasBtn.forEach(function (b) {
          var n = Number(b.getAttribute('data-nota'));
          b.classList.toggle('ativa', n <= nota);
          b.setAttribute('aria-checked', n === nota ? 'true' : 'false');
        });
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!nota) { L.aviso('Escolha uma nota de 1 a 5 estrelas.', 'erro'); return; }

      var todas = L.recuperar(L.chaves.avaliacoes, {});
      var minhas = todas[produto.sku] || [];
      minhas.unshift({
        autor: form.nome.value.trim(),
        nota: nota,
        data: new Date().toISOString().slice(0, 10),
        titulo: form.titulo.value.trim(),
        texto: form.texto.value.trim(),
        verificada: false
      });
      todas[produto.sku] = minhas;
      L.guardar(L.chaves.avaliacoes, todas);

      documento.getElementById('painel-avaliacoes').innerHTML = blocoAvaliacoes();
      documento.getElementById('aba-avaliacoes').textContent = 'Avaliações (' + resumoAvaliacoes().total + ')';
      ligarFormAvaliacao();
      L.aviso('Obrigado! Sua avaliação foi publicada.', 'ok');
    });
  }

  function ligarBarraFixa() {
    var barra = documento.getElementById('barra-fixa');
    var referencia = documento.getElementById('compra');
    if (!barra || !referencia) return;

    var botao = documento.getElementById('btn-comprar-fixo');
    if (botao) {
      botao.addEventListener('click', function () {
        var campo = documento.getElementById('qtd');
        L.adicionar(produto.sku, Number(campo && campo.value) || 1, variacaoAtual ? variacaoAtual.id : null);
      });
    }

    janela.addEventListener('scroll', function () {
      var limite = referencia.getBoundingClientRect().bottom;
      barra.classList.toggle('visivel', limite < 0);
    }, { passive: true });
  }

  /* ------------------------------------------------------------ SEO local */
  function metadados() {
    documento.title = produto.nome + ' | ' + CFG.nomeLoja;

    var desc = documento.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', produto.resumo);

    var dados = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: produto.nome,
      sku: produto.sku,
      brand: { '@type': 'Brand', name: produto.marca },
      description: produto.resumo,
      image: 'assets/img/' + produto.imagem,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: produto.nota,
        reviewCount: produto.qtdAvaliacoes
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'BRL',
        price: produto.preco.toFixed(2),
        availability: produto.estoque > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock'
      }
    };

    var script = documento.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(dados);
    documento.head.appendChild(script);
  }

  /* ------------------------------------------------------------ montagem */
  function montar() {
    resolverProduto();
    L.iniciar(produto.categoria);
    trilha();

    documento.getElementById('conteudo').innerHTML =
      '<div class="container">' +
        '<div class="pdp">' +
          '<div class="pdp__principal">' + galeria() + ficha() + '</div>' +
          '<aside class="compra" id="compra" aria-label="Opções de compra">' + caixaCompra() + '</aside>' +
        '</div>' +
        abas() +
        relacionados() +
      '</div>' + barraFixa();

    ligarGaleria();
    ligarVariacoes();
    ligarCompra();
    ligarAbas();
    ligarFormAvaliacao();
    ligarBarraFixa();
    metadados();
    L.registrarVisto(produto.sku);
  }

  /* espera o DOM e o catálogo (do banco, se configurado) */
  janela.LojaAPI.pronto(montar);
})(window, document);
