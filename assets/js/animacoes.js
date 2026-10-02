/* =========================================================================
   Movimento: revelação ao rolar e realce de mudanças.

   O estado inicial escondido só é aplicado quando este arquivo roda (classe
   js-ativo). Sem JS, ou se algo aqui falhar, o conteúdo aparece normalmente —
   animação nunca pode ser a razão de alguém não ver a loja.
   ========================================================================= */
(function (janela, documento) {
  'use strict';

  var raizes = documento.documentElement;

  /* quem pediu menos movimento no sistema não recebe nada disso */
  var reduzido = janela.matchMedia &&
                 janela.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var suportado = 'IntersectionObserver' in janela;
  if (reduzido || !suportado) return;

  raizes.classList.add('js-ativo');

  /* rede de segurança: se por qualquer motivo o observador não disparar,
     nada fica invisível para sempre */
  janela.setTimeout(function () {
    documento.querySelectorAll('.revelar:not(.revelado)').forEach(function (el) {
      el.classList.add('revelado');
    });
  }, 3000);

  /* ------------------------------------------------------------ observador */
  var observador = new janela.IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('revelado');
      observador.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });

  /* o que ganha entrada. Blocos que já são animados por conta própria
     (gaveta, avisos, barra fixa) ficam de fora. */
  var ALVOS = [
    '.vitrine-banner', '.vantagem', '.categoria-atalho', '.faixa-ofertas',
    '.secao__cabecalho', '.prateleira', '.cartao', '.cartao-loja', '.numero',
    '.painel', '.prosa', '.acordeao__item', '.pedido'
  ].join(',');

  function marcar(raiz) {
    var alvos = (raiz || documento).querySelectorAll(ALVOS);
    var porGrupo = new janela.Map();

    alvos.forEach(function (el) {
      if (el.classList.contains('revelar')) return;

      /* Cartão dentro de prateleira horizontal fica de fora: os que estão à
         direita nunca intersectam a janela no eixo X, então continuariam
         invisíveis. Quem ganha a entrada é a prateleira inteira. */
      if (el.classList.contains('cartao') && el.closest('.prateleira__trilho')) return;

      el.classList.add('revelar');

      /* escalona dentro de cada grupo de irmãos, até seis passos: mais que
         isso e a última peça da grade demora demais para aparecer */
      var pai = el.parentElement;
      var n = porGrupo.get(pai) || 0;
      porGrupo.set(pai, n + 1);
      if (n) el.style.setProperty('--atraso', Math.min(n, 6) * 45 + 'ms');

      observador.observe(el);
    });
  }

  /* ------------------------------------------------------------ conteúdo novo */
  /* As páginas montam o conteúdo depois que o catálogo carrega, e várias
     redesenham trechos ao filtrar ou paginar. Observar o container cobre tudo
     isso sem instrumentar cada script de página. */
  var pendente = false;
  function agendarMarcacao() {
    if (pendente) return;
    pendente = true;
    janela.requestAnimationFrame(function () {
      pendente = false;
      marcar(documento);
    });
  }

  function ligar() {
    marcar(documento);
    var alvo = documento.getElementById('conteudo') || documento.body;
    new janela.MutationObserver(agendarMarcacao)
      .observe(alvo, { childList: true, subtree: true });
  }

  if (documento.readyState === 'loading') {
    documento.addEventListener('DOMContentLoaded', ligar);
  } else {
    ligar();
  }

  /* ------------------------------------------------------------ contadores */
  /* Um pulso curto no número do carrinho, para a mudança não passar batida
     quando o item é adicionado de uma prateleira longe do cabeçalho. */
  documento.addEventListener('carrinho:mudou', function () {
    var c = documento.querySelector('[data-contador-carrinho]');
    if (!c) return;
    c.classList.remove('mudou');
    void c.offsetWidth;          // reinicia a animação
    c.classList.add('mudou');
  });

  janela.Animacoes = { marcar: marcar };
})(window, document);
