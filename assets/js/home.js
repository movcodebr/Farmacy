/* =========================================================================
   Página inicial
   ========================================================================= */
(function (janela, documento) {
  'use strict';

  var D = janela.LojaDados;
  var L = janela.Loja;

  /* ------------------------------------------------------------ banners */
  function carrossel() {
    return '<section class="vitrine-banner" aria-roledescription="carrossel" aria-label="Destaques">' +
      '<div class="vitrine-banner__trilho" id="trilho-banner">' +
        D.banners.map(function (b, i) {
          return '<div class="vitrine-banner__item" role="group" aria-roledescription="slide" ' +
            'aria-label="' + (i + 1) + ' de ' + D.banners.length + '">' +
            '<img src="assets/img/' + b.imagem + '" alt="" width="1200" height="420"' +
              (i === 0 ? '' : ' loading="lazy"') + '>' +
            '<div class="vitrine-banner__texto">' +
              '<span>' + L.escapar(b.etiqueta) + '</span>' +
              '<h2>' + L.escapar(b.titulo) + '</h2>' +
              '<p>' + L.escapar(b.texto) + '</p>' +
              '<a class="btn" href="' + b.href + '">' + L.escapar(b.cta) + '</a>' +
            '</div></div>';
        }).join('') +
      '</div>' +
      '<button class="carrossel-seta carrossel-seta--ant" type="button" data-banner="-1" aria-label="Destaque anterior">' +
        L.icone('seta_esq') + '</button>' +
      '<button class="carrossel-seta carrossel-seta--prox" type="button" data-banner="1" aria-label="Próximo destaque">' +
        L.icone('seta_dir') + '</button>' +
      '<div class="vitrine-banner__pontos" id="pontos-banner"></div>' +
    '</section>';
  }

  function ligarCarrossel() {
    var trilho = documento.getElementById('trilho-banner');
    var pontos = documento.getElementById('pontos-banner');
    if (!trilho || !pontos) return;

    var atual = 0;
    var total = D.banners.length;
    var timer = null;

    pontos.innerHTML = D.banners.map(function (b, i) {
      return '<button type="button" data-ponto="' + i + '" aria-label="Ir para o destaque ' + (i + 1) + '" ' +
        'aria-current="' + (i === 0) + '"></button>';
    }).join('');

    function ir(i) {
      atual = (i + total) % total;
      trilho.style.transform = 'translateX(-' + (atual * 100) + '%)';
      pontos.querySelectorAll('[data-ponto]').forEach(function (b, j) {
        b.setAttribute('aria-current', j === atual ? 'true' : 'false');
      });
    }

    function auto() {
      janela.clearInterval(timer);
      timer = janela.setInterval(function () { ir(atual + 1); }, 6000);
    }

    documento.querySelectorAll('[data-banner]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ir(atual + Number(btn.getAttribute('data-banner')));
        auto();
      });
    });

    pontos.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ponto]');
      if (b) { ir(Number(b.getAttribute('data-ponto'))); auto(); }
    });

    var container = trilho.parentElement;
    container.addEventListener('mouseenter', function () { janela.clearInterval(timer); });
    container.addEventListener('mouseleave', auto);
    auto();
  }

  /* ------------------------------------------------------------ vantagens */
  function vantagens() {
    var itens = [
      ['local', D.config.totalLojas + ' lojas', 'retirada gratuita em qualquer unidade'],
      ['relogio', 'Unidades 24 horas', 'plantão para quando não dá para esperar'],
      ['escudo', 'Farmácia Popular', 'medicamentos gratuitos ou com desconto'],
      ['cartao', 'Até 6x sem juros', 'ou 5% de desconto no PIX']
    ];
    return '<div class="vantagens">' + itens.map(function (i) {
      return '<div class="vantagem">' + L.icone(i[0], 26) +
        '<div><b>' + i[1] + '</b><span>' + i[2] + '</span></div></div>';
    }).join('') + '</div>';
  }

  /* ------------------------------------------------------------ categorias */
  function categorias() {
    return '<section class="secao"><div class="secao__cabecalho"><div>' +
      '<h2>Navegue por categoria</h2><p>Tudo o que você precisa em um só lugar</p></div></div>' +
      '<div class="categorias">' + D.categorias.map(function (c) {
        return '<a class="categoria-atalho" href="categoria.html?cat=' + c.id + '">' +
          '<span class="categoria-atalho__icone">' + L.icone(c.icone, 24) + '</span>' +
          L.escapar(c.nome) + '</a>';
      }).join('') + '</div></section>';
  }

  /* ------------------------------------------------------------ ofertas */
  function ofertas() {
    /* vitrine de impulso: fora dela o que não se compra pelo site.
       Medicamento com receita aparece nas categorias e na busca, onde o
       caminho é reservar e retirar na loja. */
    var lista = D.produtos
      .filter(function (p) { return L.desconto(p) >= 20 && p.estoque > 0 && !p.receita; })
      .sort(function (a, b) { return L.desconto(b) - L.desconto(a); })
      .slice(0, 8);

    return '<section class="faixa-ofertas"><div class="faixa-ofertas__topo">' +
      '<div><h2>Ofertas do dia</h2><p>Descontos que acabam à meia-noite</p></div>' +
      '<div class="cronometro" id="cronometro" role="timer" aria-label="Tempo restante das ofertas"></div>' +
      '</div>' + L.prateleira(lista, 'trilho-ofertas') + '</section>';
  }

  function ligarCronometro() {
    var alvo = documento.getElementById('cronometro');
    if (!alvo) return;

    function tick() {
      var agora = new Date();
      var fim = new Date(agora);
      fim.setHours(23, 59, 59, 999);
      var resta = Math.max(0, fim - agora);

      var h = Math.floor(resta / 3600000);
      var m = Math.floor((resta % 3600000) / 60000);
      var s = Math.floor((resta % 60000) / 1000);

      alvo.innerHTML = [['h', h], ['min', m], ['s', s]].map(function (par) {
        return '<div class="cronometro__bloco"><b>' + String(par[1]).padStart(2, '0') +
          '</b><span>' + par[0] + '</span></div>';
      }).join('');
    }

    tick();
    janela.setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------ prateleiras */
  function prateleiraDestaques() {
    var lista = D.produtos.filter(function (p) { return p.destaque; });
    return '<section class="secao"><div class="secao__cabecalho">' +
      '<div><h2>Mais vendidos da semana</h2><p>Os favoritos de quem compra na São Carlos</p></div>' +
      '<a class="btn btn--contorno" href="categoria.html">Ver todos</a></div>' +
      L.prateleira(lista, 'trilho-destaques') + '</section>';
  }

  function prateleiraCategoria(catId, titulo, subtitulo) {
    var lista = D.porCategoria(catId);
    if (!lista.length) return '';
    return '<section class="secao"><div class="secao__cabecalho">' +
      '<div><h2>' + titulo + '</h2><p>' + subtitulo + '</p></div>' +
      '<a class="btn btn--contorno" href="categoria.html?cat=' + catId + '">Ver categoria</a></div>' +
      '<div class="grade-produtos">' + lista.map(function (p) { return L.cartaoProduto(p); }).join('') +
      '</div></section>';
  }

  /* ------------------------------------------------------------ clube */
  function servicos() {
    return '<section class="secao"><div class="secao__cabecalho">' +
      '<div><h2>Serviços nas lojas</h2>' +
      '<p>O que a rede faz além de vender medicamento</p></div>' +
      '<a class="btn btn--contorno" href="institucional.html?p=servicos">Ver todos</a></div>' +
      '<div class="grade-lojas">' + D.servicos.map(function (s) {
        return '<a class="cartao-loja" href="institucional.html?p=' +
          (s.id === 'farmacia-popular' ? 'farmacia-popular' : 'servicos#' + s.id) + '" ' +
          'style="text-decoration:none;color:inherit">' +
          '<span class="servico-icone">' + L.icone(s.icone, 22) + '</span>' +
          '<h2>' + L.escapar(s.titulo) + '</h2>' +
          '<p style="font-size:13.5px;color:var(--tinta-700);margin:0">' +
            L.escapar(s.resumo) + '</p></a>';
      }).join('') + '</div></section>';
  }

  function clube() {
    return '<section class="secao" id="clube">' +
      '<div style="position:relative;border-radius:var(--r-lg);overflow:hidden">' +
        '<img src="assets/img/faixa-clube.svg" alt="" width="1200" height="420" ' +
          'style="height:260px;object-fit:cover;width:100%" loading="lazy">' +
        '<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;' +
          'gap:12px;padding:40px;color:#fff;max-width:640px;' +
          'background:linear-gradient(90deg,rgba(19,31,69,.86) 0%,rgba(19,31,69,.62) 70%,transparent 100%)">' +
          '<span class="selo" style="background:rgba(255,255,255,.18);color:#fff;align-self:flex-start">' +
            'Gratuito</span>' +
          '<h2 style="font-size:28px">Clube São Carlos: até 15% de desconto em todo o site</h2>' +
          '<p style="opacity:.92;margin:0">Cadastre seu CPF, acompanhe seu histórico de compras e receba ' +
          'lembretes de recompra dos seus medicamentos de uso contínuo.</p>' +
          '<button class="btn" type="button" style="background:#fff;color:var(--marca-900);align-self:flex-start" ' +
            'data-assinar-clube>Quero participar</button>' +
        '</div>' +
      '</div></section>';
  }

  /* ------------------------------------------------------------ montagem */
  function montar() {
    L.iniciar('home');

    documento.getElementById('conteudo').innerHTML =
      '<div class="container">' +
        carrossel() +
        vantagens() +
        categorias() +
        ofertas() +
        prateleiraDestaques() +
        servicos() +
        clube() +
        prateleiraCategoria('cabelos', 'Cuidados com os cabelos', 'Tratamento, finalização e uso diário') +
        prateleiraCategoria('vitaminas', 'Vitaminas e suplementos', 'Para a sua rotina de bem-estar') +
      '</div>';

    ligarCarrossel();
    ligarCronometro();

    var vistos = L.vistosRecentemente();
    if (vistos.length) {
      var el = documento.createElement('div');
      el.className = 'container';
      el.innerHTML = '<section class="secao"><div class="secao__cabecalho"><div>' +
        '<h2>Vistos recentemente</h2></div></div>' + L.prateleira(vistos, 'trilho-vistos') + '</section>';
      documento.getElementById('conteudo').appendChild(el);
    }

    documento.addEventListener('click', function (e) {
      if (e.target.closest('[data-assinar-clube]')) {
        L.aviso('Cadastro do Clube São Carlos realizado! Os preços de clube já estão aplicados.', 'ok');
      }
    });
  }

  /* espera o DOM e o catálogo (do banco, se configurado) */
  janela.LojaAPI.pronto(montar);
})(window, document);
