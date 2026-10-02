/* =========================================================================
   Autenticação com Supabase Auth (GoTrue), por REST — sem biblioteca, no
   mesmo estilo de api.js. Cuida de cadastro, login, renovação de sessão,
   recuperação de senha e do perfil em farmacia.clientes.

   A sessão fica em localStorage (`dsc:sessao`). O perfil é copiado para
   `dsc:cliente` via Loja.entrar(), para que Loja.clienteLogado() continue
   síncrono no cabeçalho e no checkout. Quem protege os dados é o RLS do
   banco, não este arquivo.
   ========================================================================= */
(function (janela, documento) {
  'use strict';

  var D = janela.LojaDados;
  var L = janela.Loja;
  var CFG = D.config;

  var CHAVE_SESSAO = 'dsc:sessao';
  var MARGEM_S = 60;           /* renova o token se faltar menos que isto */
  var memoria = null;          /* reserva se o localStorage estiver bloqueado */
  var renovando = null;

  /* ------------------------------------------------------------ básico */
  function disponivel() {
    return !!(CFG.supabase && CFG.supabase.url && CFG.supabase.chave);
  }
  function raiz() { return String(CFG.supabase.url).replace(/\/+$/, ''); }
  function esquema() { return CFG.supabase.schema || 'farmacia'; }
  function agora() { return Math.floor(Date.now() / 1000); }
  function urlConta() { return new janela.URL('conta.html', janela.location.href).href; }

  function lerSessao() {
    try {
      var bruto = janela.localStorage.getItem(CHAVE_SESSAO);
      if (bruto) return JSON.parse(bruto);
    } catch (e) { /* modo privado */ }
    return memoria;
  }

  function gravarSessao(s) {
    memoria = s;
    try {
      if (s) janela.localStorage.setItem(CHAVE_SESSAO, JSON.stringify(s));
      else janela.localStorage.removeItem(CHAVE_SESSAO);
    } catch (e) { /* modo privado */ }
  }

  function sessaoDe(r) {
    var u = r.user || {};
    var meta = u.user_metadata || {};
    return {
      token: r.access_token,
      refresh: r.refresh_token,
      expira: r.expires_at || (agora() + Number(r.expires_in || 3600)),
      uid: u.id,
      email: u.email || '',
      nome: meta.nome || ''
    };
  }

  /* ------------------------------------------------------------ erros */
  var MENSAGENS = {
    invalid_credentials: 'E-mail ou senha incorretos.',
    email_not_confirmed: 'Confirme seu e-mail antes de entrar: enviamos um link para a sua caixa de entrada.',
    user_already_exists: 'Já existe uma conta com este e-mail. Tente entrar ou recuperar a senha.',
    email_exists: 'Já existe uma conta com este e-mail. Tente entrar ou recuperar a senha.',
    weak_password: 'Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.',
    same_password: 'A nova senha precisa ser diferente da atual.',
    over_email_send_rate_limit: 'Muitos e-mails enviados em pouco tempo. Aguarde alguns minutos e tente de novo.',
    over_request_rate_limit: 'Muitas tentativas. Aguarde um pouco e tente de novo.',
    signup_disabled: 'Os cadastros estão desativados no momento.',
    email_address_invalid: 'Esse e-mail não parece válido.',
    validation_failed: 'Confira os dados informados.',
    otp_expired: 'O link expirou ou já foi usado. Peça um novo.',
    rede: 'Sem conexão com o servidor. Verifique a internet e tente de novo.'
  };

  function mensagem(erro) {
    if (erro && erro.codigo && MENSAGENS[erro.codigo]) return MENSAGENS[erro.codigo];
    if (erro && erro.status === 429) return MENSAGENS.over_request_rate_limit;
    return 'Não foi possível concluir agora. Tente novamente em instantes.';
  }

  /* ------------------------------------------------------------ transporte */
  /* opcoes: metodo, corpo, token (JWT do usuário), perfil (schema farmacia),
     prefer. Sem token, só vai o `apikey`: a chave publicável não é um JWT e
     não deve ir em Authorization. */
  function chamar(caminho, opcoes) {
    opcoes = opcoes || {};
    var cab = { apikey: CFG.supabase.chave, 'Content-Type': 'application/json' };
    if (opcoes.token) cab.Authorization = 'Bearer ' + opcoes.token;
    if (opcoes.perfil) { cab['Accept-Profile'] = esquema(); cab['Content-Profile'] = esquema(); }
    if (opcoes.prefer) cab.Prefer = opcoes.prefer;

    return janela.fetch(raiz() + caminho, {
      method: opcoes.metodo || 'GET',
      headers: cab,
      body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined
    }).catch(function () {
      var e = new Error('rede'); e.codigo = 'rede'; throw e;
    }).then(function (resp) {
      return resp.text().then(function (texto) {
        var json = null;
        try { json = texto ? JSON.parse(texto) : null; } catch (e) { /* corpo vazio */ }
        if (!resp.ok) {
          var erro = new Error((json && (json.msg || json.message || json.error_description)) || ('HTTP ' + resp.status));
          erro.status = resp.status;
          erro.codigo = json && (json.error_code || (json.error_description === 'Invalid login credentials' ? 'invalid_credentials' : null));
          throw erro;
        }
        return json;
      });
    });
  }

  /* ------------------------------------------------------------ sessão */
  function semSessao() { var e = new Error('sem sessão'); e.codigo = 'sem_sessao'; return e; }

  /* Devolve a sessão com token válido, renovando se estiver perto de vencer.
     Uma só renovação por vez: o refresh token é de uso único. */
  function sessaoValida() {
    var s = lerSessao();
    if (!s) return Promise.reject(semSessao());
    if (s.expira - agora() > MARGEM_S) return Promise.resolve(s);
    if (renovando) return renovando;

    renovando = chamar('/auth/v1/token?grant_type=refresh_token', {
      metodo: 'POST', corpo: { refresh_token: s.refresh }
    }).then(function (r) {
      var nova = sessaoDe(r);
      gravarSessao(nova);
      return nova;
    }).catch(function (e) {
      if (e.status === 400 || e.status === 401 || e.status === 403) gravarSessao(null);
      throw e;
    }).then(function (v) { renovando = null; return v; },
            function (e) { renovando = null; throw e; });
    return renovando;
  }

  /* Token para chamar APIs como o cliente (ex.: a função que cria pedidos). */
  function token() { return sessaoValida().then(function (s) { return s.token; }); }

  /* ------------------------------------------------------------ perfil */
  function carregarPerfil(sessao) {
    return chamar('/rest/v1/clientes?select=nome,email,cpf,telefone,clube&id=eq.' + encodeURIComponent(sessao.uid),
      { token: sessao.token, perfil: true }
    ).catch(function (e) {
      if (janela.console) janela.console.warn('Perfil indisponível, usando os dados do login:', e.message);
      return [];
    }).then(function (linhas) {
      var p = (linhas && linhas[0]) || {};
      var cliente = {
        nome: p.nome || sessao.nome || String(sessao.email).split('@')[0],
        email: p.email || sessao.email,
        cpf: p.cpf || '',
        telefone: p.telefone || '',
        clube: p.clube !== false
      };
      L.entrar(cliente);
      return cliente;
    });
  }

  function salvarPerfil(dados) {
    return sessaoValida().then(function (s) {
      return chamar('/rest/v1/clientes?id=eq.' + encodeURIComponent(s.uid), {
        metodo: 'PATCH', token: s.token, perfil: true, prefer: 'return=representation',
        corpo: { nome: dados.nome, cpf: dados.cpf, telefone: dados.telefone }
      }).then(function (linhas) {
        if (!linhas || !linhas.length) throw new Error('Perfil não encontrado.');
        return carregarPerfil(s);
      });
    });
  }

  /* ------------------------------------------------------------ ações */
  function cadastrar(d) {
    return chamar('/auth/v1/signup?redirect_to=' + encodeURIComponent(urlConta()), {
      metodo: 'POST',
      corpo: { email: d.email, password: d.senha, data: { nome: d.nome, cpf: d.cpf, telefone: d.telefone } }
    }).then(function (r) {
      /* Com "Confirm email" ligado não vem sessão: o cliente confirma pelo e-mail. */
      if (r && r.access_token) {
        var s = sessaoDe(r);
        gravarSessao(s);
        return carregarPerfil(s).then(function (c) { return { confirmar: false, cliente: c }; });
      }
      return { confirmar: true };
    });
  }

  function entrar(email, senha) {
    return chamar('/auth/v1/token?grant_type=password', {
      metodo: 'POST', corpo: { email: email, password: senha }
    }).then(function (r) {
      var s = sessaoDe(r);
      gravarSessao(s);
      return carregarPerfil(s);
    });
  }

  function recuperar(email) {
    return chamar('/auth/v1/recover?redirect_to=' + encodeURIComponent(urlConta()), {
      metodo: 'POST', corpo: { email: email }
    });
  }

  function definirSenha(senha) {
    return sessaoValida().then(function (s) {
      return chamar('/auth/v1/user', { metodo: 'PUT', token: s.token, corpo: { password: senha } });
    });
  }

  function sair() {
    var s = lerSessao();
    gravarSessao(null);
    L.sair();
    if (!s) return Promise.resolve();
    return chamar('/auth/v1/logout', { metodo: 'POST', token: s.token }).catch(function () { /* já saiu aqui */ });
  }

  /* Valida a sessão guardada e atualiza o perfil. Sem sessão, derruba também
     o cache `dsc:cliente` (inclusive o login falso da versão de demonstração). */
  function restaurar() {
    if (!lerSessao()) { L.sair(); return Promise.resolve(null); }
    return sessaoValida().then(carregarPerfil).catch(function () {
      if (!lerSessao()) L.sair();
      return L.clienteLogado();
    });
  }

  /* O link do e-mail (confirmação ou recuperação) volta para conta.html com a
     sessão no fragmento da URL (#access_token=...&type=recovery). */
  function limparHash() {
    try { janela.history.replaceState(null, '', janela.location.pathname + janela.location.search); } catch (e) { /* ok */ }
  }

  function processarLink() {
    var h = janela.location.hash;
    if (!h || h.length < 2) return Promise.resolve(null);
    var p = new janela.URLSearchParams(h.slice(1));

    if (p.get('error') || p.get('error_code')) {
      var cod = p.get('error_code');
      limparHash();
      return Promise.resolve({ tipo: 'erro', mensagem: MENSAGENS[cod] || 'Link inválido ou expirado. Peça um novo.' });
    }
    if (!p.get('access_token') || !p.get('refresh_token')) return Promise.resolve(null);

    var tk = p.get('access_token');
    var rf = p.get('refresh_token');
    var tipo = p.get('type') || '';
    var expira = Number(p.get('expires_at')) || (agora() + Number(p.get('expires_in') || 3600));
    limparHash();

    return chamar('/auth/v1/user', { token: tk }).then(function (u) {
      gravarSessao({ token: tk, refresh: rf, expira: expira, uid: u.id, email: u.email || '',
                     nome: (u.user_metadata && u.user_metadata.nome) || '' });
      return { tipo: tipo };
    });
  }

  janela.LojaAuth = {
    disponivel: disponivel, mensagem: mensagem,
    cadastrar: cadastrar, entrar: entrar, sair: sair,
    recuperar: recuperar, definirSenha: definirSenha,
    salvarPerfil: salvarPerfil, restaurar: restaurar, processarLink: processarLink,
    token: token
  };
})(window, document);
