/* =========================================================================
   Lista de favoritos
   ========================================================================= */
(function (janela, documento) {
  'use strict';

  var D = janela.LojaDados;
  var L = janela.Loja;

  function favoritos() {
    return L.recuperar('dsc:favoritos', []).map(function (s) { return D.porSku(s); }).filter(Boolean);
  }

  function desenhar() {
    var lista = favoritos();
    var alvo = documento.getElementById('lista-favoritos');

    if (!lista.length) {
      alvo.innerHTML = '<div class="painel"><div class="vazio">' + L.icone('coracao', 56) +
        '<h3>Você ainda não favoritou nada</h3>' +
        '<p>Toque no coração dos produtos que quiser guardar para depois.</p>' +
        '<a class="btn btn--principal" href="index.html" style="margin-top:12px">Ver produtos</a>' +
        '</div></div>';
      return;
    }

    /* itens com receita não entram no carrinho: contá-los aqui faria o botão
       prometer mais do que consegue adicionar */
    var disponiveis = lista.filter(function (p) { return p.estoque > 0 && !p.receita; });

    alvo.innerHTML =
      '<div class="barra-listagem">' +
        '<span style="font-size:13.5px;color:var(--tinta-500)"><strong>' + lista.length +
          '</strong> produto' + (lista.length === 1 ? '' : 's') + ' salvo' +
          (lista.length === 1 ? '' : 's') + '</span>' +
        (disponiveis.length
          ? '<button class="btn btn--contorno" type="button" data-add-todos>' +
            L.icone('sacola', 16) + ' Adicionar ' + disponiveis.length + ' ao carrinho</button>'
          : '') +
      '</div>' +
      '<div class="grade-produtos">' + lista.map(function (p) { return L.cartaoProduto(p); }).join('') + '</div>';
  }

  function montar() {
    L.iniciar('favoritos');

    documento.getElementById('trilha').innerHTML =
      '<nav class="trilha" aria-label="Você está aqui"><div class="container"><ol>' +
        '<li><a href="index.html">Início</a></li>' +
        '<li aria-current="page">Favoritos</li></ol></div></nav>';

    documento.getElementById('conteudo').innerHTML =
      '<div class="container">' +
        '<h1 style="font-size:24px;margin-bottom:20px">Meus favoritos</h1>' +
        '<div id="lista-favoritos"></div>' +
      '</div>';

    desenhar();

    /* o coração é tratado no módulo compartilhado; aqui só redesenhamos a lista */
    documento.addEventListener('click', function (e) {
      if (e.target.closest('[data-favorito]')) { janela.setTimeout(desenhar, 0); return; }

      if (e.target.closest('[data-add-todos]')) {
        favoritos().forEach(function (p) {
          if (p.estoque > 0 && !p.receita) L.adicionar(p.sku, 1);
        });
      }
    });
  }

  /* espera o DOM e o catálogo (do banco, se configurado) */
  janela.LojaAPI.pronto(montar);
})(window, document);
