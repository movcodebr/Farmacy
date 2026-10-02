/* =========================================================================
   Checkout em etapas: identificação → entrega → pagamento → confirmação.
   O provedor de pagamento ainda não está integrado; o ponto de integração
   está isolado em `cobrar()`, e nenhuma cobrança real acontece.
   ========================================================================= */
(function (janela, documento) {
  'use strict';

  var D = janela.LojaDados;
  var L = janela.Loja;
  var CFG = D.config;

  var PASSOS = ['Identificação', 'Entrega', 'Pagamento', 'Confirmação'];

  var estado = {
    passo: 0,
    cliente: L.clienteLogado() || { nome: '', email: '', cpf: '', telefone: '' },
    entrega: { cep: L.recuperar(L.chaves.cep, ''), rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
    frete: null,
    opcoesFrete: [],
    pagamento: 'pix',
    cupom: null,
    pedido: null
  };

  /* ------------------------------------------------------------ cálculos */
  function subtotal() { return L.subtotal(); }

  function valorDesconto() {
    if (!estado.cupom || estado.cupom.tipo !== 'percentual') return 0;
    return subtotal() * estado.cupom.valor;
  }

  function valorFrete() {
    if (!estado.frete) return 0;
    if (estado.cupom && estado.cupom.tipo === 'frete') return 0;
    return estado.frete.valor;
  }

  function total() {
    var t = Math.max(0, subtotal() - valorDesconto()) + valorFrete();
    return estado.pagamento === 'pix' ? L.precoPix(t) : t;
  }

  function totalSemPix() {
    return Math.max(0, subtotal() - valorDesconto()) + valorFrete();
  }

  /* ------------------------------------------------------------ trilha de passos */
  function trilhaPassos() {
    return '<ol class="passos">' + PASSOS.map(function (nome, i) {
      var classe = i < estado.passo ? ' passo--feito' : (i === estado.passo ? ' passo--ativo' : '');
      return '<li class="passo' + classe + '"' + (i === estado.passo ? ' aria-current="step"' : '') + '>' +
        '<span class="passo__bolha">' + (i < estado.passo ? L.icone('cheque', 15) : (i + 1)) + '</span>' +
        '<span class="passo__nome">' + nome + '</span></li>';
    }).join('') + '</ol>';
  }

  /* ------------------------------------------------------------ etapa 1 */
  function etapaIdentificacao() {
    var c = estado.cliente;
    return '<form class="form-checkout" id="form-passo">' +
      '<h2 class="painel__titulo">Seus dados</h2>' +
      (L.clienteLogado()
        ? '<p class="nota-logado">' + L.icone('cheque', 15) + ' Você está conectado como <strong>' +
          L.escapar(c.email) + '</strong>.</p>'
        : '<p class="nota-logado">Já tem conta? <a href="conta.html">Entre aqui</a> para preencher automaticamente.</p>') +
      '<div class="campos">' +
        campo('nome', 'Nome completo', c.nome, 'text', true) +
        campo('email', 'E-mail', c.email, 'email', true) +
        campo('cpf', 'CPF', c.cpf, 'text', true, '000.000.000-00') +
        campo('telefone', 'Celular com DDD', c.telefone, 'tel', true, '(00) 00000-0000') +
      '</div>' +
      '<div class="acoes-passo">' +
        '<a class="btn btn--neutro" href="carrinho.html">' + L.icone('seta_esq', 16) + ' Voltar ao carrinho</a>' +
        '<button class="btn btn--compra" type="submit">Continuar para entrega</button>' +
      '</div></form>';
  }

  /* ------------------------------------------------------------ etapa 2 */
  function etapaEntrega() {
    var e = estado.entrega;
    var salvos = L.enderecos();

    return '<form class="form-checkout" id="form-passo">' +
      '<h2 class="painel__titulo">Endereço de entrega</h2>' +
      (salvos.length
        ? '<div class="enderecos-salvos">' + salvos.map(function (s, i) {
            return '<button class="endereco-salvo" type="button" data-endereco="' + i + '">' +
              L.icone('local', 15) + '<span><b>' + L.escapar(s.rua + ', ' + s.numero) + '</b>' +
              '<small>' + L.escapar(s.bairro + ' — ' + s.cidade + '/' + s.uf + ' · ' + s.cep) + '</small></span></button>';
          }).join('') + '</div>'
        : '') +
      '<div class="campos">' +
        campo('cep', 'CEP', e.cep, 'text', true, '00000-000') +
        '<div class="campo campo--largo"><span class="campo__vazio"></span></div>' +
        campo('rua', 'Rua ou avenida', e.rua, 'text', true) +
        campo('numero', 'Número', e.numero, 'text', true) +
        campo('complemento', 'Complemento', e.complemento, 'text', false, 'Apto, bloco, referência') +
        campo('bairro', 'Bairro', e.bairro, 'text', true) +
        campo('cidade', 'Cidade', e.cidade, 'text', true) +
        campo('uf', 'UF', e.uf, 'text', true) +
      '</div>' +
      '<h2 class="painel__titulo" style="margin-top:28px">Forma de entrega</h2>' +
      '<div id="opcoes-frete" role="status" aria-live="polite">' +
        (estado.opcoesFrete.length ? listaFrete()
          : '<p class="dica">Informe o CEP acima para ver as opções de entrega.</p>') +
      '</div>' +
      '<div class="acoes-passo">' +
        '<button class="btn btn--neutro" type="button" data-voltar>' + L.icone('seta_esq', 16) + ' Voltar</button>' +
        '<button class="btn btn--compra" type="submit">Continuar para pagamento</button>' +
      '</div></form>';
  }

  function listaFrete() {
    return '<div class="frete__resultado">' + estado.opcoesFrete.map(function (o, i) {
      return '<label class="frete__opcao" style="cursor:pointer">' +
        '<span style="display:flex;gap:10px;align-items:flex-start">' +
          '<input type="radio" name="frete" data-frete="' + i + '"' +
            (o === estado.frete ? ' checked' : '') + ' style="margin-top:3px;accent-color:var(--marca-700)">' +
          '<span><b>' + L.escapar(o.nome) + '</b><small>' + L.escapar(o.prazo) + '</small></span></span>' +
        '<span class="valor' + (o.gratis ? ' gratis' : '') + '">' +
          (o.gratis ? 'Grátis' : L.moeda(o.valor)) + '</span></label>';
    }).join('') + '</div>';
  }

  /* ------------------------------------------------------------ etapa 3 */
  function etapaPagamento() {
    var bruto = totalSemPix();
    var parc = L.parcelamento(bruto);

    var opcoes = [
      ['pix', 'PIX', L.moeda(L.precoPix(bruto)) + ' — 5% de desconto', 'pix'],
      ['cartao', 'Cartão de crédito',
        parc.vezes > 1 ? 'até ' + parc.vezes + 'x de ' + L.moeda(parc.valor) + ' sem juros'
                       : L.moeda(bruto) + ' à vista', 'cartao'],
      ['boleto', 'Boleto bancário', L.moeda(bruto) + ' — compensa em até 3 dias úteis', 'cartao']
    ];

    return '<form class="form-checkout" id="form-passo">' +
      '<h2 class="painel__titulo">Forma de pagamento</h2>' +
      '<div class="metodos">' + opcoes.map(function (o) {
        return '<label class="metodo' + (estado.pagamento === o[0] ? ' metodo--ativo' : '') + '">' +
          '<input type="radio" name="pagamento" value="' + o[0] + '"' +
            (estado.pagamento === o[0] ? ' checked' : '') + '>' +
          '<span class="metodo__icone">' + L.icone(o[3], 20) + '</span>' +
          '<span><b>' + o[1] + '</b><small>' + o[2] + '</small></span></label>';
      }).join('') + '</div>' +

      '<div id="detalhe-pagamento">' + detalhePagamento() + '</div>' +

      '<div class="aviso-legal"><strong>Pagamento ainda não integrado</strong>' +
      'Esta é uma demonstração: o checkout está pronto, mas nenhum provedor de pagamento foi conectado. ' +
      'Nenhuma cobrança é feita e nenhum dado de cartão é enviado a lugar nenhum.</div>' +

      '<div class="acoes-passo">' +
        '<button class="btn btn--neutro" type="button" data-voltar>' + L.icone('seta_esq', 16) + ' Voltar</button>' +
        '<button class="btn btn--compra" type="submit">' + L.icone('escudo', 17) + ' Finalizar pedido</button>' +
      '</div></form>';
  }

  function detalhePagamento() {
    if (estado.pagamento === 'pix') {
      return '<div class="caixa-pagamento">' +
        '<div class="pix-demo">' +
          '<div class="pix-demo__codigo" aria-hidden="true">' +
            Array.from({ length: 64 }, function (_, i) {
              return '<i' + ((i * 7 + (i % 5) * 3) % 3 === 0 ? ' class="on"' : '') + '></i>';
            }).join('') +
          '</div>' +
          '<div><b>Pague com PIX e ganhe 5%</b>' +
          '<p>Ao finalizar, geramos o código para você pagar pelo app do seu banco. ' +
          'O pedido é liberado assim que o pagamento cair — normalmente em segundos.</p></div>' +
        '</div></div>';
    }

    if (estado.pagamento === 'cartao') {
      var parc = L.parcelamento(totalSemPix());
      var opcoes = '';
      for (var i = 1; i <= parc.vezes; i++) {
        opcoes += '<option value="' + i + '">' +
          (i === 1 ? 'À vista — ' + L.moeda(totalSemPix())
                   : i + 'x de ' + L.moeda(totalSemPix() / i) + ' sem juros') + '</option>';
      }
      return '<div class="caixa-pagamento"><div class="campos">' +
        campo('cartao_numero', 'Número do cartão', '', 'text', true, '0000 0000 0000 0000') +
        campo('cartao_nome', 'Nome impresso no cartão', '', 'text', true) +
        campo('cartao_validade', 'Validade', '', 'text', true, 'MM/AA') +
        campo('cartao_cvv', 'Código de segurança', '', 'text', true, 'CVV') +
        '<div class="campo campo--largo"><label for="parcelas">Parcelamento</label>' +
          '<select id="parcelas" name="parcelas">' + opcoes + '</select></div>' +
      '</div></div>';
    }

    return '<div class="caixa-pagamento">' +
      '<p class="dica">O boleto é gerado ao finalizar o pedido e vence em 3 dias úteis. ' +
      'Os itens ficam reservados até o vencimento; a entrega começa a contar após a compensação.</p></div>';
  }

  /* ------------------------------------------------------------ etapa 4 */
  function etapaConfirmacao() {
    var p = estado.pedido;
    var rotulos = { pix: 'PIX', cartao: 'Cartão de crédito', boleto: 'Boleto bancário' };

    return '<div class="confirmacao">' +
      '<div class="confirmacao__selo">' + L.icone('cheque', 34) + '</div>' +
      '<h2>Pedido ' + L.escapar(p.numero) + ' recebido</h2>' +
      '<p>Enviamos a confirmação para <strong>' + L.escapar(p.cliente.email) + '</strong>. ' +
      'A entrega está prevista para <strong>' + L.escapar(p.frete.prazo) + '</strong>.</p>' +

      '<div class="confirmacao__resumo">' +
        linhaResumo('Total do pedido', L.moeda(p.total)) +
        linhaResumo('Pagamento', rotulos[p.pagamento] || p.pagamento) +
        linhaResumo('Entrega', p.frete.nome) +
        linhaResumo('Endereço', p.entrega.rua + ', ' + p.entrega.numero + ' — ' +
          p.entrega.bairro + ', ' + p.entrega.cidade + '/' + p.entrega.uf) +
        linhaResumo('Status', p.status) +
      '</div>' +

      '<div class="aviso-legal" style="text-align:left"><strong>Simulação</strong>' +
      'Nenhum pagamento foi processado e nenhum pedido real foi gerado. ' +
      'O pedido fica salvo neste navegador para você ver como aparece em “Meus pedidos”.</div>' +

      '<div class="acoes-passo" style="justify-content:center">' +
        '<a class="btn btn--neutro" href="index.html">Voltar à loja</a>' +
        '<a class="btn btn--principal" href="conta.html">Ver meus pedidos</a>' +
      '</div></div>';
  }

  function linhaResumo(rotulo, valor) {
    return '<div class="resumo__linha"><span>' + rotulo + '</span><strong>' + L.escapar(valor) + '</strong></div>';
  }

  /* ------------------------------------------------------------ campo */
  function campo(nome, rotulo, valor, tipo, obrigatorio, dica) {
    var largo = ['nome', 'email', 'rua', 'complemento'].indexOf(nome) !== -1 ||
                nome.indexOf('cartao_n') === 0;
    return '<div class="campo' + (largo ? ' campo--largo' : '') + '">' +
      '<label for="c-' + nome + '">' + rotulo + (obrigatorio ? '' : ' <em>(opcional)</em>') + '</label>' +
      '<input id="c-' + nome + '" name="' + nome + '" type="' + (tipo || 'text') + '" ' +
      'value="' + L.escapar(valor || '') + '"' + (obrigatorio ? ' required' : '') +
      (dica ? ' placeholder="' + L.escapar(dica) + '"' : '') + '></div>';
  }

  /* ------------------------------------------------------------ resumo lateral */
  function resumoLateral() {
    var itens = L.itensCarrinho();
    if (!itens.length) return '';

    var bruto = totalSemPix();
    var pix = estado.pagamento === 'pix';

    return '<aside class="painel resumo" aria-label="Resumo do pedido">' +
      '<h2 class="painel__titulo">Resumo</h2>' +
      '<div class="resumo-itens">' + itens.map(function (item) {
        var prod = D.porSku(item.sku);
        if (!prod) return '';
        return '<div class="mini-item">' +
          '<img src="assets/img/' + L.escapar(prod.imagem) + '" alt="" width="62" height="62">' +
          '<div><span class="mini-item__nome">' + L.escapar(prod.nome) + '</span>' +
          '<small>Qtd.: ' + item.qtd + (item.rotulo ? ' · ' + L.escapar(item.rotulo) : '') + '</small></div>' +
          '<b>' + L.moeda(item.preco * item.qtd) + '</b></div>';
      }).join('') + '</div>' +

      '<div class="resumo__linha"><span>Subtotal</span><span>' + L.moeda(subtotal()) + '</span></div>' +
      (valorDesconto() > 0
        ? '<div class="resumo__linha desconto"><span>Cupom ' + L.escapar(estado.cupom.codigo) +
          '</span><span>− ' + L.moeda(valorDesconto()) + '</span></div>' : '') +
      '<div class="resumo__linha"><span>Frete</span><span>' +
        (estado.frete
          ? (valorFrete() === 0 ? '<span style="color:var(--ok-600);font-weight:700">Grátis</span>' : L.moeda(valorFrete()))
          : 'a calcular') + '</span></div>' +
      (pix ? '<div class="resumo__linha desconto"><span>Desconto PIX (5%)</span><span>− ' +
        L.moeda(bruto - L.precoPix(bruto)) + '</span></div>' : '') +

      '<div class="resumo__total"><span>Total</span><span>' + L.moeda(total()) + '</span></div>' +

      '<div class="seguranca" style="margin-top:14px">' +
        '<div>' + L.icone('escudo', 15) + ' Ambiente seguro e dados criptografados</div>' +
        '<div>' + L.icone('devolucao', 15) + ' Devolução gratuita em até 7 dias</div>' +
      '</div></aside>';
  }

  /* ------------------------------------------------------------ pagamento (stub) */
  /* Ponto único de integração com o provedor. Hoje apenas devolve o status
     inicial que o pedido teria; quando houver provedor, é aqui que a cobrança
     é criada e o retorno (QR do PIX, 3DS do cartão, linha digitável) é tratado. */
  function cobrar(metodo) {
    return {
      pix: 'Aguardando pagamento via PIX',
      cartao: 'Pagamento em análise',
      boleto: 'Aguardando compensação do boleto'
    }[metodo] || 'Aguardando pagamento';
  }

  /* ------------------------------------------------------------ fluxo */
  function finalizar() {
    var itens = L.itensCarrinho().map(function (item) {
      var prod = D.porSku(item.sku);
      return {
        sku: item.sku, nome: prod ? prod.nome : item.sku, marca: prod ? prod.marca : '',
        imagem: prod ? prod.imagem : '', rotulo: item.rotulo, preco: item.preco, qtd: item.qtd
      };
    });

    estado.pedido = L.salvarPedido({
      numero: L.novoNumeroPedido(),
      data: new Date().toISOString(),
      itens: itens,
      cliente: estado.cliente,
      entrega: estado.entrega,
      frete: estado.frete,
      pagamento: estado.pagamento,
      cupom: estado.cupom ? estado.cupom.codigo : null,
      subtotal: subtotal(),
      desconto: valorDesconto(),
      total: total(),
      status: cobrar(estado.pagamento)
    });

    L.salvarEndereco(estado.entrega);
    L.esvaziar();
    estado.passo = 3;
    desenhar();
    janela.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function avancar() {
    var form = documento.getElementById('form-passo');
    if (form && !form.reportValidity()) return;

    if (estado.passo === 0) {
      ['nome', 'email', 'cpf', 'telefone'].forEach(function (k) {
        estado.cliente[k] = documento.getElementById('c-' + k).value.trim();
      });
      estado.passo = 1;
    } else if (estado.passo === 1) {
      ['cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'uf'].forEach(function (k) {
        estado.entrega[k] = documento.getElementById('c-' + k).value.trim();
      });
      if (!estado.frete) { L.aviso('Escolha uma forma de entrega.', 'erro'); return; }
      estado.passo = 2;
    } else if (estado.passo === 2) {
      finalizar();
      return;
    }

    desenhar();
    janela.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function calcularFrete(cep) {
    var saida = documento.getElementById('opcoes-frete');
    if (!saida) return;

    var r = L.calcularFrete(cep, subtotal());
    if (r.erro) {
      saida.innerHTML = '<p class="frete__erro">' + L.escapar(r.erro) + '</p>';
      estado.opcoesFrete = [];
      estado.frete = null;
      return;
    }

    L.guardar(L.chaves.cep, cep);
    estado.opcoesFrete = r.opcoes;
    if (!estado.frete || estado.opcoesFrete.indexOf(estado.frete) === -1) estado.frete = r.opcoes[0];

    /* preenche cidade/UF a partir da faixa de CEP, como um serviço de CEP faria */
    var campoCidade = documento.getElementById('c-cidade');
    var campoUf = documento.getElementById('c-uf');
    if (campoCidade && !campoCidade.value) campoCidade.value = r.regiao.nome;
    if (campoUf && !campoUf.value) campoUf.value = r.regiao.uf;

    saida.innerHTML = listaFrete();
    atualizarResumo();
  }

  function atualizarResumo() {
    var alvo = documento.getElementById('resumo-checkout');
    if (alvo) alvo.innerHTML = resumoLateral();
  }

  /* ------------------------------------------------------------ render */
  function desenhar() {
    var corpo = documento.getElementById('corpo-checkout');

    if (!L.itensCarrinho().length && estado.passo < 3) {
      documento.getElementById('conteudo').innerHTML =
        '<div class="container"><div class="painel"><div class="vazio">' + L.icone('sacola', 56) +
        '<h3>Seu carrinho está vazio</h3><p>Adicione produtos antes de finalizar a compra.</p>' +
        '<a class="btn btn--principal" href="index.html" style="margin-top:12px">Ir às compras</a>' +
        '</div></div></div>';
      return;
    }

    documento.getElementById('passos').innerHTML = trilhaPassos();

    if (estado.passo === 3) {
      corpo.innerHTML = '<div class="painel">' + etapaConfirmacao() + '</div>';
      documento.getElementById('resumo-checkout').innerHTML = '';
      documento.querySelector('.layout-checkout').classList.add('layout-checkout--unico');
      return;
    }

    corpo.innerHTML = '<div class="painel">' +
      [etapaIdentificacao, etapaEntrega, etapaPagamento][estado.passo]() + '</div>';
    atualizarResumo();

    if (estado.passo === 1) {
      var cep = documento.getElementById('c-cep');
      L.mascaraCep(cep);
      if (cep.value) calcularFrete(cep.value);
      cep.addEventListener('blur', function () { calcularFrete(cep.value); });
    }
  }

  function montar() {
    L.iniciar('checkout');

    documento.getElementById('trilha').innerHTML =
      '<nav class="trilha" aria-label="Você está aqui"><div class="container"><ol>' +
        '<li><a href="index.html">Início</a></li>' +
        '<li><a href="carrinho.html">Carrinho</a></li>' +
        '<li aria-current="page">Finalizar compra</li></ol></div></nav>';

    documento.getElementById('conteudo').innerHTML =
      '<div class="container">' +
        '<h1 style="font-size:24px;margin-bottom:8px">Finalizar compra</h1>' +
        '<div id="passos"></div>' +
        '<div class="layout-checkout">' +
          '<div id="corpo-checkout"></div>' +
          '<div id="resumo-checkout"></div>' +
        '</div>' +
      '</div>';

    /* cupom aplicado no carrinho continua valendo aqui */
    var codigo = L.recuperar('dsc:cupom', null);
    if (codigo && CFG.cupons[codigo]) {
      estado.cupom = { codigo: codigo, tipo: CFG.cupons[codigo].tipo, valor: CFG.cupons[codigo].valor };
    }

    desenhar();

    documento.addEventListener('submit', function (e) {
      if (e.target.id === 'form-passo') { e.preventDefault(); avancar(); }
    });

    documento.addEventListener('click', function (e) {
      if (e.target.closest('[data-voltar]')) {
        estado.passo = Math.max(0, estado.passo - 1);
        desenhar();
        return;
      }

      var end = e.target.closest('[data-endereco]');
      if (end) {
        var s = L.enderecos()[Number(end.getAttribute('data-endereco'))];
        if (s) {
          estado.entrega = Object.assign({}, s);
          desenhar();
          calcularFrete(s.cep);
        }
      }
    });

    documento.addEventListener('change', function (e) {
      var f = e.target.closest('[data-frete]');
      if (f) {
        estado.frete = estado.opcoesFrete[Number(f.getAttribute('data-frete'))];
        atualizarResumo();
        return;
      }
      if (e.target.name === 'pagamento') {
        estado.pagamento = e.target.value;
        documento.getElementById('detalhe-pagamento').innerHTML = detalhePagamento();
        documento.querySelectorAll('.metodo').forEach(function (m) {
          m.classList.toggle('metodo--ativo', m.contains(e.target));
        });
        atualizarResumo();
      }
    });
  }

  /* espera o DOM e o catálogo (do banco, se configurado) */
  janela.LojaAPI.pronto(montar);
})(window, document);
