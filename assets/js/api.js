/* =========================================================================
   Camada de dados.

   Se `config.supabase` estiver preenchido, o catálogo vem do banco pela API
   REST do Supabase (PostgREST) e substitui, em memória, os dados estáticos de
   dados.js. Sem configuração — ou se a rede falhar — o site segue com o
   catálogo local e nada quebra.

   As páginas continuam lendo `LojaDados` de forma síncrona: quem espera o
   carregamento é `LojaAPI.pronto(callback)`.
   ========================================================================= */
(function (janela, documento) {
  'use strict';

  var D = janela.LojaDados;
  var CFG = D.config;

  /* ------------------------------------------------------------ conversões */
  /* O banco guarda dinheiro em centavos (inteiro). Reais em ponto flutuante
     acumulam erro de arredondamento ao somar um carrinho. */
  function reais(centavos) {
    return centavos === null || centavos === undefined ? null : centavos / 100;
  }

  function mapProduto(r) {
    return {
      sku: r.sku, slug: r.slug, nome: r.nome, marca: r.marca, linha: r.linha,
      categoria: r.categoria_id, subcategoria: r.subcategoria,
      preco: reais(r.preco_centavos),
      precoDe: reais(r.preco_de_centavos),
      precoClube: reais(r.preco_clube_centavos),
      imagem: r.imagem,
      galeria: r.galeria && r.galeria.length ? r.galeria : [r.imagem],
      nota: Number(r.nota),
      qtdAvaliacoes: r.qtd_avaliacoes,
      estoque: r.estoque,
      destaque: r.destaque,
      generico: r.generico,
      receita: r.receita,
      farmaciaPopular: r.farmacia_popular,
      tags: r.tags || [],
      resumo: r.resumo,
      beneficios: r.beneficios || [],
      descricao: r.descricao,
      modoUso: r.modo_uso,
      ingredientes: r.ingredientes,
      especificacoes: r.especificacoes || [],
      avisoLegal: r.aviso_legal,
      variacoes: (r.variacoes || []).map(function (v) {
        var saida = {
          id: v.id, rotulo: v.rotulo, detalhe: v.detalhe,
          preco: reais(v.preco_centavos), precoDe: reais(v.preco_de_centavos)
        };
        /* só a variação padrão carrega a marca, como no catálogo estático */
        if (v.padrao) saida.padrao = true;
        return saida;
      }),
      relacionados: r.relacionados || []
    };
  }

  function mapCategoria(r) { return { id: r.id, nome: r.nome, icone: r.icone }; }

  function mapLoja(r) {
    var l = {
      nome: r.nome, numero: r.numero, cidade: r.cidade, uf: r.uf,
      endereco: r.endereco, horario: r.horario, telefone: r.telefone
    };
    if (r.plantao) l.plantao = true;
    return l;
  }

  function mapServico(r) {
    return { id: r.id, icone: r.icone, titulo: r.titulo, resumo: r.resumo, texto: r.texto };
  }

  function mapFaixa(r) {
    return {
      faixa: [r.cep_inicio, r.cep_fim], uf: r.uf, nome: r.nome,
      base: reais(r.base_centavos), prazo: r.prazo_dias, expresso: r.expresso
    };
  }

  function mapAvaliacao(r) {
    return {
      autor: r.autor_nome, nota: r.nota, data: String(r.criado_em).slice(0, 10),
      titulo: r.titulo, texto: r.texto, verificada: r.verificada
    };
  }

  function mapCupons(linhas) {
    var mapa = {};
    linhas.forEach(function (r) {
      mapa[r.codigo] = { tipo: r.tipo, valor: Number(r.valor), descricao: r.descricao };
      if (r.minimo_centavos) mapa[r.codigo].minimo = reais(r.minimo_centavos);
    });
    return mapa;
  }

  /* ------------------------------------------------------------ transporte */
  function configurado() {
    return !!(CFG.supabase && CFG.supabase.url && CFG.supabase.chave);
  }

  function buscar(caminho) {
    var base = String(CFG.supabase.url).replace(/\/+$/, '');
    return janela.fetch(base + '/rest/v1/' + caminho, {
      headers: {
        apikey: CFG.supabase.chave,
        Authorization: 'Bearer ' + CFG.supabase.chave,
        'Accept-Profile': CFG.supabase.schema || 'farmacia'
      }
    }).then(function (resposta) {
      if (!resposta.ok) throw new Error(caminho + ' respondeu ' + resposta.status);
      return resposta.json();
    });
  }

  /* ------------------------------------------------------------ carga */
  var estado = { origem: 'local', erro: null };

  function aplicar(dados) {
    if (dados.categorias && dados.categorias.length) {
      D.categorias.length = 0;
      dados.categorias.map(mapCategoria).forEach(function (c) { D.categorias.push(c); });
    }
    if (dados.produtos && dados.produtos.length) {
      var avaliacoesPorSku = {};
      (dados.avaliacoes || []).forEach(function (a) {
        (avaliacoesPorSku[a.produto_sku] = avaliacoesPorSku[a.produto_sku] || []).push(mapAvaliacao(a));
      });
      D.produtos.length = 0;
      dados.produtos.map(mapProduto).forEach(function (p) {
        p.avaliacoes = avaliacoesPorSku[p.sku] || [];
        D.produtos.push(p);
      });
    }
    if (dados.lojas && dados.lojas.length) {
      D.lojas.length = 0;
      dados.lojas.map(mapLoja).forEach(function (l) { D.lojas.push(l); });
    }
    if (dados.servicos && dados.servicos.length) {
      D.servicos.length = 0;
      dados.servicos.map(mapServico).forEach(function (s) { D.servicos.push(s); });
    }
    if (dados.faixas && dados.faixas.length) {
      D.regioes.length = 0;
      dados.faixas.map(mapFaixa).forEach(function (f) { D.regioes.push(f); });
    }
    if (dados.cupons && dados.cupons.length) CFG.cupons = mapCupons(dados.cupons);
  }

  var promessa = null;

  function carregar() {
    if (promessa) return promessa;

    if (!configurado()) {
      estado.origem = 'local';
      promessa = janela.Promise.resolve(estado);
      return promessa;
    }

    var pedidos = [
      buscar('categorias?select=*&order=ordem'),
      buscar('produtos?select=*&order=ordem'),
      buscar('lojas?select=*&order=ordem'),
      buscar('servicos?select=*&order=ordem'),
      buscar('faixas_frete?select=*&order=id'),
      buscar('cupons?select=*'),
      buscar('avaliacoes?select=*&order=criado_em.desc')
    ];

    promessa = janela.Promise.all(pedidos).then(function (r) {
      aplicar({
        categorias: r[0], produtos: r[1], lojas: r[2], servicos: r[3],
        faixas: r[4], cupons: r[5], avaliacoes: r[6]
      });
      estado.origem = 'supabase';
      return estado;
    }).catch(function (erro) {
      /* o catálogo local continua em pé; a loja abre mesmo com o banco fora */
      estado.origem = 'local';
      estado.erro = erro.message;
      if (janela.console) janela.console.warn('Catálogo remoto indisponível, usando o local:', erro.message);
      return estado;
    });

    return promessa;
  }

  /* Espera o DOM e o catálogo antes de montar a página. */
  function pronto(callback) {
    function seguir() { carregar().then(callback); }
    if (documento.readyState === 'loading') {
      documento.addEventListener('DOMContentLoaded', seguir);
    } else {
      seguir();
    }
  }

  janela.LojaAPI = {
    pronto: pronto, carregar: carregar, configurado: configurado,
    estado: estado, aplicar: aplicar,
    mapear: {
      produto: mapProduto, categoria: mapCategoria, loja: mapLoja,
      servico: mapServico, faixa: mapFaixa, avaliacao: mapAvaliacao, cupons: mapCupons
    }
  };
})(window, document);
