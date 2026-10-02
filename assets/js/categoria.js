/* =========================================================================
   Listagem de categoria / resultados de busca
   ========================================================================= */
(function (janela, documento) {
  'use strict';

  var D = janela.LojaDados;
  var L = janela.Loja;

  var parametros = new janela.URLSearchParams(janela.location.search);
  var categoria = parametros.get('cat') || '';
  var termo = (parametros.get('q') || '').trim();
  var subFiltro = parametros.get('sub') || '';

  var estado = {
    marcas: [],
    subcategorias: subFiltro ? [subFiltro] : [],
    precoMax: null,
    notaMin: 0,
    somenteOferta: false,
    somenteDisponivel: false,
    ordem: 'relevancia',
    visiveis: 12
  };

  /* ------------------------------------------------------------ base */
  function baseProdutos() {
    var lista = D.produtos.slice();

    if (categoria === 'ofertas') {
      lista = lista.filter(function (p) { return L.desconto(p) > 0; });
    } else if (categoria) {
      lista = lista.filter(function (p) { return p.categoria === categoria; });
    }

    if (termo) {
      var t = L.semAcento(termo);
      lista = lista.filter(function (p) {
        return L.semAcento(p.nome).indexOf(t) !== -1 ||
               L.semAcento(p.marca).indexOf(t) !== -1 ||
               L.semAcento(p.subcategoria).indexOf(t) !== -1 ||
               L.semAcento(p.resumo).indexOf(t) !== -1;
      });
    }
    return lista;
  }

  function filtrados() {
    var lista = baseProdutos();

    if (estado.marcas.length) {
      lista = lista.filter(function (p) { return estado.marcas.indexOf(p.marca) !== -1; });
    }
    if (estado.subcategorias.length) {
      lista = lista.filter(function (p) { return estado.subcategorias.indexOf(p.subcategoria) !== -1; });
    }
    if (estado.precoMax != null) {
      lista = lista.filter(function (p) { return p.preco <= estado.precoMax; });
    }
    if (estado.notaMin) {
      lista = lista.filter(function (p) { return p.nota >= estado.notaMin; });
    }
    if (estado.somenteOferta) {
      lista = lista.filter(function (p) { return L.desconto(p) > 0; });
    }
    if (estado.somenteDisponivel) {
      lista = lista.filter(function (p) { return p.estoque > 0; });
    }

    var ordens = {
      'menor-preco': function (a, b) { return a.preco - b.preco; },
      'maior-preco': function (a, b) { return b.preco - a.preco; },
      'mais-vendidos': function (a, b) { return b.qtdAvaliacoes - a.qtdAvaliacoes; },
      'melhor-avaliados': function (a, b) { return b.nota - a.nota; },
      'maior-desconto': function (a, b) { return L.desconto(b) - L.desconto(a); },
      'az': function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); }
    };
    if (ordens[estado.ordem]) lista.sort(ordens[estado.ordem]);

    return lista;
  }

  /* ------------------------------------------------------------ filtros */
  function contar(lista, campo) {
    var mapa = {};
    lista.forEach(function (p) { mapa[p[campo]] = (mapa[p[campo]] || 0) + 1; });
    return Object.keys(mapa).sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); })
      .map(function (k) { return { valor: k, qtd: mapa[k] }; });
  }

  function grupoCheck(titulo, chave, itens, selecionados) {
    return '<div class="filtro">' +
      '<button class="filtro__titulo" type="button" aria-expanded="true">' + titulo +
        L.icone('seta_baixo', 16) + '</button>' +
      '<div class="filtro__corpo">' + itens.map(function (i) {
        return '<label class="filtro__item"><input type="checkbox" data-filtro="' + chave + '" ' +
          'value="' + L.escapar(i.valor) + '"' +
          (selecionados.indexOf(i.valor) !== -1 ? ' checked' : '') + '>' +
          '<span>' + L.escapar(i.valor) + '</span><span class="qtd">' + i.qtd + '</span></label>';
      }).join('') + '</div></div>';
  }

  function painelFiltros() {
    var base = baseProdutos();
    var faixas = [
      { rotulo: 'Até R$ 25', valor: 25 },
      { rotulo: 'Até R$ 50', valor: 50 },
      { rotulo: 'Até R$ 100', valor: 100 },
      { rotulo: 'Até R$ 150', valor: 150 }
    ];

    return '<aside class="filtros" aria-label="Filtros">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
        '<strong style="font-size:15px">Filtrar</strong>' +
        '<button class="btn btn--fantasma" type="button" data-limpar style="font-size:12.5px">Limpar</button>' +
      '</div>' +

      grupoCheck('Marca', 'marcas', contar(base, 'marca'), estado.marcas) +
      grupoCheck('Tipo de produto', 'subcategorias', contar(base, 'subcategoria'), estado.subcategorias) +

      '<div class="filtro"><button class="filtro__titulo" type="button" aria-expanded="true">Preço' +
        L.icone('seta_baixo', 16) + '</button><div class="filtro__corpo">' +
        faixas.map(function (f) {
          return '<label class="filtro__item"><input type="radio" name="preco" data-preco="' + f.valor + '"' +
            (estado.precoMax === f.valor ? ' checked' : '') + '><span>' + f.rotulo + '</span></label>';
        }).join('') +
        '<label class="filtro__item"><input type="radio" name="preco" data-preco=""' +
          (estado.precoMax == null ? ' checked' : '') + '><span>Qualquer preço</span></label>' +
      '</div></div>' +

      '<div class="filtro"><button class="filtro__titulo" type="button" aria-expanded="true">Avaliação' +
        L.icone('seta_baixo', 16) + '</button><div class="filtro__corpo">' +
        [4.5, 4, 3].map(function (n) {
          return '<label class="filtro__item"><input type="radio" name="nota" data-nota="' + n + '"' +
            (estado.notaMin === n ? ' checked' : '') + '>' + L.estrelas(n, 13) +
            '<span>e acima</span></label>';
        }).join('') +
        '<label class="filtro__item"><input type="radio" name="nota" data-nota="0"' +
          (!estado.notaMin ? ' checked' : '') + '><span>Todas</span></label>' +
      '</div></div>' +

      '<div class="filtro"><div class="filtro__corpo">' +
        '<label class="filtro__item"><input type="checkbox" data-bool="somenteOferta"' +
          (estado.somenteOferta ? ' checked' : '') + '><span>Somente em oferta</span></label>' +
        '<label class="filtro__item"><input type="checkbox" data-bool="somenteDisponivel"' +
          (estado.somenteDisponivel ? ' checked' : '') + '><span>Somente disponíveis</span></label>' +
      '</div></div>' +
    '</aside>';
  }

  /* ------------------------------------------------------------ listagem */
  function fichasAtivas() {
    var fichas = [];
    estado.marcas.forEach(function (m) { fichas.push(['marcas', m, m]); });
    estado.subcategorias.forEach(function (s) { fichas.push(['subcategorias', s, s]); });
    if (estado.precoMax != null) fichas.push(['preco', '', 'Até ' + L.moeda(estado.precoMax)]);
    if (estado.notaMin) fichas.push(['nota', '', estado.notaMin + ' estrelas ou mais']);
    if (estado.somenteOferta) fichas.push(['somenteOferta', '', 'Em oferta']);
    if (estado.somenteDisponivel) fichas.push(['somenteDisponivel', '', 'Disponíveis']);

    if (!fichas.length) return '';
    return '<div class="fichas-ativas">' + fichas.map(function (f) {
      return '<button class="ficha-ativa" type="button" data-tirar="' + f[0] + '" data-valor="' +
        L.escapar(f[1]) + '">' + L.escapar(f[2]) + L.icone('fechar', 13) + '</button>';
    }).join('') + '</div>';
  }

  function listagem() {
    var lista = filtrados();
    var mostrando = lista.slice(0, estado.visiveis);

    if (!lista.length) {
      return '<div class="vazio">' + L.icone('lupa_vazia', 56) +
        '<h3>Nenhum produto encontrado</h3>' +
        '<p>Tente remover alguns filtros ou buscar por outro termo.</p>' +
        '<button class="btn btn--contorno" type="button" data-limpar style="margin-top:12px">' +
        'Limpar filtros</button></div>';
    }

    return '<div class="barra-listagem">' +
        '<span style="font-size:13.5px;color:var(--tinta-500)"><strong>' + lista.length +
          '</strong> produto' + (lista.length === 1 ? '' : 's') + ' encontrado' +
          (lista.length === 1 ? '' : 's') + '</span>' +
        '<label style="display:flex;align-items:center;gap:8px;font-size:13.5px">Ordenar por' +
          '<select id="ordenar">' +
            [['relevancia', 'Relevância'], ['mais-vendidos', 'Mais vendidos'],
             ['menor-preco', 'Menor preço'], ['maior-preco', 'Maior preço'],
             ['maior-desconto', 'Maior desconto'], ['melhor-avaliados', 'Melhor avaliados'],
             ['az', 'A - Z']].map(function (o) {
              return '<option value="' + o[0] + '"' + (estado.ordem === o[0] ? ' selected' : '') +
                '>' + o[1] + '</option>';
            }).join('') +
          '</select></label>' +
      '</div>' +
      fichasAtivas() +
      '<div class="grade-produtos">' + mostrando.map(function (p) { return L.cartaoProduto(p); }).join('') + '</div>' +
      (lista.length > estado.visiveis
        ? '<div style="text-align:center;margin-top:24px">' +
          '<button class="btn btn--contorno" type="button" data-mais>Carregar mais produtos ' +
          '(' + (lista.length - estado.visiveis) + ' restantes)</button></div>'
        : '');
  }

  /* ------------------------------------------------------------ render */
  function titulo() {
    if (termo) return 'Resultados para “' + L.escapar(termo) + '”';
    if (categoria) return L.escapar(D.nomeCategoria(categoria));
    return 'Todos os produtos';
  }

  function desenhar() {
    documento.getElementById('lista').innerHTML = listagem();
    documento.getElementById('filtros').innerHTML = painelFiltros();
  }

  function montar() {
    L.iniciar(categoria);

    documento.title = titulo().replace(/<[^>]+>/g, '') + ' | ' + D.config.nomeLoja;

    documento.getElementById('trilha').innerHTML =
      '<nav class="trilha" aria-label="Você está aqui"><div class="container"><ol>' +
        '<li><a href="index.html">Início</a></li>' +
        (categoria ? '<li aria-current="page">' + L.escapar(D.nomeCategoria(categoria)) + '</li>'
                   : '<li aria-current="page">' + titulo() + '</li>') +
      '</ol></div></nav>';

    documento.getElementById('conteudo').innerHTML =
      '<div class="container">' +
        '<h1 style="font-size:24px;margin-bottom:20px">' + titulo() + '</h1>' +
        '<div class="layout-categoria">' +
          '<div id="filtros"></div>' +
          '<div id="lista"></div>' +
        '</div>' +
      '</div>';

    desenhar();

    documento.addEventListener('change', function (e) {
      var alvo = e.target;

      if (alvo.matches('[data-filtro]')) {
        var chave = alvo.getAttribute('data-filtro');
        var v = alvo.value;
        var i = estado[chave].indexOf(v);
        if (alvo.checked && i === -1) estado[chave].push(v);
        if (!alvo.checked && i !== -1) estado[chave].splice(i, 1);
        estado.visiveis = 12;
        desenhar();
      } else if (alvo.matches('[data-preco]')) {
        var pm = alvo.getAttribute('data-preco');
        estado.precoMax = pm ? Number(pm) : null;
        estado.visiveis = 12;
        desenhar();
      } else if (alvo.matches('[data-nota]')) {
        estado.notaMin = Number(alvo.getAttribute('data-nota'));
        estado.visiveis = 12;
        desenhar();
      } else if (alvo.matches('[data-bool]')) {
        estado[alvo.getAttribute('data-bool')] = alvo.checked;
        estado.visiveis = 12;
        desenhar();
      } else if (alvo.id === 'ordenar') {
        estado.ordem = alvo.value;
        desenhar();
      }
    });

    documento.addEventListener('click', function (e) {
      if (e.target.closest('[data-mais]')) {
        estado.visiveis += 12;
        desenhar();
        return;
      }

      if (e.target.closest('[data-limpar]')) {
        estado.marcas = [];
        estado.subcategorias = [];
        estado.precoMax = null;
        estado.notaMin = 0;
        estado.somenteOferta = false;
        estado.somenteDisponivel = false;
        estado.visiveis = 12;
        desenhar();
        return;
      }

      var tirar = e.target.closest('[data-tirar]');
      if (tirar) {
        var chave = tirar.getAttribute('data-tirar');
        var valor = tirar.getAttribute('data-valor');
        if (chave === 'marcas' || chave === 'subcategorias') {
          estado[chave] = estado[chave].filter(function (x) { return x !== valor; });
        } else if (chave === 'preco') { estado.precoMax = null; }
        else if (chave === 'nota') { estado.notaMin = 0; }
        else { estado[chave] = false; }
        desenhar();
        return;
      }

      var cabecalhoFiltro = e.target.closest('.filtro__titulo');
      if (cabecalhoFiltro) {
        var corpo = cabecalhoFiltro.nextElementSibling;
        var aberto = cabecalhoFiltro.getAttribute('aria-expanded') === 'true';
        cabecalhoFiltro.setAttribute('aria-expanded', aberto ? 'false' : 'true');
        if (corpo) corpo.style.display = aberto ? 'none' : '';
      }
    });
  }

  /* espera o DOM e o catálogo (do banco, se configurado) */
  janela.LojaAPI.pronto(montar);
})(window, document);
