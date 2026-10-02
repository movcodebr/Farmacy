/* =========================================================================
   Páginas institucionais, ajuda e políticas — conteúdo por ?p=
   ========================================================================= */
(function (janela, documento) {
  'use strict';

  var D = janela.LojaDados;
  var L = janela.Loja;
  var CFG = D.config;

  function construirFAQ() { return [
    ['Vocês entregam em casa?',
     'Sim. Hoje a entrega é pedida pelo Disk Entrega no WhatsApp ' + CFG.whatsapp +
     ', com número exclusivo para Ribeirão Preto. Com a loja online, o mesmo pedido passa a ' +
     'poder ser fechado pelo próprio cliente, a qualquer hora, com o frete calculado pelo CEP.'],
    ['Qual o prazo de entrega?',
     'Nas cidades onde a rede tem loja, a entrega expressa chega em até 2 horas. ' +
     'Para os demais CEPs, a entrega padrão leva de 2 a 9 dias úteis. ' +
     'O prazo exato aparece na página do produto assim que você informa o CEP.'],
    ['Como funciona o frete grátis?',
     'Pedidos a partir de ' + L.moeda(CFG.freteGratisAcima) + ' têm frete grátis na modalidade padrão. ' +
     'A entrega expressa continua sendo cobrada à parte.'],
    ['Posso retirar o pedido em uma loja?',
     'Sim, e a retirada é sempre gratuita. Com ' + CFG.totalLojas + ' unidades em ' +
     CFG.cidades.length + ' cidades, quase sempre há uma loja perto de você. ' +
     'Escolha "Retirar na loja mais próxima" no carrinho.'],
    ['Como funciona a Farmácia Popular?',
     'O programa do Ministério da Saúde oferece medicamentos gratuitos para hipertensão, ' +
     'diabetes e asma, e com desconto para outras condições. Leve documento com foto, CPF e a ' +
     'receita médica dentro da validade até uma das lojas credenciadas. ' +
     '<a href="institucional.html?p=farmacia-popular">Veja os detalhes</a>.'],
    ['Vocês vendem medicamentos com receita?',
     'Medicamentos sujeitos a prescrição exigem a apresentação da receita válida e são ' +
     'dispensados na loja, com orientação do farmacêutico. Pelo site trabalhamos com ' +
     'medicamentos isentos de prescrição, dermocosméticos, suplementos e higiene.'],
    ['Quais as formas de pagamento?',
     'PIX (com 5% de desconto), cartão de crédito em até ' + CFG.parcelasMax + 'x sem juros e ' +
     'boleto bancário. O parcelamento respeita a parcela mínima de ' + L.moeda(CFG.parcelaMinima) + '.'],
    ['Posso trocar ou devolver um produto?',
     'Sim. São 7 dias corridos a partir do recebimento para desistir da compra, conforme o ' +
     'Código de Defesa do Consumidor. Por segurança sanitária, medicamentos e produtos de ' +
     'higiene só são aceitos de volta com a embalagem lacrada e intacta.']
  ]; }

  /* --------------------------------------------------------------------- */
  /* construído sob demanda: no carregamento do script o catálogo ainda
     pode não ter chegado do banco */
  function construirPaginas() { var FAQ = construirFAQ(); return {
    'quem-somos': {
      titulo: 'Quem somos',
      resumo: 'Mais de 50 anos cuidando da saúde no interior paulista.',
      corpo:
        '<p>A Drogaria São Carlos começou em <strong>' + CFG.fundacao + '</strong>, pelas mãos de ' +
        CFG.fundador + '. De uma farmácia de bairro, a rede cresceu para ' +
        '<strong>' + CFG.totalLojas + ' lojas</strong> distribuídas em ' +
        CFG.cidades.slice(0, -1).join(', ') + ' e ' + CFG.cidades[CFG.cidades.length - 1] + '.</p>' +
        '<p>Em mais de cinco décadas, a receita não mudou: atendimento próximo, farmacêutico ' +
        'disponível para orientar e um mix que vai do genérico de todo dia ao dermocosmético, ' +
        'com mais de 3.000 medicamentos de marca e genéricos à disposição.</p>' +
        '<h2>A rede hoje</h2>' +
        '<div class="numeros">' +
          '<div class="numero"><b>' + CFG.fundacao + '</b><span>ano de fundação</span></div>' +
          '<div class="numero"><b>' + (new Date().getFullYear() - CFG.fundacao) + '</b><span>anos de estrada</span></div>' +
          '<div class="numero"><b>' + CFG.totalLojas + '</b><span>lojas</span></div>' +
          '<div class="numero"><b>' + CFG.cidades.length + '</b><span>cidades atendidas</span></div>' +
        '</div>' +
        '<h2>O que oferecemos além do balcão</h2>' +
        '<ul>' + D.servicos.map(function (s) {
          return '<li><strong>' + L.escapar(s.titulo) + '</strong> — ' +
            L.escapar(s.resumo).replace(/\.$/, '') + '.</li>';
        }).join('') + '</ul>' +
        '<p><a href="institucional.html?p=servicos">Ver os serviços em detalhe</a></p>' +
        '<p><a class="btn btn--principal" href="institucional.html?p=lojas">Ver as lojas</a></p>'
    },

    'lojas': {
      titulo: 'Nossas lojas',
      resumo: D.lojas.length + ' unidades em ' + CFG.cidades.length + ' cidades do interior paulista.',
      corpo: (function () {
        var porCidade = {};
        D.lojas.forEach(function (l) { porCidade[l.cidade] = (porCidade[l.cidade] || 0) + 1; });
        var plantao = D.lojas.filter(function (l) { return l.plantao; });

        return '<div class="filtro-cidades">' +
            '<button class="ficha-ativa" type="button" data-cidade="" aria-pressed="true">' +
              'Todas <span class="contagem">' + D.lojas.length + '</span></button>' +
            CFG.cidades.map(function (c) {
              return '<button class="ficha-ativa" type="button" data-cidade="' + L.escapar(c) +
                '" aria-pressed="false">' + L.escapar(c) +
                ' <span class="contagem">' + (porCidade[c] || 0) + '</span></button>';
            }).join('') +
          '</div>' +

          (plantao.length
            ? '<p class="dica" style="margin-bottom:16px">' + L.icone('relogio', 14) + ' <strong>' +
              plantao.length + ' unidades abrem 24 horas:</strong> ' +
              plantao.map(function (l) { return L.escapar(l.nome + ' (' + l.cidade + ')'); }).join(' e ') +
              '.</p>'
            : '') +

          '<div class="grade-lojas" id="grade-lojas">' + D.lojas.map(function (l) {
            var busca = encodeURIComponent(l.endereco + ', ' + l.cidade + ' - ' + l.uf);
            return '<article class="cartao-loja" data-cidade-loja="' + L.escapar(l.cidade) + '">' +
              '<h2>' + L.escapar(l.nome) +
                (l.numero ? ' <small style="font-weight:600;color:var(--tinta-500)">' +
                  L.escapar(l.numero) + '</small>' : '') + '</h2>' +
              (l.plantao ? '<span class="selo selo--oferta" style="align-self:flex-start">24 horas</span>' : '') +
              '<p class="cartao-loja__linha">' + L.icone('local', 15) + ' ' +
                L.escapar(l.endereco) + ' — ' + L.escapar(l.cidade + '/' + l.uf) + '</p>' +
              '<p class="cartao-loja__linha">' + L.icone('relogio', 15) + ' ' +
                L.escapar(l.horario) + '</p>' +
              (l.telefone
                ? '<p class="cartao-loja__linha">' + L.icone('chat', 15) + ' ' +
                  L.escapar(l.telefone) + '</p>'
                : '') +
              '<a class="btn btn--contorno" href="https://www.google.com/maps/search/?api=1&query=' +
                busca + '" rel="noopener">Como chegar</a>' +
            '</article>';
          }).join('') + '</div>';
      })()
    },

    'servicos': {
      titulo: 'Serviços',
      resumo: 'O que a rede faz além de vender medicamento.',
      corpo:
        '<div class="grade-lojas">' + D.servicos.map(function (s) {
          return '<article class="cartao-loja" id="' + s.id + '">' +
            '<span class="servico-icone">' + L.icone(s.icone, 22) + '</span>' +
            '<h2>' + L.escapar(s.titulo) + '</h2>' +
            '<p style="font-size:13.5px;color:var(--tinta-700)">' + L.escapar(s.texto) + '</p>' +
          '</article>';
        }).join('') + '</div>' +
        '<h2>Agendar um serviço</h2>' +
        '<p>Escolha a unidade e o serviço e a equipe confirma o horário com você.</p>' +
        '<form class="form-avaliacao" style="max-width:520px" data-contato>' +
          '<div><label for="ag-servico">Serviço</label>' +
            '<select id="ag-servico" style="width:100%;border:1.5px solid var(--linha);border-radius:8px;padding:10px 12px">' +
            D.servicos.filter(function (s) { return s.id !== 'entrega'; })
              .map(function (s) { return '<option>' + L.escapar(s.titulo) + '</option>'; }).join('') +
            '</select></div>' +
          '<div><label for="ag-loja">Unidade</label>' +
            '<select id="ag-loja" style="width:100%;border:1.5px solid var(--linha);border-radius:8px;padding:10px 12px">' +
            D.lojas.map(function (l) {
              return '<option>' + L.escapar(l.nome + ' — ' + l.cidade) + '</option>';
            }).join('') + '</select></div>' +
          '<div><label for="ag-nome">Seu nome</label><input id="ag-nome" required></div>' +
          '<div><label for="ag-tel">Telefone com DDD</label><input id="ag-tel" required></div>' +
          '<button class="btn btn--principal" type="submit" style="justify-self:start">Pedir agendamento</button>' +
        '</form>' +
        '<div class="aviso-legal"><strong>Importante</strong>Os serviços farmacêuticos são de ' +
        'acompanhamento e orientação. Não substituem consulta médica, diagnóstico nem exame ' +
        'laboratorial.</div>'
    },

    'farmacia-popular': {
      titulo: 'Farmácia Popular',
      resumo: 'Medicamentos gratuitos ou com desconto pelo programa do Ministério da Saúde.',
      corpo:
        '<p>A Drogaria São Carlos é credenciada ao <strong>Farmácia Popular</strong>, programa do ' +
        'Ministério da Saúde que garante medicamentos gratuitos ou com desconto em farmácias ' +
        'privadas.</p>' +
        '<h2>O que o programa cobre</h2>' +
        '<table class="tabela-specs"><tbody>' +
          '<tr><th scope="row">Gratuitos</th><td>Medicamentos para hipertensão, diabetes e asma.</td></tr>' +
          '<tr><th scope="row">Com desconto</th><td>Tratamentos para dislipidemia, osteoporose, ' +
            'rinite, glaucoma, doença de Parkinson e anticoncepcionais.</td></tr>' +
        '</tbody></table>' +
        '<h2>O que levar</h2>' +
        '<ul>' +
        '<li>Documento oficial com foto.</li>' +
        '<li>CPF do paciente.</li>' +
        '<li>Receita médica dentro da validade, com nome do paciente e do prescritor.</li>' +
        '</ul>' +
        '<p>A retirada é feita na loja, com o farmacêutico. Traga a receita mesmo para os ' +
        'medicamentos gratuitos — ela é exigida pelo programa.</p>' +
        '<div class="aviso-legal"><strong>Confira antes de ir</strong>A lista de medicamentos e as ' +
        'regras do programa são definidas pelo Ministério da Saúde e mudam periodicamente. ' +
        'Consulte a unidade mais próxima ou os canais oficiais do programa para confirmar a ' +
        'cobertura do seu caso.</div>' +
        '<p><a class="btn btn--principal" href="institucional.html?p=lojas">Encontrar uma loja</a></p>'
    },

    'clube': {
      titulo: 'Clube São Carlos',
      resumo: 'Programa de fidelidade proposto: desconto em todo o site, sem mensalidade.',
      corpo:
        '<div class="aviso-legal"><strong>Proposta, ainda não é um programa existente</strong>' +
        'O Clube São Carlos é uma sugestão desta proposta, não um programa em operação hoje. ' +
        'Nome, percentual de desconto e regras são pontos a definir com a rede.</div>' +
        '<p>A ideia é simples: o cliente cadastra o CPF e passa a pagar o preço de clube, ' +
        'exibido ao lado do preço normal em todas as páginas — sem exigir login para ser visto.</p>' +
        '<h2>Por que vale para a rede</h2>' +
        '<ul>' +
        '<li><strong>Liga a loja física à online.</strong> O mesmo CPF identifica a compra no ' +
          'balcão e no site, e o histórico passa a ser um só.</li>' +
        '<li><strong>Lembrete de recompra.</strong> Quem usa medicamento contínuo recebe um aviso ' +
          'no ritmo da receita, o que reduz o abandono de tratamento e traz o cliente de volta.</li>' +
        '<li><strong>Base própria.</strong> Em vez de depender de marketplace, a rede fala direto ' +
          'com quem já compra.</li>' +
        '</ul>' +
        '<h2>Cuidado com os dados</h2>' +
        '<p>Histórico de compra de medicamento é dado sensível de saúde pela LGPD. ' +
        'O programa precisa nascer com finalidade declarada, consentimento para os lembretes e ' +
        'exclusão a pedido — nada de compartilhar com anunciante, seguradora ou plano de saúde. ' +
        'Isso está previsto na <a href="institucional.html?p=privacidade">política de privacidade</a>.</p>'
    },

    'atendimento': {
      titulo: 'Central de atendimento',
      resumo: 'Disk Entrega, telefone e atendimento farmacêutico.',
      corpo:
        '<div class="grade-lojas">' +
          '<article class="cartao-loja destaque-zap"><h2>Disk Entrega</h2>' +
            '<p class="cartao-loja__linha">' + L.icone('chat', 15) + ' <strong>' + CFG.whatsapp + '</strong></p>' +
            '<p>Peça pelo WhatsApp e receba em casa. Número exclusivo para Ribeirão Preto.</p>' +
            '<a class="btn btn--principal" href="' + CFG.whatsappLink + '" rel="noopener">Chamar no WhatsApp</a>' +
          '</article>' +
          '<article class="cartao-loja"><h2>Atendimento 24 horas</h2>' +
            '<p class="cartao-loja__linha">' + L.icone('relogio', 15) + ' Unidades de plantão</p>' +
            '<p>Parte da rede opera em regime de plantão. Confira quais unidades na ' +
            '<a href="institucional.html?p=lojas">página de lojas</a>.</p></article>' +
          '<article class="cartao-loja"><h2>Orientação farmacêutica</h2>' +
            '<p class="cartao-loja__linha">' + L.icone('escudo', 15) + ' Gratuita, nas lojas</p>' +
            '<p>Dúvidas sobre posologia, interações e uso de medicamentos isentos de prescrição. ' +
            'Não substitui consulta médica.</p></article>' +
          '<article class="cartao-loja"><h2>Farmacovigilância</h2>' +
            '<p class="cartao-loja__linha">' + L.icone('escudo', 15) + ' Reação adversa</p>' +
            '<p>Se você teve uma reação inesperada a um medicamento, avise a equipe. ' +
            'O caso é registrado e notificado à ANVISA.</p></article>' +
        '</div>' +
        '<h2>Prefere que a gente ligue?</h2>' +
        '<form class="form-avaliacao" style="max-width:520px" data-contato>' +
          '<div><label for="ct-nome">Seu nome</label><input id="ct-nome" required></div>' +
          '<div><label for="ct-tel">Telefone com DDD</label><input id="ct-tel" required></div>' +
          '<div><label for="ct-msg">Como podemos ajudar?</label><textarea id="ct-msg" required></textarea></div>' +
          '<button class="btn btn--principal" type="submit" style="justify-self:start">Solicitar contato</button>' +
        '</form>'
    },

    'entregas': {
      titulo: 'Prazos e entregas',
      resumo: 'Do Disk Entrega no WhatsApp ao pedido fechado sozinho pelo site.',
      corpo:
        '<h2>Modalidades</h2>' +
        '<table class="tabela-specs"><tbody>' +
          '<tr><th scope="row">Entrega expressa</th><td>Em até 2 horas nas cidades onde a rede ' +
            'tem loja. Pedidos após as 20h saem no dia seguinte, exceto pelas unidades 24h.</td></tr>' +
          '<tr><th scope="row">Entrega padrão</th><td>De 2 a 9 dias úteis conforme a região. ' +
            'Grátis acima de ' + L.moeda(CFG.freteGratisAcima) + '.</td></tr>' +
          '<tr><th scope="row">Retirada em loja</th><td>Sempre gratuita, em qualquer uma das ' +
            CFG.totalLojas + ' unidades. Pronto em até 4 horas.</td></tr>' +
          '<tr><th scope="row">Disk Entrega</th><td>Pelo WhatsApp ' + CFG.whatsapp +
            ', exclusivo para Ribeirão Preto.</td></tr>' +
        '</tbody></table>' +
        '<h2>Acompanhamento</h2>' +
        '<p>Assim que o pedido é despachado, o código de rastreio vai por e-mail. ' +
        'Você também acompanha tudo em <a href="conta.html">Meus pedidos</a>.</p>' +
        '<h2>Cuidados no transporte</h2>' +
        '<p>Medicamentos termossensíveis viajam em embalagem térmica com controle de temperatura. ' +
        'Itens de uso contínuo vão em sacola lacrada e identificada.</p>' +
        '<div class="aviso-legal"><strong>Importante</strong>A entrega é feita ao morador do ' +
        'endereço informado, mediante conferência. Medicamentos não são deixados com porteiro ' +
        'sem autorização prévia.</div>'
    },

    'trocas': {
      titulo: 'Trocas e devoluções',
      resumo: 'Seus direitos e o que a legislação sanitária permite.',
      corpo:
        '<h2>Arrependimento em 7 dias</h2>' +
        '<p>Conforme o artigo 49 do Código de Defesa do Consumidor, você pode desistir de uma compra feita ' +
        'pela internet em até 7 dias corridos contados do recebimento, sem precisar justificar. ' +
        'Devolvemos o valor integral, incluindo o frete.</p>' +
        '<h2>Restrições sanitárias</h2>' +
        '<p>Por determinação da ANVISA, medicamentos, produtos de higiene pessoal e cosméticos só podem ' +
        'retornar ao estoque se a embalagem estiver <strong>lacrada e intacta</strong>. ' +
        'Itens abertos não podem ser aceitos de volta, mesmo dentro do prazo de arrependimento.</p>' +
        '<h2>Produto com defeito ou avaria</h2>' +
        '<p>Se o item chegou danificado, com validade vencida ou diferente do pedido, avise-nos em até 30 dias. ' +
        'Trocamos ou estornamos o valor sem custo, e a coleta é por nossa conta.</p>' +
        '<h2>Como solicitar</h2>' +
        '<p>Abra a solicitação em <a href="conta.html">Meus pedidos</a> ou ligue para ' + CFG.telefone + '. ' +
        'O estorno aparece em até duas faturas no cartão, ou em até 5 dias úteis no caso do PIX.</p>'
    },

    'faq': {
      titulo: 'Perguntas frequentes',
      resumo: 'As dúvidas que mais chegam ao nosso atendimento.',
      corpo: '<div class="acordeao">' + FAQ.map(function (par, i) {
        return '<div class="acordeao__item">' +
          '<button class="acordeao__titulo" type="button" aria-expanded="false" aria-controls="faq-' + i + '">' +
            '<span>' + L.escapar(par[0]) + '</span>' + L.icone('seta_baixo', 18) + '</button>' +
          '<div class="acordeao__corpo" id="faq-' + i + '" hidden><p>' + par[1] + '</p></div>' +
        '</div>';
      }).join('') + '</div>'
    },

    'privacidade': {
      titulo: 'Política de privacidade',
      resumo: 'Quais dados coletamos, por quê, e o que você pode exigir de nós.',
      corpo:
        '<p class="miudos">Última atualização: 20 de setembro de 2026.</p>' +
        '<h2>Dados que coletamos</h2>' +
        '<ul>' +
        '<li><strong>Cadastro:</strong> nome, CPF, e-mail, telefone e endereço de entrega.</li>' +
        '<li><strong>Compras:</strong> itens adquiridos, valores e forma de pagamento.</li>' +
        '<li><strong>Navegação:</strong> páginas visitadas e produtos vistos, para recomendar itens relevantes.</li>' +
        '</ul>' +
        '<h2>Dados sensíveis</h2>' +
        '<p>O histórico de compra de medicamentos é dado pessoal sensível de saúde, conforme o artigo 5º, II ' +
        'da LGPD. Tratamos essa informação apenas para executar a venda, cumprir obrigações sanitárias ' +
        'e oferecer lembretes de recompra que você pode desativar a qualquer momento. ' +
        '<strong>Não compartilhamos histórico de saúde com anunciantes, seguradoras ou planos de saúde.</strong></p>' +
        '<h2>Com quem compartilhamos</h2>' +
        '<p>Apenas com quem é indispensável para a entrega: transportadora, meio de pagamento e, ' +
        'quando exigido, autoridades sanitárias. Todos operam sob contrato com cláusula de confidencialidade.</p>' +
        '<h2>Por quanto tempo guardamos</h2>' +
        '<p>Dados fiscais ficam retidos por 5 anos, por exigência legal. ' +
        'Dados de navegação são descartados em 12 meses. O restante é apagado quando você pede a exclusão.</p>' +
        '<h2>Seus direitos</h2>' +
        '<p>Você pode pedir acesso, correção, portabilidade ou exclusão dos seus dados pelo ' +
        '<a href="institucional.html?p=lgpd">portal do titular</a>. Respondemos em até 15 dias.</p>'
    },

    'termos': {
      titulo: 'Termos de uso',
      resumo: 'As regras para comprar e usar este site.',
      corpo:
        '<p class="miudos">Última atualização: 20 de setembro de 2026.</p>' +
        '<h2>1. Quem pode comprar</h2>' +
        '<p>É preciso ter 18 anos ou mais e capacidade civil. Pedidos com dados incorretos ou ' +
        'indício de fraude podem ser cancelados, com estorno integral.</p>' +
        '<h2>2. Preços e disponibilidade</h2>' +
        '<p>Preços e estoques valem apenas para o site e podem diferir das lojas físicas. ' +
        'Em caso de erro evidente de preço, entramos em contato antes de faturar e você decide se mantém o pedido.</p>' +
        '<h2>3. Medicamentos</h2>' +
        '<p>Vendemos pelo site apenas medicamentos isentos de prescrição. ' +
        'As informações desta loja não substituem a bula nem a orientação de um profissional de saúde.</p>' +
        '<h2>4. Conteúdo do site</h2>' +
        '<p>Textos, imagens e a identidade visual desta loja são de sua titularidade. ' +
        'As informações técnicas dos produtos seguem o que o fabricante declara.</p>' +
        '<h2>5. Foro</h2>' +
        '<p>Fica eleito o foro da comarca de São Paulo/SP para dirimir eventuais controvérsias.</p>'
    },

    'cookies': {
      titulo: 'Política de cookies',
      resumo: 'O que guardamos no seu navegador e como desligar.',
      corpo:
        '<h2>Tipos de cookie</h2>' +
        '<table class="tabela-specs"><tbody>' +
          '<tr><th scope="row">Essenciais</th><td>Mantêm seu carrinho, sua sessão e o CEP informado. ' +
            'Sem eles o site não funciona, e por isso não podem ser desativados.</td></tr>' +
          '<tr><th scope="row">Preferências</th><td>Lembram favoritos e produtos vistos recentemente.</td></tr>' +
          '<tr><th scope="row">Analíticos</th><td>Medem quais páginas são mais usadas, de forma agregada.</td></tr>' +
          '<tr><th scope="row">Publicidade</th><td>Não utilizamos cookies de publicidade comportamental.</td></tr>' +
        '</tbody></table>' +
        '<h2>Como desativar</h2>' +
        '<p>Você pode bloquear cookies nas configurações do seu navegador. ' +
        'Bloqueando os essenciais, o carrinho deixa de funcionar entre páginas.</p>' +
        '<div class="aviso-legal"><strong>Nesta demonstração</strong>Nenhum dado sai do seu navegador. ' +
        'Carrinho, favoritos e sessão ficam apenas no <code>localStorage</code> local, ' +
        'e não há rastreamento de terceiros.</div>'
    },

    'lgpd': {
      titulo: 'Portal do titular (LGPD)',
      resumo: 'Exerça seus direitos sobre os dados que temos a seu respeito.',
      corpo:
        '<p>A Lei Geral de Proteção de Dados garante a você uma série de direitos sobre seus dados pessoais. ' +
        'Use o formulário abaixo para exercê-los — respondemos em até 15 dias, sem custo.</p>' +
        '<h2>O que você pode pedir</h2>' +
        '<ul>' +
        '<li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e receber uma cópia.</li>' +
        '<li><strong>Correção:</strong> atualizar dados incompletos ou desatualizados.</li>' +
        '<li><strong>Portabilidade:</strong> receber seus dados em formato aberto.</li>' +
        '<li><strong>Eliminação:</strong> apagar dados tratados com base no seu consentimento.</li>' +
        '<li><strong>Revogação:</strong> retirar o consentimento a qualquer momento.</li>' +
        '</ul>' +
        '<form class="form-avaliacao" style="max-width:520px" data-contato>' +
          '<div><label for="lg-nome">Nome completo</label><input id="lg-nome" required></div>' +
          '<div><label for="lg-cpf">CPF</label><input id="lg-cpf" required></div>' +
          '<div><label for="lg-tipo">Que direito deseja exercer?</label>' +
            '<select id="lg-tipo" style="width:100%;border:1.5px solid var(--linha);border-radius:8px;padding:10px 12px">' +
            '<option>Confirmação e acesso</option><option>Correção</option><option>Portabilidade</option>' +
            '<option>Eliminação</option><option>Revogação do consentimento</option></select></div>' +
          '<div><label for="lg-msg">Detalhes do pedido</label><textarea id="lg-msg"></textarea></div>' +
          '<button class="btn btn--principal" type="submit" style="justify-self:start">Enviar solicitação</button>' +
        '</form>' +
        '<p class="miudos">Encarregado de dados (DPO): privacidade@drogariasaocarlos.com.br</p>'
    }
  }; }

  /* --------------------------------------------------------------------- */
  function montar() {
    var chave = new janela.URLSearchParams(janela.location.search).get('p') || 'quem-somos';
    var PAGINAS = construirPaginas();
    var pagina = PAGINAS[chave] || PAGINAS['quem-somos'];

    L.iniciar('institucional');
    documento.title = pagina.titulo + ' | ' + CFG.nomeLoja;

    var meta = documento.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', pagina.resumo);

    documento.getElementById('trilha').innerHTML =
      '<nav class="trilha" aria-label="Você está aqui"><div class="container"><ol>' +
        '<li><a href="index.html">Início</a></li>' +
        '<li aria-current="page">' + L.escapar(pagina.titulo) + '</li></ol></div></nav>';

    var atalhos = [
      ['quem-somos', 'Quem somos'], ['lojas', 'Nossas lojas'], ['servicos', 'Serviços'],
      ['farmacia-popular', 'Farmácia Popular'], ['clube', 'Clube São Carlos'],
      ['atendimento', 'Atendimento'], ['entregas', 'Entregas'], ['trocas', 'Trocas'],
      ['faq', 'Dúvidas'], ['privacidade', 'Privacidade'], ['termos', 'Termos'],
      ['cookies', 'Cookies'], ['lgpd', 'LGPD']
    ];

    documento.getElementById('conteudo').innerHTML =
      '<div class="container"><div class="layout-institucional">' +
        '<nav class="indice" aria-label="Seções institucionais"><ul>' +
          atalhos.map(function (a) {
            return '<li><a href="institucional.html?p=' + a[0] + '"' +
              (a[0] === chave ? ' aria-current="page"' : '') + '>' + a[1] + '</a></li>';
          }).join('') +
        '</ul></nav>' +
        '<article class="prosa">' +
          '<h1>' + L.escapar(pagina.titulo) + '</h1>' +
          '<p class="prosa__resumo">' + L.escapar(pagina.resumo) + '</p>' +
          pagina.corpo +
        '</article>' +
      '</div></div>';

    /* acordeão do FAQ */
    documento.addEventListener('click', function (e) {
      var botao = e.target.closest('.acordeao__titulo');
      if (!botao) return;
      var aberto = botao.getAttribute('aria-expanded') === 'true';
      botao.setAttribute('aria-expanded', aberto ? 'false' : 'true');
      var corpo = documento.getElementById(botao.getAttribute('aria-controls'));
      if (corpo) corpo.hidden = aberto;
    });

    documento.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-cidade]');
      if (!chip) return;
      var cidade = chip.getAttribute('data-cidade');
      documento.querySelectorAll('[data-cidade]').forEach(function (b) {
        b.setAttribute('aria-pressed', b === chip ? 'true' : 'false');
      });
      documento.querySelectorAll('[data-cidade-loja]').forEach(function (card) {
        card.hidden = cidade !== '' && card.getAttribute('data-cidade-loja') !== cidade;
      });
    });

    documento.addEventListener('submit', function (e) {
      if (e.target.matches('[data-contato]')) {
        e.preventDefault();
        L.aviso('Solicitação registrada. Nosso time responde em breve.', 'ok');
        e.target.reset();
      }
    });
  }

  /* espera o DOM e o catálogo (do banco, se configurado) */
  janela.LojaAPI.pronto(montar);
})(window, document);
