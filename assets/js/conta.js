/* =========================================================================
   Minha conta: entrar, cadastrar, pedidos, dados, endereços e clube.
   Login, cadastro e recuperação de senha usam Supabase Auth (auth.js).
   ========================================================================= */
(function (janela, documento) {
  'use strict';

  var D = janela.LojaDados;
  var L = janela.Loja;
  var CFG = D.config;
  var A = janela.LojaAuth;
  var recuperacao = false;   /* true quando o cliente chegou pelo link de redefinir senha */

  var aba = new janela.URLSearchParams(janela.location.search).get('aba') || 'pedidos';

  var ABAS = [
    ['pedidos', 'Meus pedidos', 'sacola'],
    ['dados', 'Meus dados', 'usuario'],
    ['enderecos', 'Endereços', 'local'],
    ['clube', 'Clube São Carlos', 'coracao']
  ];

  /* ------------------------------------------------------------ deslogado */
  function telaEntrada() {
    return '<div class="grade-entrada">' +
      '<section class="painel">' +
        '<h2 class="painel__titulo">Entrar</h2>' +
        '<form class="form-checkout" data-entrar>' +
          '<div class="campos">' +
            '<div class="campo campo--largo"><label for="e-email">E-mail</label>' +
              '<input id="e-email" type="email" required autocomplete="email"></div>' +
            '<div class="campo campo--largo"><label for="e-senha">Senha</label>' +
              '<input id="e-senha" type="password" required autocomplete="current-password"></div>' +
          '</div>' +
          '<a href="#" style="font-size:13px" data-esqueci>Esqueci minha senha</a>' +
          '<button class="btn btn--compra btn--bloco" type="submit" style="margin-top:12px">Entrar</button>' +
        '</form>' +
      '</section>' +

      '<section class="painel">' +
        '<h2 class="painel__titulo">Criar conta</h2>' +
        '<p style="font-size:13.5px;color:var(--tinta-500);margin-top:-8px">' +
        'O cadastro é gratuito e já entra no Clube São Carlos, com até 15% de desconto.</p>' +
        '<form class="form-checkout" data-cadastrar>' +
          '<div class="campos">' +
            '<div class="campo campo--largo"><label for="n-nome">Nome completo</label>' +
              '<input id="n-nome" required autocomplete="name"></div>' +
            '<div class="campo campo--largo"><label for="n-email">E-mail</label>' +
              '<input id="n-email" type="email" required autocomplete="email"></div>' +
            '<div class="campo"><label for="n-cpf">CPF</label>' +
              '<input id="n-cpf" required placeholder="000.000.000-00"></div>' +
            '<div class="campo"><label for="n-tel">Celular</label>' +
              '<input id="n-tel" type="tel" required placeholder="(00) 00000-0000"></div>' +
            '<div class="campo campo--largo"><label for="n-senha">Crie uma senha</label>' +
              '<input id="n-senha" type="password" required minlength="8" autocomplete="new-password"></div>' +
          '</div>' +
          '<label class="filtro__item" style="margin-top:4px">' +
            '<input type="checkbox" id="n-aceite" required>' +
            '<span style="font-size:12.5px">Li e aceito os <a href="institucional.html?p=termos">termos de uso</a> ' +
            'e a <a href="institucional.html?p=privacidade">política de privacidade</a>.</span></label>' +
          '<button class="btn btn--principal btn--bloco" type="submit" style="margin-top:12px">Criar minha conta</button>' +
        '</form>' +
      '</section></div>';
  }

  /* ------------------------------------------------------------ nova senha */
  function telaNovaSenha() {
    return '<section class="painel" style="max-width:480px">' +
      '<h2 class="painel__titulo">Criar nova senha</h2>' +
      '<form class="form-checkout" data-nova-senha>' +
        '<div class="campos">' +
          '<div class="campo campo--largo"><label for="ns-1">Nova senha</label>' +
            '<input id="ns-1" type="password" required minlength="8" autocomplete="new-password"></div>' +
          '<div class="campo campo--largo"><label for="ns-2">Repita a nova senha</label>' +
            '<input id="ns-2" type="password" required minlength="8" autocomplete="new-password"></div>' +
        '</div>' +
        '<button class="btn btn--principal btn--bloco" type="submit" style="margin-top:12px">Salvar nova senha</button>' +
      '</form></section>';
  }

  /* ------------------------------------------------------------ pedidos */
  function abaPedidos() {
    var lista = L.pedidos();

    if (!lista.length) {
      return '<div class="painel"><div class="vazio">' + L.icone('sacola', 56) +
        '<h3>Você ainda não fez pedidos</h3>' +
        '<p>Quando fizer, eles aparecem aqui com status e rastreio.</p>' +
        '<a class="btn btn--principal" href="index.html" style="margin-top:12px">Começar a comprar</a>' +
        '</div></div>';
    }

    return lista.map(function (p) {
      var qtd = p.itens.reduce(function (s, i) { return s + i.qtd; }, 0);
      return '<article class="painel pedido">' +
        '<header class="pedido__topo">' +
          '<div><span class="pedido__numero">Pedido ' + L.escapar(p.numero) + '</span>' +
          '<span class="pedido__data">' + L.dataBr(p.data.slice(0, 10)) + ' · ' + qtd +
            ' ' + (qtd === 1 ? 'item' : 'itens') + '</span></div>' +
          '<span class="etiqueta-status">' + L.escapar(p.status) + '</span>' +
        '</header>' +
        '<div class="pedido__itens">' + p.itens.map(function (i) {
          return '<img src="assets/img/' + L.escapar(i.imagem) + '" alt="' + L.escapar(i.nome) +
            '" title="' + L.escapar(i.nome) + '" width="56" height="56">';
        }).join('') + '</div>' +
        '<footer class="pedido__rodape">' +
          '<div><small>Entrega: ' + L.escapar(p.frete ? p.frete.nome : '—') + '</small>' +
          '<b>' + L.moeda(p.total) + '</b></div>' +
          '<button class="btn btn--neutro" type="button" data-detalhe="' + L.escapar(p.numero) + '">' +
            'Ver detalhes</button>' +
        '</footer>' +
        '<div class="pedido__detalhe" id="det-' + L.escapar(p.numero) + '" hidden>' +
          '<table class="tabela-specs"><tbody>' +
            p.itens.map(function (i) {
              return '<tr><th scope="row">' + L.escapar(i.nome) +
                (i.rotulo ? ' <small>(' + L.escapar(i.rotulo) + ')</small>' : '') +
                '</th><td>' + i.qtd + ' × ' + L.moeda(i.preco) + '</td></tr>';
            }).join('') +
            '<tr><th scope="row">Subtotal</th><td>' + L.moeda(p.subtotal) + '</td></tr>' +
            (p.desconto ? '<tr><th scope="row">Desconto' + (p.cupom ? ' (' + L.escapar(p.cupom) + ')' : '') +
              '</th><td>− ' + L.moeda(p.desconto) + '</td></tr>' : '') +
            '<tr><th scope="row">Entrega</th><td>' + L.escapar(p.entrega.rua + ', ' + p.entrega.numero +
              ' — ' + p.entrega.bairro + ', ' + p.entrega.cidade + '/' + p.entrega.uf) + '</td></tr>' +
            '<tr><th scope="row">Total</th><td><strong>' + L.moeda(p.total) + '</strong></td></tr>' +
          '</tbody></table>' +
          '<div class="acoes-passo" style="justify-content:flex-start">' +
            '<button class="btn btn--neutro" type="button" data-recomprar="' + L.escapar(p.numero) + '">' +
              L.icone('devolucao', 15) + ' Comprar novamente</button>' +
            '<a class="btn btn--neutro" href="institucional.html?p=trocas">Solicitar troca</a>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* ------------------------------------------------------------ dados */
  function abaDados() {
    var c = L.clienteLogado() || {};
    return '<div class="painel"><h2 class="painel__titulo">Meus dados</h2>' +
      '<form class="form-checkout" data-salvar-dados>' +
        '<div class="campos">' +
          '<div class="campo campo--largo"><label for="d-nome">Nome completo</label>' +
            '<input id="d-nome" value="' + L.escapar(c.nome || '') + '" required></div>' +
          '<div class="campo campo--largo"><label for="d-email">E-mail</label>' +
            '<input id="d-email" type="email" value="' + L.escapar(c.email || '') + '" readonly></div>' +
          '<div class="campo"><label for="d-cpf">CPF</label>' +
            '<input id="d-cpf" value="' + L.escapar(c.cpf || '') + '"></div>' +
          '<div class="campo"><label for="d-tel">Celular</label>' +
            '<input id="d-tel" type="tel" value="' + L.escapar(c.telefone || '') + '"></div>' +
        '</div>' +
        '<button class="btn btn--principal" type="submit" style="justify-self:start;margin-top:12px">' +
          'Salvar alterações</button>' +
      '</form></div>' +

      '<div class="painel"><h2 class="painel__titulo">Preferências de contato</h2>' +
        '<div style="display:grid;gap:10px">' +
          ['Receber ofertas e cupons por e-mail',
           'Receber lembretes de recompra dos meus medicamentos',
           'Receber avisos de status do pedido por SMS'].map(function (t, i) {
            return '<label class="filtro__item"><input type="checkbox"' + (i < 2 ? ' checked' : '') +
              '><span>' + t + '</span></label>';
          }).join('') +
        '</div></div>' +

      '<div class="painel"><h2 class="painel__titulo">Privacidade</h2>' +
        '<p style="font-size:13.5px;color:var(--tinta-700)">Você pode baixar ou apagar seus dados a ' +
        'qualquer momento pelo portal do titular.</p>' +
        '<div class="acoes-passo" style="justify-content:flex-start">' +
          '<a class="btn btn--neutro" href="institucional.html?p=lgpd">Portal do titular (LGPD)</a>' +
          '<button class="btn btn--neutro" type="button" data-apagar>Sair e limpar dados deste navegador</button>' +
        '</div></div>';
  }

  /* ------------------------------------------------------------ endereços */
  function abaEnderecos() {
    var lista = L.enderecos();
    return '<div class="painel"><h2 class="painel__titulo">Endereços salvos</h2>' +
      (lista.length
        ? '<div class="grade-lojas">' + lista.map(function (e) {
            return '<article class="cartao-loja">' +
              '<h2>' + L.escapar(e.rua + ', ' + e.numero) + '</h2>' +
              '<p class="cartao-loja__linha">' + L.icone('local', 15) + ' ' +
                L.escapar(e.bairro + ' — ' + e.cidade + '/' + e.uf) + '</p>' +
              '<p class="cartao-loja__linha">' + L.icone('caminhao', 15) + ' CEP ' + L.escapar(e.cep) + '</p>' +
              (e.complemento ? '<p class="cartao-loja__linha">' + L.icone('usuario', 15) + ' ' +
                L.escapar(e.complemento) + '</p>' : '') +
            '</article>';
          }).join('') + '</div>'
        : '<div class="vazio">' + L.icone('local', 48) + '<h3>Nenhum endereço salvo</h3>' +
          '<p>Os endereços usados nos seus pedidos aparecem aqui.</p></div>') +
    '</div>';
  }

  /* ------------------------------------------------------------ clube */
  function abaClube() {
    var lista = L.pedidos();
    var gasto = lista.reduce(function (s, p) { return s + p.total; }, 0);
    var economia = gasto * CFG.descontoClube;

    return '<div class="painel"><h2 class="painel__titulo">' +
        L.icone('coracao', 18, true) + ' Clube São Carlos</h2>' +
      '<p style="font-size:14px;color:var(--tinta-700)">Sua assinatura está <strong>ativa</strong> ' +
      'e é gratuita. O preço de clube já aparece aplicado em todas as páginas de produto.</p>' +
      '<div class="numeros" style="margin-top:20px">' +
        '<div class="numero"><b>' + lista.length + '</b><span>pedidos feitos</span></div>' +
        '<div class="numero"><b>' + L.moeda(gasto) + '</b><span>total comprado</span></div>' +
        '<div class="numero"><b>' + L.moeda(economia) + '</b><span>economia estimada</span></div>' +
        '<div class="numero"><b>' + Math.round(CFG.descontoClube * 100) + '%</b><span>desconto máximo</span></div>' +
      '</div>' +
      '<p style="margin-top:20px"><a class="btn btn--contorno" href="institucional.html?p=clube">' +
        'Como funciona o clube</a></p></div>';
  }

  /* ------------------------------------------------------------ logado */
  function telaConta() {
    var c = L.clienteLogado();
    var conteudo = { pedidos: abaPedidos, dados: abaDados, enderecos: abaEnderecos, clube: abaClube };

    return '<div class="layout-conta">' +
      '<nav class="indice" aria-label="Seções da conta">' +
        '<div class="cartao-cliente">' +
          '<span class="cartao-cliente__inicial">' + L.escapar(String(c.nome).charAt(0).toUpperCase()) + '</span>' +
          '<div><b>' + L.escapar(c.nome) + '</b><small>' + L.escapar(c.email) + '</small></div>' +
        '</div>' +
        '<ul>' + ABAS.map(function (a) {
          return '<li><a href="conta.html?aba=' + a[0] + '"' +
            (a[0] === aba ? ' aria-current="page"' : '') + '>' + a[1] + '</a></li>';
        }).join('') + '</ul>' +
        '<button class="btn btn--neutro btn--bloco" type="button" data-sair style="margin-top:12px">Sair</button>' +
      '</nav>' +
      '<div>' + (conteudo[aba] || abaPedidos)() + '</div>' +
    '</div>';
  }

  /* ------------------------------------------------------------ montagem */
  function desenhar() {
    var logado = !!L.clienteLogado() && !recuperacao;
    documento.title = (logado ? 'Minha conta' : 'Entrar') + ' | ' + CFG.nomeLoja;

    documento.getElementById('trilha').innerHTML =
      '<nav class="trilha" aria-label="Você está aqui"><div class="container"><ol>' +
        '<li><a href="index.html">Início</a></li>' +
        '<li aria-current="page">' + (logado ? 'Minha conta' : 'Entrar') + '</li></ol></div></nav>';

    documento.getElementById('conteudo').innerHTML =
      '<div class="container">' +
        '<h1 style="font-size:24px;margin-bottom:20px">' +
          (logado ? 'Minha conta' : 'Entrar ou criar conta') + '</h1>' +
        (logado ? telaConta() : (recuperacao ? telaNovaSenha() : telaEntrada())) +
      '</div>';
  }

  /* ------------------------------------------------------------ auxiliares */
  function valor(id) { return documento.getElementById(id).value.trim(); }

  function ocupado(form, sim) {
    var b = form.querySelector('button[type="submit"]');
    if (b) b.disabled = !!sim;
  }

  function falha(erro) { L.aviso(A.mensagem(erro), 'erro'); }

  /* Validação dos dígitos verificadores do CPF (só no navegador, para evitar
     erro de digitação; a loja não consulta a Receita). */
  function cpfValido(texto) {
    var c = String(texto).replace(/\D/g, '');
    if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
    for (var t = 9; t < 11; t++) {
      var soma = 0;
      for (var i = 0; i < t; i++) soma += Number(c.charAt(i)) * (t + 1 - i);
      var dv = ((soma * 10) % 11) % 10;
      if (dv !== Number(c.charAt(t))) return false;
    }
    return true;
  }

  /* ------------------------------------------------------------ montagem */
  function montar() {
    L.iniciar('conta');
    desenhar();

    /* 1) link do e-mail (confirmação/recuperação)  2) valida a sessão guardada */
    A.processarLink().then(function (r) {
      if (r && r.tipo === 'erro') L.aviso(r.mensagem, 'erro');
      else if (r && r.tipo === 'recovery') recuperacao = true;
      else if (r) L.aviso('E-mail confirmado! Você já está conectado.', 'ok');
      return A.restaurar();
    }).catch(function (erro) { falha(erro); }).then(desenhar);

    documento.addEventListener('submit', function (e) {
      var form = e.target;

      if (form.matches('[data-entrar]')) {
        e.preventDefault();
        ocupado(form, true);
        A.entrar(valor('e-email'), documento.getElementById('e-senha').value).then(function () {
          L.aviso('Bem-vindo de volta!', 'ok');
          janela.location.href = 'conta.html';
        }).catch(function (erro) { falha(erro); ocupado(form, false); });
        return;
      }

      if (form.matches('[data-cadastrar]')) {
        e.preventDefault();
        if (!cpfValido(valor('n-cpf'))) { L.aviso('CPF inválido. Confira os números.', 'erro'); return; }
        ocupado(form, true);
        A.cadastrar({
          nome: valor('n-nome'),
          email: valor('n-email'),
          senha: documento.getElementById('n-senha').value,
          cpf: valor('n-cpf'),
          telefone: valor('n-tel')
        }).then(function (r) {
          if (r.confirmar) {
            L.aviso('Quase lá! Enviamos um link de confirmação para o seu e-mail. Abra-o para ativar a conta.', 'ok');
            form.reset();
            ocupado(form, false);
          } else {
            L.aviso('Conta criada! Você já está no Clube São Carlos.', 'ok');
            janela.location.href = 'conta.html';
          }
        }).catch(function (erro) { falha(erro); ocupado(form, false); });
        return;
      }

      if (form.matches('[data-nova-senha]')) {
        e.preventDefault();
        var s1 = documento.getElementById('ns-1').value;
        if (s1 !== documento.getElementById('ns-2').value) { L.aviso('As senhas não são iguais.', 'erro'); return; }
        ocupado(form, true);
        A.definirSenha(s1).then(function () {
          recuperacao = false;
          L.aviso('Senha atualizada!', 'ok');
          return A.restaurar();
        }).then(desenhar).catch(function (erro) { falha(erro); ocupado(form, false); });
        return;
      }

      if (form.matches('[data-salvar-dados]')) {
        e.preventDefault();
        if (valor('d-cpf') && !cpfValido(valor('d-cpf'))) { L.aviso('CPF inválido. Confira os números.', 'erro'); return; }
        ocupado(form, true);
        A.salvarPerfil({ nome: valor('d-nome'), cpf: valor('d-cpf'), telefone: valor('d-tel') }).then(function () {
          L.aviso('Dados atualizados.', 'ok');
          desenhar();
        }).catch(function (erro) { falha(erro); ocupado(form, false); });
      }
    });

    documento.addEventListener('click', function (e) {
      if (e.target.closest('[data-sair]')) {
        A.sair().then(function () {
          L.aviso('Você saiu da sua conta.');
          janela.location.href = 'index.html';
        });
        return;
      }

      if (e.target.closest('[data-esqueci]')) {
        e.preventDefault();
        var campo = documento.getElementById('e-email');
        if (!campo || !campo.value.trim() || !campo.checkValidity()) {
          L.aviso('Digite seu e-mail no campo acima e clique de novo.', 'erro');
          if (campo) campo.focus();
          return;
        }
        /* resposta igual exista ou não a conta, para não revelar quem é cliente */
        A.recuperar(campo.value.trim()).then(function () {
          L.aviso('Se esse e-mail tiver cadastro, enviamos um link para redefinir a senha.', 'ok');
        }).catch(falha);
        return;
      }

      if (e.target.closest('[data-apagar]')) {
        A.sair().then(function () {
          L.aviso('Você saiu e os dados foram removidos deste navegador.');
          janela.location.href = 'index.html';
        });
        return;
      }

      var det = e.target.closest('[data-detalhe]');
      if (det) {
        var caixa = documento.getElementById('det-' + det.getAttribute('data-detalhe'));
        if (caixa) {
          caixa.hidden = !caixa.hidden;
          det.textContent = caixa.hidden ? 'Ver detalhes' : 'Ocultar detalhes';
        }
        return;
      }

      var re = e.target.closest('[data-recomprar]');
      if (re) {
        var numero = re.getAttribute('data-recomprar');
        var pedido = L.pedidos().filter(function (p) { return p.numero === numero; })[0];
        if (!pedido) return;
        pedido.itens.forEach(function (i) { L.adicionar(i.sku, i.qtd, i.variacao || null); });
      }
    });
  }

  /* espera o DOM e o catálogo (do banco, se configurado) */
  janela.LojaAPI.pronto(montar);
})(window, document);
