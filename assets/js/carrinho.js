/* =========================================================================
   Carrinho e simulação de fechamento de pedido
   ========================================================================= */
(function (janela, documento) {
  'use strict';

  var D = janela.LojaDados;
  var L = janela.Loja;
  var CFG = D.config;

  var cupomAtivo = null;
  var freteEscolhido = null;
  var opcoesFrete = [];

  /* ------------------------------------------------------------ cálculos */
  function subtotal() { return L.subtotal(); }

  function valorDesconto() {
    if (!cupomAtivo || cupomAtivo.tipo !== 'percentual') return 0;
    return subtotal() * cupomAtivo.valor;
  }

  function valorFrete() {
    if (!freteEscolhido) return 0;
    if (cupomAtivo && cupomAtivo.tipo === 'frete') return 0;
    return freteEscolhido.valor;
  }

  function total() {
    return Math.max(0, subtotal() - valorDesconto()) + valorFrete();
  }

  /* ------------------------------------------------------------ itens */
  function listaItens() {
    var itens = L.itensCarrinho();

    if (!itens.length) {
      return '<div class="painel"><div class="vazio">' + L.icone('sacola', 56) +
        '<h3>Seu carrinho está vazio</h3>' +
        '<p>Que tal começar pelos nossos mais vendidos?</p>' +
        '<a class="btn btn--principal" href="index.html" style="margin-top:12px">Ir às compras</a>' +
        '</div></div>';
    }

    var sub = subtotal();
    var falta = CFG.freteGratisAcima - sub;

    return '<div class="painel">' +
      '<h2 class="painel__titulo">Meu carrinho (' + L.totalItens() + ' ' +
        (L.totalItens() === 1 ? 'item' : 'itens') + ')</h2>' +

      (falta > 0
        ? '<div class="progresso-frete">Faltam <strong>' + L.moeda(falta) +
          '</strong> para você ganhar frete grátis' +
          '<div class="progresso-frete__trilho"><div class="progresso-frete__preenchimento" style="width:' +
          Math.min(100, (sub / CFG.freteGratisAcima) * 100).toFixed(0) + '%"></div></div></div>'
        : '<div class="progresso-frete">' + L.icone('cheque', 15) +
          ' <strong>Parabéns! Sua compra tem frete grátis.</strong></div>') +

      itens.map(function (item) {
        var p = D.porSku(item.sku);
        if (!p) return '';
        return '<div class="item-carrinho">' +
          '<a href="produto.html?sku=' + encodeURIComponent(p.sku) + '">' +
            '<img src="assets/img/' + L.escapar(p.imagem) + '" alt="' + L.escapar(p.nome) + '" ' +
            'width="92" height="92"></a>' +
          '<div>' +
            '<span class="item-carrinho__marca">' + L.escapar(p.marca) + '</span>' +
            '<a class="item-carrinho__nome" href="produto.html?sku=' + encodeURIComponent(p.sku) + '">' +
              L.escapar(p.nome) + '</a>' +
            (item.rotulo ? '<div style="font-size:12.5px;color:var(--tinta-500)">' +
              L.escapar(item.rotulo) + '</div>' : '') +
            '<div class="item-carrinho__acoes">' +
              '<div class="contador">' +
                '<button type="button" data-item-menos="' + L.escapar(item.chave) + '" ' +
                  'aria-label="Diminuir quantidade">−</button>' +
                '<label class="so-leitor" for="q-' + L.escapar(item.chave) + '">Quantidade</label>' +
                '<input id="q-' + L.escapar(item.chave) + '" type="number" value="' + item.qtd +
                  '" min="1" max="' + p.estoque + '" data-item-qtd="' + L.escapar(item.chave) + '">' +
                '<button type="button" data-item-mais="' + L.escapar(item.chave) + '" ' +
                  'aria-label="Aumentar quantidade">+</button>' +
              '</div>' +
              '<button class="item-carrinho__remover" type="button" data-remover="' +
                L.escapar(item.chave) + '">Remover</button>' +
            '</div>' +
          '</div>' +
          '<div class="item-carrinho__total">' +
            '<div class="preco-atual" style="font-size:18px">' + L.moeda(item.preco * item.qtd) + '</div>' +
            (item.qtd > 1 ? '<div style="font-size:12px;color:var(--tinta-500)">' +
              L.moeda(item.preco) + ' cada</div>' : '') +
          '</div>' +
        '</div>';
      }).join('') +

      '<div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:20px">' +
        '<a class="btn btn--neutro" href="index.html">' + L.icone('seta_esq', 16) + ' Continuar comprando</a>' +
        '<button class="btn btn--neutro" type="button" data-esvaziar>Esvaziar carrinho</button>' +
      '</div></div>' +
      blocoFrete();
  }

  /* ------------------------------------------------------------ frete */
  function blocoFrete() {
    if (!L.itensCarrinho().length) return '';
    var cepSalvo = L.recuperar(L.chaves.cep, '');

    return '<div class="painel">' +
      '<h2 class="painel__titulo">' + L.icone('caminhao', 18) + ' Entrega</h2>' +
      '<form class="frete__form" id="form-frete-carrinho" style="max-width:380px">' +
        '<label class="so-leitor" for="cep-carrinho">CEP de entrega</label>' +
        '<input id="cep-carrinho" type="text" inputmode="numeric" placeholder="00000-000" ' +
          'maxlength="9" value="' + L.escapar(cepSalvo) + '" autocomplete="postal-code">' +
        '<button class="btn btn--contorno" type="submit">Calcular</button>' +
      '</form>' +
      '<div id="frete-opcoes" style="margin-top:14px" role="status" aria-live="polite"></div>' +
    '</div>';
  }

  function desenharFrete(cep) {
    var saida = documento.getElementById('frete-opcoes');
    if (!saida) return;

    var r = L.calcularFrete(cep, subtotal());
    if (r.erro) {
      saida.innerHTML = '<p class="frete__erro">' + L.escapar(r.erro) + '</p>';
      opcoesFrete = [];
      freteEscolhido = null;
      desenharResumo();
      return;
    }

    L.guardar(L.chaves.cep, cep);
    opcoesFrete = r.opcoes;
    if (!freteEscolhido || opcoesFrete.indexOf(freteEscolhido) === -1) freteEscolhido = opcoesFrete[0];

    saida.innerHTML =
      '<p style="font-size:12.5px;color:var(--tinta-500);margin-bottom:8px">' + L.icone('local', 13) +
        ' Entregas para ' + L.escapar(r.regiao.nome) + ' — CEP ' + r.cep + '</p>' +
      '<div class="frete__resultado">' + opcoesFrete.map(function (o, i) {
        return '<label class="frete__opcao" style="cursor:pointer">' +
          '<span style="display:flex;gap:10px;align-items:flex-start">' +
            '<input type="radio" name="frete" data-frete="' + i + '"' +
              (o === freteEscolhido ? ' checked' : '') + ' style="margin-top:3px;accent-color:var(--marca-700)">' +
            '<span><b>' + L.escapar(o.nome) + '</b><small>' + L.escapar(o.prazo) + '</small></span>' +
          '</span>' +
          '<span class="valor' + (o.gratis ? ' gratis' : '') + '">' +
            (o.gratis ? 'Grátis' : L.moeda(o.valor)) + '</span></label>';
      }).join('') + '</div>';

    desenharResumo();
  }

  /* ------------------------------------------------------------ resumo */
  function desenharResumo() {
    var alvo = documento.getElementById('resumo');
    if (!alvo) return;

    if (!L.itensCarrinho().length) { alvo.innerHTML = ''; return; }

    var sub = subtotal();
    var desc = valorDesconto();
    var frete = valorFrete();
    var tot = total();
    var parc = L.parcelamento(tot);

    alvo.innerHTML = '<div class="painel resumo">' +
      '<h2 class="painel__titulo">Resumo do pedido</h2>' +

      '<div class="resumo__linha"><span>Subtotal (' + L.totalItens() + ' itens)</span>' +
        '<span>' + L.moeda(sub) + '</span></div>' +

      (desc > 0 ? '<div class="resumo__linha desconto"><span>Cupom ' +
        L.escapar(cupomAtivo.codigo) + '</span><span>− ' + L.moeda(desc) + '</span></div>' : '') +

      '<div class="resumo__linha"><span>Frete</span><span>' +
        (!freteEscolhido ? 'Calcule acima'
          : (frete === 0 ? '<span style="color:var(--ok-600);font-weight:700">Grátis</span>' : L.moeda(frete))) +
        '</span></div>' +

      '<div class="cupom">' +
        '<label class="so-leitor" for="cupom">Código do cupom</label>' +
        '<input id="cupom" type="text" placeholder="Cupom de desconto" ' +
          'value="' + (cupomAtivo ? L.escapar(cupomAtivo.codigo) : '') + '">' +
        '<button class="btn btn--neutro" type="button" data-cupom>Aplicar</button>' +
      '</div>' +
      '<p style="font-size:11.5px;color:var(--tinta-500);margin:-4px 0 0">' +
        'Experimente: <code>SAOCARLOS10</code>, <code>PRIMEIRA20</code> ou <code>FRETEGRATIS</code>.</p>' +

      '<div class="resumo__total"><span>Total</span><span>' + L.moeda(tot) + '</span></div>' +
      '<p class="compra__pix" style="margin:6px 0 0">' + L.icone('pix', 15) +
        L.moeda(L.precoPix(tot)) + ' à vista no PIX</p>' +
      '<p class="compra__parcelas" style="margin:0 0 12px">' +
        (parc.vezes > 1 ? 'ou ' + parc.vezes + 'x de ' + L.moeda(parc.valor) + ' sem juros'
                        : 'ou à vista no cartão') + '</p>' +

      '<a class="btn btn--compra btn--bloco" href="checkout.html">' +
        L.icone('escudo', 17) + ' Finalizar compra</a>' +

      '<div class="seguranca" style="margin-top:14px">' +
        '<div>' + L.icone('escudo', 15) + ' Ambiente seguro e dados criptografados</div>' +
        '<div>' + L.icone('devolucao', 15) + ' Devolução gratuita em até 7 dias</div>' +
      '</div></div>';
  }

  /* ------------------------------------------------------------ pedido */
  function finalizar() {
    if (!L.itensCarrinho().length) { L.aviso('Adicione produtos ao carrinho.', 'erro'); return; }
    if (!freteEscolhido) { L.aviso('Informe seu CEP para calcular o frete.', 'erro'); return; }

    var numero = 'DSC-' + String(Math.floor(Math.random() * 900000) + 100000);
    var valorTotal = total();
    var entrega = freteEscolhido.prazo;

    L.esvaziar();
    cupomAtivo = null;
    freteEscolhido = null;

    documento.getElementById('conteudo').innerHTML =
      '<div class="container"><div class="painel" style="max-width:620px;margin:0 auto;text-align:center">' +
        '<div style="width:64px;height:64px;border-radius:50%;background:var(--ok-50);color:var(--ok-600);' +
          'display:grid;place-items:center;margin:0 auto 16px">' + L.icone('cheque', 32) + '</div>' +
        '<h1 style="font-size:22px;margin-bottom:8px">Pedido ' + numero + ' confirmado</h1>' +
        '<p style="color:var(--tinta-700)">Enviamos a confirmação para o seu e-mail. ' +
          'A entrega está prevista para <strong>' + L.escapar(entrega) + '</strong>.</p>' +
        '<p style="font-size:26px;font-weight:800;margin:16px 0">' + L.moeda(valorTotal) + '</p>' +
        '<div class="aviso-legal" style="text-align:left">' +
          '<strong>Simulação</strong>Este é um site de demonstração: nenhum pagamento foi ' +
          'processado e nenhum pedido real foi gerado.</div>' +
        '<a class="btn btn--principal" href="index.html" style="margin-top:16px">Voltar à loja</a>' +
      '</div></div>';

    janela.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ------------------------------------------------------------ sugestões */
  function sugestoes() {
    var noCarrinho = L.itensCarrinho().map(function (i) { return i.sku; });
    var lista = D.produtos.filter(function (p) {
      return noCarrinho.indexOf(p.sku) === -1 && p.estoque > 0 && p.destaque;
    }).slice(0, 5);
    if (!lista.length) return '';

    return '<div class="container"><section class="secao">' +
      '<div class="secao__cabecalho"><div><h2>Aproveite e leve também</h2>' +
      '<p>Produtos que combinam com o seu carrinho</p></div></div>' +
      L.prateleira(lista, 'trilho-sugestoes') + '</section></div>';
  }

  /* ------------------------------------------------------------ render */
  function desenhar() {
    documento.getElementById('itens').innerHTML = listaItens();
    desenharResumo();

    var campoCep = documento.getElementById('cep-carrinho');
    if (campoCep) {
      L.mascaraCep(campoCep);
      if (campoCep.value) desenharFrete(campoCep.value);
    }

    var extras = documento.getElementById('extras');
    if (extras) extras.innerHTML = sugestoes();
  }

  function montar() {
    L.iniciar('carrinho');

    documento.getElementById('trilha').innerHTML =
      '<nav class="trilha" aria-label="Você está aqui"><div class="container"><ol>' +
        '<li><a href="index.html">Início</a></li>' +
        '<li aria-current="page">Carrinho</li></ol></div></nav>';

    documento.getElementById('conteudo').innerHTML =
      '<div class="container">' +
        '<div class="layout-carrinho">' +
          '<div id="itens"></div>' +
          '<div id="resumo"></div>' +
        '</div>' +
      '</div><div id="extras"></div>';

    desenhar();

    documento.addEventListener('carrinho:mudou', desenhar);

    documento.addEventListener('submit', function (e) {
      if (e.target.id === 'form-frete-carrinho') {
        e.preventDefault();
        desenharFrete(documento.getElementById('cep-carrinho').value);
      }
    });

    documento.addEventListener('change', function (e) {
      var f = e.target.closest('[data-frete]');
      if (f) {
        freteEscolhido = opcoesFrete[Number(f.getAttribute('data-frete'))];
        desenharResumo();
        return;
      }
      var q = e.target.closest('[data-item-qtd]');
      if (q) L.alterarQtd(q.getAttribute('data-item-qtd'), Number(q.value));
    });

    documento.addEventListener('click', function (e) {
      var menos = e.target.closest('[data-item-menos]');
      if (menos) {
        var chaveM = menos.getAttribute('data-item-menos');
        var campoM = documento.querySelector('[data-item-qtd="' + chaveM + '"]');
        L.alterarQtd(chaveM, Number(campoM.value) - 1);
        return;
      }

      var mais = e.target.closest('[data-item-mais]');
      if (mais) {
        var chaveP = mais.getAttribute('data-item-mais');
        var campoP = documento.querySelector('[data-item-qtd="' + chaveP + '"]');
        L.alterarQtd(chaveP, Number(campoP.value) + 1);
        return;
      }

      if (e.target.closest('[data-esvaziar]')) { L.esvaziar(); return; }
      if (e.target.closest('[data-finalizar]')) { finalizar(); return; }

      if (e.target.closest('[data-cupom]')) {
        var campo = documento.getElementById('cupom');
        var codigo = campo.value.trim().toUpperCase();
        if (!codigo) { cupomAtivo = null; L.guardar('dsc:cupom', null); desenharResumo(); return; }

        var regra = CFG.cupons[codigo];
        if (!regra) { L.aviso('Cupom inválido ou expirado.', 'erro'); return; }
        if (regra.minimo && subtotal() < regra.minimo) {
          L.aviso('Este cupom é válido para compras acima de ' + L.moeda(regra.minimo) + '.', 'erro');
          return;
        }
        cupomAtivo = { codigo: codigo, tipo: regra.tipo, valor: regra.valor };
        L.guardar('dsc:cupom', codigo);
        L.aviso('Cupom aplicado: ' + regra.descricao + '.', 'ok');
        desenharResumo();
      }
    });
  }

  /* espera o DOM e o catálogo (do banco, se configurado) */
  janela.LojaAPI.pronto(montar);
})(window, document);
