-- =========================================================================
-- Carga inicial — gerada a partir de assets/js/dados.js.
-- 7 categorias, 26 produtos, 17 lojas, 9 serviços,
-- 3 cupons, 13 faixas de frete e as avaliações dos produtos.
-- Dinheiro em centavos. Pode ser reaplicada: usa upsert onde há chave natural.
-- =========================================================================

-- categorias
insert into farmacia.categorias (id, nome, icone, ordem) values
  ('cabelos', 'Cabelos', 'cabelos', 1),
  ('dermo', 'Dermocosméticos', 'dermo', 2),
  ('medicamentos', 'Medicamentos', 'medicamentos', 3),
  ('vitaminas', 'Vitaminas', 'vitaminas', 4),
  ('higiene', 'Higiene Pessoal', 'higiene', 5),
  ('infantil', 'Mamãe e Bebê', 'infantil', 6),
  ('ofertas', 'Ofertas', 'ofertas', 7)
on conflict (id) do update set nome = excluded.nome, icone = excluded.icone, ordem = excluded.ordem;

-- produtos
insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'LUM-CPH-250', 'lumiara-creme-pentear-hidratacao-profunda-250ml', 'Lumiara Professional Creme de Pentear Hidratação Profunda 250ml', 'Lumiara Professional', 'Hidratação Profunda', 'cabelos', 'Tratamento e finalização',
  8990, 11990, 7641,
  'lum-creme-pentear.svg', array['lum-creme-pentear.svg', 'lum-shampoo.svg', 'lum-mascara.svg']::text[], 4.8, 213, 18,
  true, false, false, null,
  array['Mais vendido']::text[], 'Creme de pentear sem enxágue que devolve maciez e controle aos fios ressecados por química, calor ou sol. Textura leve, não pesa e facilita o desembaraço desde a primeira aplicação.', array['Hidratação prolongada por até 72 horas', 'Reduz o frizz e facilita o desembaraço', 'Proteção térmica leve até 180 °C', 'Livre de sal, parabenos e corantes artificiais']::text[], '<p>O <strong>Creme de Pentear Hidratação Profunda</strong> da linha Lumiara Professional foi desenvolvido para cabelos que perderam água e maleabilidade — seja por coloração, alisamento, uso frequente de secador ou exposição ao sol e à piscina.</p><p>A fórmula combina um complexo de aminoácidos vegetais com manteiga de murumuru e ácido hialurônico de baixo peso molecular. Enquanto os aminoácidos preenchem as falhas da fibra capilar, a manteiga sela a cutícula e o ácido hialurônico retém água no interior do fio. O resultado é um cabelo mais macio, alinhado e com brilho natural — sem o aspecto engordurado típico de cremes muito oleosos.</p><p>Por ser leve e sem enxágue, pode ser usado diariamente, inclusive em cabelos com baixa porosidade. É compatível com cronograma capilar e pode ser aplicado antes da escova ou do secador como proteção térmica leve.</p>', '<ol><li>Lave os cabelos normalmente e remova o excesso de água com a toalha.</li><li>Com os fios úmidos, distribua uma noz do produto do meio às pontas, evitando a raiz.</li><li>Desembarace com pente de dentes largos, das pontas em direção ao comprimento.</li><li>Finalize ao natural, com difusor ou escova. <strong>Não enxágue.</strong></li></ol><p>Em cabelos muito grossos ou longos, aplique em mechas separadas para garantir distribuição uniforme. Uso diário liberado.</p>', '<p>Aqua, Cetearyl Alcohol, Behentrimonium Chloride, Glycerin, Astrocaryum Murumuru Seed Butter, Sodium Hyaluronate, Hydrolyzed Wheat Protein, Arginine, Panthenol, Cocos Nucifera Oil, Butyrospermum Parkii Butter, Citric Acid, Phenoxyethanol, Ethylhexylglycerin, Parfum.</p><p class="miudos"><em>Não contém: cloreto de sódio, parabenos, corantes artificiais, formol ou derivados. Produto não testado em animais.</em></p>',
  '[["Marca","Lumiara Professional"],["Linha","Hidratação Profunda"],["Tipo de produto","Creme de pentear sem enxágue (leave-in)"],["Conteúdo","250 ml"],["Indicação","Cabelos secos, danificados ou quimicamente tratados"],["Tipo de cabelo","Todos os tipos, inclusive cacheados e crespos"],["Textura","Creme leve"],["Fragrância","Floral amadeirado"],["Registro ANVISA","Cosmético grau 1 — notificação nº 25351.000000/0000 (fictício)"],["Código de barras (EAN)","7890000000015"],["Código interno (SKU)","LUM-CPH-250"],["Fabricante","Lumiara Cosméticos Ltda. (marca fictícia)"],["País de origem","Brasil"],["Validade","36 meses a partir da data de fabricação"],["Conservação","Manter em local seco, ao abrigo da luz e do calor"]]'::jsonb, null, '[{"id":"250","rotulo":"250 ml","detalhe":"R$ 0,36 / ml","preco_centavos":8990,"preco_de_centavos":11990,"padrao":true},{"id":"500","rotulo":"500 ml","detalhe":"R$ 0,30 / ml","preco_centavos":14990,"preco_de_centavos":18990},{"id":"kit","rotulo":"Kit 250 ml + máscara","detalhe":"economize R$ 40","preco_centavos":15990,"preco_de_centavos":22980}]'::jsonb, array['LUM-SHP-300', 'LUM-MSC-200', 'DER-SER-30', 'DER-HID-400', 'VIT-DEE-60']::text[], 1
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'LUM-SHP-300', 'lumiara-shampoo-reconstrucao-diaria-300ml', 'Lumiara Professional Shampoo Reconstrução Diária 300ml', 'Lumiara Professional', 'Reconstrução', 'cabelos', 'Shampoo',
  6490, 7990, 5517,
  'lum-shampoo.svg', array['lum-shampoo.svg', 'lum-creme-pentear.svg']::text[], 4.6, 148, 32,
  true, false, false, null,
  '{}'::text[], 'Shampoo de limpeza suave, sem sulfatos agressivos, que repõe massa capilar em fios enfraquecidos por química.', array['Sem sulfatos agressivos', 'Repõe queratina e aminoácidos', 'pH balanceado 5,5']::text[], '<p>Limpa sem retirar a oleosidade natural do couro cabeludo e prepara o fio para receber o tratamento seguinte. Indicado para uso diário em cabelos com química ou quebra frequente.</p>', '<p>Aplique nos cabelos molhados, massageie o couro cabeludo e enxágue. Repita se necessário.</p>', '<p>Aqua, Sodium Cocoyl Isethionate, Cocamidopropyl Betaine, Glycerin, Hydrolyzed Keratin, Panthenol, Citric Acid, Phenoxyethanol, Parfum.</p>',
  '[["Marca","Lumiara Professional"],["Tipo de produto","Shampoo"],["Conteúdo","300 ml"],["Indicação","Cabelos enfraquecidos e quimicamente tratados"],["Código de barras (EAN)","7890000000022"],["País de origem","Brasil"]]'::jsonb, null, '[]'::jsonb, array['LUM-CPH-250', 'LUM-MSC-200', 'DER-HID-400']::text[], 2
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'LUM-MSC-200', 'lumiara-mascara-nutricao-extrema-200g', 'Lumiara Professional Máscara Nutrição Extrema 200g', 'Lumiara Professional', 'Nutrição', 'cabelos', 'Máscara de tratamento',
  10990, 13990, 9341,
  'lum-mascara.svg', array['lum-mascara.svg', 'lum-creme-pentear.svg']::text[], 4.9, 96, 7,
  true, false, false, null,
  array['Últimas unidades']::text[], 'Máscara de nutrição intensiva com óleos vegetais para cabelos porosos e opacos.', array['Ação em 5 minutos', 'Óleos de murumuru e pracaxi', 'Brilho imediato']::text[], '<p>Tratamento semanal de nutrição profunda. A combinação de óleos amazônicos repõe lipídios perdidos e devolve maleabilidade aos fios.</p>', '<p>Após o shampoo, aplique do meio às pontas, deixe agir de 5 a 10 minutos e enxágue bem. Use uma a duas vezes por semana.</p>', '<p>Aqua, Cetearyl Alcohol, Behentrimonium Methosulfate, Astrocaryum Murumuru Seed Butter, Pentaclethra Macroloba Seed Oil, Panthenol, Parfum.</p>',
  '[["Marca","Lumiara Professional"],["Tipo de produto","Máscara capilar"],["Conteúdo","200 g"],["Código de barras (EAN)","7890000000039"],["País de origem","Brasil"]]'::jsonb, null, '[]'::jsonb, array['LUM-CPH-250', 'LUM-SHP-300']::text[], 3
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'DER-PRT-50', 'solaris-protetor-solar-facial-fps70-50g', 'Solaris Protetor Solar Facial FPS 70 Toque Seco 50g', 'Solaris', 'Facial', 'dermo', 'Proteção solar',
  7490, 9690, 6367,
  'solaris-fps70.svg', array['solaris-fps70.svg']::text[], 4.7, 402, 45,
  true, false, false, null,
  array['Mais vendido']::text[], 'Protetor solar facial com toque seco, alta proteção UVA/UVB e controle de oleosidade por até 8 horas.', array['FPS 70 / PPD 23', 'Toque seco, não deixa resíduo branco', 'Testado dermatologicamente']::text[], '<p>Fotoproteção diária de amplo espectro para peles oleosas e mistas. A textura fluida seca rapidamente e pode ser usada sob a maquiagem.</p>', '<p>Aplique generosamente no rosto e pescoço 15 minutos antes da exposição solar. Reaplique a cada 2 horas ou após nadar, transpirar ou secar-se com toalha.</p>', '<p>Aqua, Homosalate, Ethylhexyl Salicylate, Butyl Methoxydibenzoylmethane, Silica, Niacinamide, Tocopheryl Acetate, Phenoxyethanol.</p>',
  '[["Marca","Solaris"],["Tipo de produto","Protetor solar facial"],["FPS","70"],["Conteúdo","50 g"],["Tipo de pele","Oleosa e mista"],["Registro ANVISA","Cosmético grau 2 — nº 25351.000000/0001 (fictício)"],["Código de barras (EAN)","7890000000046"],["País de origem","Brasil"]]'::jsonb, 'A proteção solar é apenas uma das medidas de fotoproteção. Evite a exposição ao sol entre 10h e 16h e use também chapéu, óculos escuros e roupas adequadas.', '[]'::jsonb, array['DER-SER-30', 'DER-HID-400', 'LUM-CPH-250']::text[], 4
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'DER-SER-30', 'nuvela-serum-facial-vitamina-c-10-30ml', 'Nuvela Sérum Facial Vitamina C 10% Antioxidante 30ml', 'Nuvela', 'Glow', 'dermo', 'Tratamento facial',
  12990, 16990, 11041,
  'nuvela-serum.svg', array['nuvela-serum.svg']::text[], 4.5, 187, 21,
  true, false, false, null,
  '{}'::text[], 'Sérum antioxidante com vitamina C estabilizada a 10% para uniformizar o tom e iluminar a pele.', array['Vitamina C estabilizada 10%', 'Uniformiza o tom da pele', 'Textura de rápida absorção']::text[], '<p>Concentrado antioxidante de uso matinal. Ajuda a reduzir manchas leves, neutraliza radicais livres e potencializa o efeito do protetor solar.</p>', '<p>Pela manhã, na pele limpa e seca, aplique 3 a 4 gotas no rosto. Aguarde a absorção e finalize com hidratante e protetor solar.</p>', '<p>Aqua, Ethyl Ascorbic Acid, Propanediol, Glycerin, Ferulic Acid, Tocopherol, Sodium Hyaluronate, Phenoxyethanol.</p>',
  '[["Marca","Nuvela"],["Tipo de produto","Sérum facial"],["Conteúdo","30 ml"],["Ativo principal","Ácido 3-O-etil ascórbico 10%"],["Período de uso","Manhã"],["Código de barras (EAN)","7890000000053"],["País de origem","Brasil"]]'::jsonb, null, '[]'::jsonb, array['DER-PRT-50', 'DER-HID-400', 'VIT-DEE-60']::text[], 5
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'DER-HID-400', 'nuvela-hidratante-corporal-ureia-10-400ml', 'Nuvela Hidratante Corporal Ureia 10% 400ml', 'Nuvela', 'Repair', 'dermo', 'Hidratante corporal',
  4990, 6290, 4241,
  'nuvela-ureia.svg', array['nuvela-ureia.svg']::text[], 4.8, 311, 60,
  false, false, false, null,
  '{}'::text[], 'Hidratante para pele extrasseca com ureia 10%, indicado para pernas, cotovelos, joelhos e pés.', array['Ureia 10% + ceramidas', 'Alívio da aspereza em 7 dias', 'Sem perfume']::text[], '<p>Loção de alta emoliência para peles muito secas e com descamação. A ureia atua como umectante e queratolítico suave.</p>', '<p>Aplique uma a duas vezes ao dia sobre a pele limpa, massageando até a completa absorção. Evite mucosas e pele lesionada.</p>', '<p>Aqua, Urea, Glycerin, Cetearyl Alcohol, Ceramide NP, Lactic Acid, Panthenol, Phenoxyethanol.</p>',
  '[["Marca","Nuvela"],["Tipo de produto","Hidratante corporal"],["Conteúdo","400 ml"],["Tipo de pele","Extrasseca"],["Fragrância","Sem perfume"],["Código de barras (EAN)","7890000000060"],["País de origem","Brasil"]]'::jsonb, null, '[]'::jsonb, array['DER-SER-30', 'DER-PRT-50', 'HIG-CRE-90']::text[], 6
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'MED-DIP-500', 'dipirona-monoidratada-500mg-20-comprimidos', 'Dipirona Monoidratada 500mg 20 Comprimidos — Genérico', 'Genérico São Carlos', 'Genéricos', 'medicamentos', 'Analgésicos e antitérmicos',
  1249, 1890, 1062,
  'med-dipirona.svg', array['med-dipirona.svg']::text[], 4.4, 528, 120,
  true, true, false, null,
  array['Genérico']::text[], 'Analgésico e antitérmico indicado para dor e febre. Medicamento genérico, isento de prescrição.', array['Início de ação rápido', 'Genérico com preço acessível', 'Cartela com 20 comprimidos']::text[], '<p>Medicamento genérico à base de dipirona monoidratada 500 mg, indicado como analgésico e antitérmico em adultos e crianças acima de 12 anos.</p>', '<p>Adultos e adolescentes acima de 12 anos: 1 a 2 comprimidos por dose, até 4 vezes ao dia. Não exceda a dose recomendada. Siga sempre a orientação do médico ou farmacêutico.</p>', '<p><strong>Princípio ativo:</strong> dipirona monoidratada 500 mg.<br><strong>Excipientes:</strong> amido, estearato de magnésio, croscarmelose sódica, celulose microcristalina.</p>',
  '[["Princípio ativo","Dipirona monoidratada"],["Concentração","500 mg"],["Forma farmacêutica","Comprimido"],["Quantidade","20 comprimidos"],["Classe terapêutica","Analgésico / antitérmico"],["Tipo de medicamento","Genérico — isento de prescrição (MIP)"],["Registro MS","1.0000.0000 (fictício)"],["Código de barras (EAN)","7890000000077"],["País de origem","Brasil"]]'::jsonb, 'MEDICAMENTO ISENTO DE PRESCRIÇÃO. AO PERSISTIREM OS SINTOMAS, O MÉDICO DEVERÁ SER CONSULTADO. Não use este medicamento em caso de alergia à dipirona. Leia a bula antes de usar.', '[]'::jsonb, array['MED-IBU-400', 'VIT-DEE-60', 'HIG-CRE-90']::text[], 7
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'MED-IBU-400', 'ibuprofeno-400mg-20-comprimidos', 'Ibuprofeno 400mg 20 Comprimidos Revestidos — Genérico', 'Genérico São Carlos', 'Genéricos', 'medicamentos', 'Anti-inflamatórios',
  1890, 2650, 1607,
  'med-ibuprofeno.svg', array['med-ibuprofeno.svg']::text[], 4.5, 289, 84,
  false, true, false, null,
  array['Genérico']::text[], 'Anti-inflamatório não esteroidal indicado para dores leves a moderadas e febre.', array['Ação anti-inflamatória e analgésica', 'Comprimidos revestidos', 'Genérico']::text[], '<p>Medicamento genérico à base de ibuprofeno 400 mg, indicado para o alívio de dores leves a moderadas, processos inflamatórios e febre.</p>', '<p>Adultos: 1 comprimido a cada 6 a 8 horas, preferencialmente após as refeições. Não exceda 3 comprimidos ao dia sem orientação médica.</p>', '<p><strong>Princípio ativo:</strong> ibuprofeno 400 mg.<br><strong>Excipientes:</strong> celulose microcristalina, dióxido de silício, estearato de magnésio, hipromelose.</p>',
  '[["Princípio ativo","Ibuprofeno"],["Concentração","400 mg"],["Forma farmacêutica","Comprimido revestido"],["Quantidade","20 comprimidos"],["Classe terapêutica","Anti-inflamatório não esteroidal"],["Tipo de medicamento","Genérico — isento de prescrição (MIP)"],["Registro MS","1.0000.0001 (fictício)"],["Código de barras (EAN)","7890000000084"],["País de origem","Brasil"]]'::jsonb, 'MEDICAMENTO ISENTO DE PRESCRIÇÃO. AO PERSISTIREM OS SINTOMAS, O MÉDICO DEVERÁ SER CONSULTADO. Não recomendado para gestantes no terceiro trimestre. Leia a bula antes de usar.', '[]'::jsonb, array['MED-DIP-500', 'VIT-MAG-90']::text[], 8
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'VIT-DEE-60', 'vitamina-d3-2000ui-60-capsulas', 'Vitamina D3 2000UI 60 Cápsulas', 'Vitalis', 'Essenciais', 'vitaminas', 'Vitaminas',
  3990, 5490, 3392,
  'vit-d3.svg', array['vit-d3.svg']::text[], 4.7, 364, 52,
  true, false, false, null,
  '{}'::text[], 'Suplemento de vitamina D3 em cápsulas de rápida absorção. Dois meses de tratamento.', array['Contribui para a saúde óssea', 'Auxilia o sistema imunológico', '60 cápsulas — 2 meses']::text[], '<p>A vitamina D3 (colecalciferol) auxilia na absorção de cálcio e no funcionamento normal do sistema imunológico.</p>', '<p>Ingerir 1 cápsula ao dia, preferencialmente junto a uma refeição que contenha gordura, ou conforme orientação de nutricionista ou médico.</p>', '<p>Colecalciferol (vitamina D3) 50 mcg (2000 UI), óleo de girassol, cápsula de gelatina, umectante glicerina.</p>',
  '[["Marca","Vitalis"],["Tipo de produto","Suplemento alimentar"],["Concentração","2000 UI (50 mcg) por cápsula"],["Quantidade","60 cápsulas"],["Porção diária","1 cápsula"],["Sabor","Sem sabor"],["Código de barras (EAN)","7890000000091"],["País de origem","Brasil"]]'::jsonb, 'Este produto não é um medicamento. Não exceder a recomendação diária de consumo indicada na embalagem. Mantenha fora do alcance de crianças. Gestantes, nutrizes e crianças devem consultar o médico antes de consumir.', '[]'::jsonb, array['VIT-MAG-90', 'VIT-OME-120', 'DER-SER-30']::text[], 9
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'VIT-MAG-90', 'magnesio-dimalato-500mg-90-capsulas', 'Magnésio Dimalato 500mg 90 Cápsulas', 'Vitalis', 'Essenciais', 'vitaminas', 'Minerais',
  5990, 7490, 5092,
  'vit-magnesio.svg', array['vit-magnesio.svg']::text[], 4.6, 142, 38,
  false, false, false, null,
  '{}'::text[], 'Magnésio dimalato em cápsulas, forma de boa tolerância gástrica.', array['Auxilia na função muscular', 'Contribui para o metabolismo energético', '90 cápsulas']::text[], '<p>O magnésio participa de centenas de reações enzimáticas e auxilia no funcionamento normal dos músculos e do sistema nervoso.</p>', '<p>Ingerir 2 cápsulas ao dia, ou conforme orientação profissional.</p>', '<p>Magnésio dimalato 500 mg, cápsula de celulose vegetal, antiumectante dióxido de silício.</p>',
  '[["Marca","Vitalis"],["Tipo de produto","Suplemento alimentar"],["Concentração","500 mg por cápsula"],["Quantidade","90 cápsulas"],["Cápsula","Vegetal — adequado para vegetarianos"],["Código de barras (EAN)","7890000000107"],["País de origem","Brasil"]]'::jsonb, 'Este produto não é um medicamento. Não exceder a recomendação diária de consumo.', '[]'::jsonb, array['VIT-DEE-60', 'VIT-OME-120']::text[], 10
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'VIT-OME-120', 'omega-3-1000mg-120-capsulas', 'Ômega 3 1000mg 120 Cápsulas EPA/DHA', 'Vitalis', 'Premium', 'vitaminas', 'Ácidos graxos',
  8990, 11990, 7641,
  'vit-omega3.svg', array['vit-omega3.svg']::text[], 4.8, 219, 26,
  true, false, false, null,
  '{}'::text[], 'Óleo de peixe purificado com alta concentração de EPA e DHA, sem refluxo.', array['540 mg de EPA + 360 mg de DHA', 'Óleo purificado e livre de metais pesados', '120 cápsulas']::text[], '<p>Suplemento de ácidos graxos essenciais da série ômega 3, obtido de peixes de águas frias e submetido a processo de purificação molecular.</p>', '<p>Ingerir 2 cápsulas ao dia junto às refeições.</p>', '<p>Óleo de peixe concentrado, cápsula de gelatina, umectante glicerina, antioxidante tocoferol.</p>',
  '[["Marca","Vitalis"],["Tipo de produto","Suplemento alimentar"],["Concentração","1000 mg por cápsula"],["Quantidade","120 cápsulas"],["EPA / DHA","540 mg / 360 mg na porção diária"],["Código de barras (EAN)","7890000000114"],["País de origem","Brasil"]]'::jsonb, 'Este produto não é um medicamento. Não exceder a recomendação diária de consumo. Contém peixe — pode causar reação em pessoas alérgicas.', '[]'::jsonb, array['VIT-DEE-60', 'VIT-MAG-90']::text[], 11
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'HIG-CRE-90', 'creme-dental-clareador-menta-90g', 'Creme Dental Clareador Menta Intensa 90g', 'Orallis', 'White', 'higiene', 'Higiene bucal',
  1590, 2190, 1352,
  'hig-creme-dental.svg', array['hig-creme-dental.svg']::text[], 4.3, 176, 95,
  false, false, false, null,
  '{}'::text[], 'Creme dental com ação clareadora suave e proteção anticárie com flúor.', array['1450 ppm de flúor', 'Remove manchas superficiais', 'Hálito fresco prolongado']::text[], '<p>Creme dental de uso diário que combina agentes de polimento suave com flúor para proteção contra cáries.</p>', '<p>Escove os dentes por no mínimo dois minutos, três vezes ao dia. Crianças menores de 6 anos devem usar quantidade equivalente a um grão de ervilha, sob supervisão de um adulto.</p>', '<p>Aqua, Sorbitol, Hydrated Silica, Sodium Fluoride (1450 ppm F), Sodium Lauryl Sulfate, Aroma, Sodium Saccharin.</p>',
  '[["Marca","Orallis"],["Tipo de produto","Creme dental"],["Conteúdo","90 g"],["Flúor","1450 ppm"],["Sabor","Menta intensa"],["Código de barras (EAN)","7890000000121"],["País de origem","Brasil"]]'::jsonb, null, '[]'::jsonb, array['HIG-ESC-01', 'DER-HID-400']::text[], 12
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'HIG-ESC-01', 'escova-dental-macia-cabo-ergonomico', 'Escova Dental Macia Cabo Ergonômico — Unidade', 'Orallis', 'Care', 'higiene', 'Higiene bucal',
  1290, 1690, 1097,
  'hig-escova.svg', array['hig-escova.svg']::text[], 4.2, 88, 140,
  false, false, false, null,
  '{}'::text[], 'Escova de cerdas macias com pontas arredondadas e limpador de língua.', array['Cerdas macias com pontas arredondadas', 'Cabo antiderrapante', 'Limpador de língua']::text[], '<p>Escova de uso diário indicada para gengivas sensíveis. As cerdas macias limpam sem agredir o esmalte e a margem gengival.</p>', '<p>Escove três vezes ao dia. Substitua a escova a cada três meses ou quando as cerdas estiverem deformadas.</p>', '<p>Cerdas de náilon, cabo de polipropileno e elastômero termoplástico.</p>',
  '[["Marca","Orallis"],["Tipo de produto","Escova dental"],["Dureza","Macia"],["Quantidade","1 unidade"],["Código de barras (EAN)","7890000000138"],["País de origem","Brasil"]]'::jsonb, null, '[]'::jsonb, array['HIG-CRE-90']::text[], 13
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'INF-FRA-M40', 'fralda-infantil-soft-care-m-40-unidades', 'Fralda Infantil Soft Care Tamanho M 40 Unidades', 'Soft Care', 'Baby', 'infantil', 'Fraldas',
  5490, 6990, 4667,
  'inf-fralda.svg', array['inf-fralda.svg']::text[], 4.6, 254, 0,
  false, false, false, null,
  '{}'::text[], 'Fralda descartável com barreiras antivazamento e cobertura macia, tamanho M (6 a 10 kg).', array['Até 12 horas de absorção', 'Barreiras antivazamento', 'Indicador de umidade']::text[], '<p>Fralda com núcleo absorvente de alta capacidade e cobertura respirável, indicada para bebês de 6 a 10 kg.</p>', '<p>Troque a fralda sempre que necessário, mantendo a pele do bebê limpa e seca.</p>', '<p>Polipropileno, polietileno, celulose, polímero superabsorvente, adesivos termoplásticos e elásticos.</p>',
  '[["Marca","Soft Care"],["Tipo de produto","Fralda descartável infantil"],["Tamanho","M — 6 a 10 kg"],["Quantidade","40 unidades"],["Código de barras (EAN)","7890000000145"],["País de origem","Brasil"]]'::jsonb, null, '[]'::jsonb, array['DER-HID-400', 'HIG-CRE-90']::text[], 14
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'MED-PAR-750', 'paracetamol-750mg-20-comprimidos', 'Paracetamol 750mg 20 Comprimidos — Genérico', 'Genérico', 'Genéricos', 'medicamentos', 'Analgésicos e antitérmicos',
  990, 1490, 842,
  'med-paracetamol.svg', array['med-paracetamol.svg']::text[], 4.5, 412, 140,
  false, true, false, null,
  array['Genérico']::text[], 'Analgésico e antitérmico para dor leve a moderada e febre. Alternativa para quem não pode usar anti-inflamatório.', array['Não agride o estômago como os anti-inflamatórios', 'Pode ser usado por gestantes sob orientação médica', 'Cartela com 20 comprimidos']::text[], '<p>O paracetamol age no sistema nervoso central reduzindo a percepção da dor e a febre. Por não ser anti-inflamatório, costuma ser melhor tolerado pelo estômago que a dipirona e o ibuprofeno.</p>', '<p>Adultos: 1 comprimido a cada 6 a 8 horas, não ultrapassando 5 comprimidos em 24 horas. Não use por mais de 5 dias seguidos sem orientação médica.</p>', '<p><strong>Princípio ativo:</strong> paracetamol 750 mg.<br><strong>Excipientes:</strong> amido, povidona, estearato de magnésio.</p>',
  '[["Princípio ativo","Paracetamol"],["Concentração","750 mg"],["Forma farmacêutica","Comprimido"],["Quantidade","20 comprimidos"],["Classe terapêutica","Analgésico / antitérmico"],["Tipo de medicamento","Genérico — isento de prescrição (MIP)"],["País de origem","Brasil"]]'::jsonb, 'MEDICAMENTO ISENTO DE PRESCRIÇÃO. AO PERSISTIREM OS SINTOMAS, O MÉDICO DEVERÁ SER CONSULTADO. Doses acima da recomendada podem causar lesão no fígado. Não use junto a bebida alcoólica nem com outros produtos que contenham paracetamol. Leia a bula.', '[]'::jsonb, array['MED-DIP-500', 'MED-IBU-400', 'MED-DIP-GTS']::text[], 15
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'MED-DIP-GTS', 'dipirona-gotas-500mg-ml-20ml', 'Dipirona Sódica Gotas 500mg/ml 20ml — Genérico', 'Genérico', 'Genéricos', 'medicamentos', 'Analgésicos e antitérmicos',
  890, 1290, 757,
  'med-dipirona-gotas.svg', array['med-dipirona-gotas.svg']::text[], 4.6, 288, 96,
  false, true, false, null,
  array['Genérico']::text[], 'Dipirona em gotas, com dose ajustável pelo peso. Prática para crianças e para quem tem dificuldade de engolir comprimido.', array['Dose ajustável ao peso', 'Frasco com conta-gotas', 'Ação rápida']::text[], '<p>Apresentação em gotas da dipirona sódica, indicada como analgésico e antitérmico. A forma líquida permite ajustar a dose ao peso, o que facilita o uso pediátrico sob orientação.</p>', '<p>Adultos: 20 a 40 gotas até 4 vezes ao dia. Para crianças, a dose depende do peso e deve ser definida pelo médico ou farmacêutico. Não use em menores de 3 meses.</p>', '<p><strong>Princípio ativo:</strong> dipirona sódica 500 mg/ml.<br><strong>Excipientes:</strong> água purificada, sacarina sódica.</p>',
  '[["Princípio ativo","Dipirona sódica"],["Concentração","500 mg/ml"],["Forma farmacêutica","Solução oral em gotas"],["Conteúdo","20 ml"],["Tipo de medicamento","Genérico — isento de prescrição (MIP)"],["País de origem","Brasil"]]'::jsonb, 'MEDICAMENTO ISENTO DE PRESCRIÇÃO. AO PERSISTIREM OS SINTOMAS, O MÉDICO DEVERÁ SER CONSULTADO. Não use em caso de alergia à dipirona. Leia a bula.', '[]'::jsonb, array['MED-DIP-500', 'MED-PAR-750']::text[], 16
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'MED-OME-20', 'omeprazol-20mg-28-capsulas', 'Omeprazol 20mg 28 Cápsulas — Genérico', 'Genérico', 'Genéricos', 'medicamentos', 'Estômago e digestão',
  1690, 2490, 1437,
  'med-omeprazol.svg', array['med-omeprazol.svg']::text[], 4.7, 356, 78,
  true, true, false, null,
  array['Genérico']::text[], 'Reduz a produção de ácido no estômago. Indicado para azia frequente, má digestão e refluxo.', array['Alívio da azia por até 24 horas', 'Cápsulas de liberação entérica', 'Tratamento de 4 semanas']::text[], '<p>O omeprazol é um inibidor da bomba de prótons: age na célula que produz ácido no estômago, reduzindo a acidez por cerca de 24 horas. O efeito pleno costuma aparecer após alguns dias de uso contínuo.</p>', '<p>1 cápsula ao dia, pela manhã, em jejum, com água. Engula inteira, sem abrir nem mastigar. O uso por conta própria não deve passar de 14 dias seguidos.</p>', '<p><strong>Princípio ativo:</strong> omeprazol 20 mg.<br><strong>Excipientes:</strong> manitol, hipromelose, talco.</p>',
  '[["Princípio ativo","Omeprazol"],["Concentração","20 mg"],["Forma farmacêutica","Cápsula de liberação retardada"],["Quantidade","28 cápsulas"],["Classe terapêutica","Inibidor da bomba de prótons"],["Tipo de medicamento","Genérico — isento de prescrição (MIP)"],["País de origem","Brasil"]]'::jsonb, 'MEDICAMENTO ISENTO DE PRESCRIÇÃO. AO PERSISTIREM OS SINTOMAS, O MÉDICO DEVERÁ SER CONSULTADO. Azia persistente por mais de 14 dias merece investigação médica. Leia a bula.', '[]'::jsonb, array['MED-ESC-10', 'MED-PAR-750']::text[], 17
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'MED-LOR-10', 'loratadina-10mg-12-comprimidos', 'Loratadina 10mg 12 Comprimidos — Genérico', 'Genérico', 'Genéricos', 'medicamentos', 'Alergia',
  790, 1190, 672,
  'med-loratadina.svg', array['med-loratadina.svg']::text[], 4.6, 234, 110,
  false, true, false, null,
  array['Genérico']::text[], 'Antialérgico de dose única diária que não costuma dar sono.', array['Uma dose por dia', 'Baixa sonolência', 'Alívio de coriza e coceira']::text[], '<p>A loratadina é um anti-histamínico de segunda geração, indicado para rinite alérgica e urticária. Por atravessar pouco a barreira cerebral, causa bem menos sonolência que os antialérgicos antigos.</p>', '<p>Adultos e crianças acima de 12 anos: 1 comprimido ao dia. Pode ser tomado com ou sem alimento.</p>', '<p><strong>Princípio ativo:</strong> loratadina 10 mg.<br><strong>Excipientes:</strong> lactose, amido, estearato de magnésio.</p>',
  '[["Princípio ativo","Loratadina"],["Concentração","10 mg"],["Forma farmacêutica","Comprimido"],["Quantidade","12 comprimidos"],["Classe terapêutica","Anti-histamínico"],["Tipo de medicamento","Genérico — isento de prescrição (MIP)"],["País de origem","Brasil"]]'::jsonb, 'MEDICAMENTO ISENTO DE PRESCRIÇÃO. AO PERSISTIREM OS SINTOMAS, O MÉDICO DEVERÁ SER CONSULTADO. Contém lactose. Leia a bula.', '[]'::jsonb, array['DER-HID-400', 'MED-PAR-750']::text[], 18
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'MED-ESC-10', 'butilbrometo-escopolamina-dipirona-30-comprimidos', 'Butilbrometo de Escopolamina + Dipirona 30 Comprimidos — Genérico', 'Genérico', 'Genéricos', 'medicamentos', 'Estômago e digestão',
  2190, 2990, 1862,
  'med-escopolamina.svg', array['med-escopolamina.svg']::text[], 4.7, 198, 64,
  false, true, false, null,
  array['Genérico']::text[], 'Antiespasmódico com analgésico, para cólicas abdominais, menstruais e renais.', array['Age sobre a cólica e sobre a dor', 'Início de ação rápido', '30 comprimidos']::text[], '<p>Combina um antiespasmódico, que relaxa a musculatura lisa do trato digestivo e urinário, com um analgésico. É a associação mais usada para cólica menstrual e intestinal.</p>', '<p>Adultos: 1 a 2 comprimidos até 4 vezes ao dia, com um pouco de água. Não ultrapasse 6 comprimidos em 24 horas.</p>', '<p><strong>Princípios ativos:</strong> butilbrometo de escopolamina 10 mg e dipirona sódica 250 mg.</p>',
  '[["Princípios ativos","Butilbrometo de escopolamina + dipirona sódica"],["Concentração","10 mg + 250 mg"],["Forma farmacêutica","Comprimido revestido"],["Quantidade","30 comprimidos"],["Classe terapêutica","Antiespasmódico / analgésico"],["Tipo de medicamento","Genérico — isento de prescrição (MIP)"],["País de origem","Brasil"]]'::jsonb, 'MEDICAMENTO ISENTO DE PRESCRIÇÃO. AO PERSISTIREM OS SINTOMAS, O MÉDICO DEVERÁ SER CONSULTADO. Não use em caso de glaucoma ou alergia à dipirona. Leia a bula.', '[]'::jsonb, array['MED-DIP-500', 'MED-OME-20']::text[], 19
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'MED-AAS-100', 'acido-acetilsalicilico-100mg-30-comprimidos', 'Ácido Acetilsalicílico 100mg 30 Comprimidos — Genérico', 'Genérico', 'Genéricos', 'medicamentos', 'Cardiovascular',
  690, 990, 587,
  'med-aas.svg', array['med-aas.svg']::text[], 4.8, 176, 130,
  false, true, false, null,
  array['Genérico']::text[], 'Dose baixa de AAS, usada como antiagregante plaquetário sob orientação médica.', array['Dose de 100 mg', 'Uso contínuo de baixo custo', '30 comprimidos']::text[], '<p>Em dose baixa, o ácido acetilsalicílico reduz a agregação das plaquetas. É prescrito na prevenção de eventos cardiovasculares em pessoas com risco já avaliado por um médico.</p>', '<p>1 comprimido ao dia, após uma refeição, ou conforme a prescrição. Não interrompa nem inicie o uso contínuo por conta própria.</p>', '<p><strong>Princípio ativo:</strong> ácido acetilsalicílico 100 mg.</p>',
  '[["Princípio ativo","Ácido acetilsalicílico"],["Concentração","100 mg"],["Forma farmacêutica","Comprimido"],["Quantidade","30 comprimidos"],["Classe terapêutica","Antiagregante plaquetário"],["País de origem","Brasil"]]'::jsonb, 'O uso contínuo em dose baixa deve ser sempre indicado e acompanhado por um médico: aumenta o risco de sangramento. Não use em crianças e adolescentes com quadro viral. Leia a bula.', '[]'::jsonb, array['MED-SIN-20', 'MED-LOS-50']::text[], 20
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'MED-LOS-50', 'losartana-potassica-50mg-30-comprimidos', 'Losartana Potássica 50mg 30 Comprimidos — Genérico', 'Genérico', 'Genéricos', 'medicamentos', 'Cardiovascular',
  1490, 2290, 1267,
  'med-losartana.svg', array['med-losartana.svg']::text[], 4.8, 309, 85,
  true, true, true, 'gratuito',
  array['Genérico']::text[], 'Anti-hipertensivo de uso contínuo. Disponível gratuitamente pelo programa Farmácia Popular, mediante receita.', array['Gratuito pelo Farmácia Popular', 'Dose única diária', 'Uso contínuo com lembrete de recompra']::text[], '<p>A losartana é um antagonista do receptor da angiotensina II, usada no controle da pressão alta e na proteção renal de pessoas com diabetes. É medicamento de uso contínuo: o efeito depende da regularidade.</p>', '<p>Conforme a prescrição médica, normalmente 1 comprimido ao dia, sempre no mesmo horário. Não interrompa por conta própria, mesmo sentindo-se bem — a pressão alta costuma não dar sintomas.</p>', '<p><strong>Princípio ativo:</strong> losartana potássica 50 mg.</p>',
  '[["Princípio ativo","Losartana potássica"],["Concentração","50 mg"],["Forma farmacêutica","Comprimido revestido"],["Quantidade","30 comprimidos"],["Classe terapêutica","Anti-hipertensivo"],["Venda","Sob prescrição médica — retenção de receita não exigida"],["Farmácia Popular","Gratuito"],["País de origem","Brasil"]]'::jsonb, 'VENDA SOB PRESCRIÇÃO MÉDICA. Este item não é vendido pelo site: o pedido é uma reserva para retirada na loja, mediante apresentação da receita válida. Contraindicado na gravidez. Leia a bula.', '[]'::jsonb, array['MED-MET-850', 'MED-SIN-20', 'MED-AAS-100']::text[], 21
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'MED-MET-850', 'metformina-850mg-30-comprimidos', 'Cloridrato de Metformina 850mg 30 Comprimidos — Genérico', 'Genérico', 'Genéricos', 'medicamentos', 'Diabetes',
  1290, 1890, 1097,
  'med-metformina.svg', array['med-metformina.svg']::text[], 4.7, 265, 72,
  false, true, true, 'gratuito',
  array['Genérico']::text[], 'Antidiabético oral de primeira linha no diabetes tipo 2. Gratuito pelo Farmácia Popular, mediante receita.', array['Gratuito pelo Farmácia Popular', 'Primeira linha no diabetes tipo 2', 'Uso contínuo com lembrete de recompra']::text[], '<p>A metformina reduz a produção de glicose pelo fígado e melhora a resposta do corpo à insulina. É o medicamento de escolha inicial no diabetes tipo 2 e não costuma causar queda de açúcar quando usada sozinha.</p>', '<p>Conforme a prescrição, normalmente junto às refeições para reduzir o desconforto no estômago. A dose é ajustada aos poucos pelo médico.</p>', '<p><strong>Princípio ativo:</strong> cloridrato de metformina 850 mg.</p>',
  '[["Princípio ativo","Cloridrato de metformina"],["Concentração","850 mg"],["Forma farmacêutica","Comprimido revestido"],["Quantidade","30 comprimidos"],["Classe terapêutica","Antidiabético oral"],["Venda","Sob prescrição médica"],["Farmácia Popular","Gratuito"],["País de origem","Brasil"]]'::jsonb, 'VENDA SOB PRESCRIÇÃO MÉDICA. Este item não é vendido pelo site: o pedido é uma reserva para retirada na loja, mediante apresentação da receita válida. Leia a bula.', '[]'::jsonb, array['MED-LOS-50', 'MED-SIN-20', 'VIT-DEE-60']::text[], 22
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'MED-SIN-20', 'sinvastatina-20mg-30-comprimidos', 'Sinvastatina 20mg 30 Comprimidos — Genérico', 'Genérico', 'Genéricos', 'medicamentos', 'Cardiovascular',
  1790, 2690, 1522,
  'med-sinvastatina.svg', array['med-sinvastatina.svg']::text[], 4.6, 187, 58,
  false, true, true, 'desconto',
  array['Genérico']::text[], 'Reduz o colesterol LDL. Tem desconto pelo programa Farmácia Popular, mediante receita.', array['Com desconto pelo Farmácia Popular', 'Tomada única à noite', 'Uso contínuo com lembrete de recompra']::text[], '<p>A sinvastatina é uma estatina: reduz a produção de colesterol pelo fígado, baixando o LDL e o risco cardiovascular. O efeito aparece após algumas semanas de uso contínuo.</p>', '<p>Conforme a prescrição, normalmente 1 comprimido à noite, porque a produção de colesterol pelo corpo é maior nesse período.</p>', '<p><strong>Princípio ativo:</strong> sinvastatina 20 mg.</p>',
  '[["Princípio ativo","Sinvastatina"],["Concentração","20 mg"],["Forma farmacêutica","Comprimido revestido"],["Quantidade","30 comprimidos"],["Classe terapêutica","Hipolipemiante (estatina)"],["Venda","Sob prescrição médica"],["Farmácia Popular","Com desconto"],["País de origem","Brasil"]]'::jsonb, 'VENDA SOB PRESCRIÇÃO MÉDICA. Este item não é vendido pelo site: o pedido é uma reserva para retirada na loja, mediante apresentação da receita válida. Avise o médico se sentir dor muscular importante. Leia a bula.', '[]'::jsonb, array['MED-LOS-50', 'MED-AAS-100', 'VIT-OME-120']::text[], 23
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'HIG-SOR-500', 'soro-fisiologico-0-9-500ml', 'Soro Fisiológico 0,9% 500ml', 'Genérico', 'Cuidado diário', 'higiene', 'Primeiros socorros',
  890, 1290, 757,
  'hig-soro.svg', array['hig-soro.svg']::text[], 4.8, 421, 180,
  false, false, false, null,
  '{}'::text[], 'Solução estéril de cloreto de sódio a 0,9%, para limpeza nasal, ocular e de ferimentos.', array['Estéril', 'Serve para nariz, olhos e curativos', 'Frasco de 500 ml']::text[], '<p>Solução isotônica, com a mesma concentração de sal do corpo, por isso não arde nem irrita. Usada para lavagem nasal em resfriados e alergias, limpeza dos olhos e higienização de ferimentos.</p>', '<p>Para lavagem nasal, use com seringa ou dispositivo próprio. Para curativos, aplique diretamente sobre a região. Após aberto, conserve refrigerado e use em até 7 dias.</p>', '<p>Cloreto de sódio 0,9% e água para injeção.</p>',
  '[["Composição","Cloreto de sódio 0,9%"],["Conteúdo","500 ml"],["Esterilidade","Estéril"],["Uso","Nasal, ocular e em curativos"],["País de origem","Brasil"]]'::jsonb, 'Produto para uso externo. Não injete. Descarte o frasco 7 dias após a abertura.', '[]'::jsonb, array['HIG-ALC-500', 'MED-LOR-10']::text[], 24
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'HIG-ALC-500', 'alcool-em-gel-70-500ml', 'Álcool em Gel 70% 500ml com Válvula', 'Genérico', 'Cuidado diário', 'higiene', 'Antissépticos',
  1390, 1890, 1182,
  'hig-alcool-gel.svg', array['hig-alcool-gel.svg']::text[], 4.5, 267, 150,
  false, false, false, null,
  '{}'::text[], 'Antisséptico para as mãos, na concentração de 70% recomendada pela ANVISA.', array['Concentração de 70%, a mais eficaz', 'Válvula dosadora', 'Com hidratante na fórmula']::text[], '<p>A 70% o álcool desnatura proteínas de forma mais eficiente que em concentrações mais altas, porque a água presente facilita a penetração na membrana dos microrganismos. A fórmula em gel leva umectante para reduzir o ressecamento das mãos.</p>', '<p>Aplique uma porção nas mãos secas e espalhe até evaporar, por cerca de 20 segundos. Não substitui a lavagem com água e sabão quando há sujeira visível.</p>', '<p>Álcool etílico 70% v/v, carbômero, glicerina, trietanolamina, água.</p>',
  '[["Composição","Álcool etílico 70% v/v"],["Conteúdo","500 ml"],["Apresentação","Gel com válvula dosadora"],["País de origem","Brasil"]]'::jsonb, 'Produto inflamável. Uso externo. Mantenha longe do fogo e fora do alcance de crianças.', '[]'::jsonb, array['HIG-SOR-500', 'HIG-CRE-90']::text[], 25
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

insert into farmacia.produtos (
  sku, slug, nome, marca, linha, categoria_id, subcategoria,
  preco_centavos, preco_de_centavos, preco_clube_centavos,
  imagem, galeria, nota, qtd_avaliacoes, estoque,
  destaque, generico, receita, farmacia_popular,
  tags, resumo, beneficios, descricao, modo_uso, ingredientes,
  especificacoes, aviso_legal, variacoes, relacionados, ordem
) values (
  'VIT-VTC-10', 'vitamina-c-1g-10-comprimidos-efervescentes', 'Vitamina C 1g 10 Comprimidos Efervescentes', 'Vitalis', 'Essenciais', 'vitaminas', 'Vitaminas',
  1490, 1990, 1267,
  'vit-c-eferv.svg', array['vit-c-eferv.svg']::text[], 4.4, 198, 92,
  false, false, false, null,
  '{}'::text[], 'Vitamina C efervescente de 1 g, sabor laranja. Dissolve rápido e é fácil de tomar.', array['1 g por comprimido', 'Contribui para o sistema imunológico', 'Sabor laranja, sem açúcar']::text[], '<p>A vitamina C é antioxidante e participa da formação do colágeno e da absorção do ferro de origem vegetal. A forma efervescente facilita a ingestão e a absorção.</p>', '<p>Dissolva 1 comprimido em um copo de água (200 ml) e beba em seguida, uma vez ao dia.</p>', '<p>Ácido ascórbico, bicarbonato de sódio, ácido cítrico, aroma de laranja, edulcorante sucralose.</p>',
  '[["Tipo de produto","Suplemento alimentar"],["Concentração","1 g por comprimido"],["Quantidade","10 comprimidos efervescentes"],["Sabor","Laranja"],["Açúcar","Não contém"],["País de origem","Brasil"]]'::jsonb, 'Este produto não é um medicamento. Não exceder a recomendação diária de consumo. Gestantes, nutrizes e crianças devem consultar o médico antes de consumir.', '[]'::jsonb, array['VIT-DEE-60', 'VIT-MAG-90']::text[], 26
) on conflict (sku) do update set
  slug = excluded.slug, nome = excluded.nome, marca = excluded.marca, linha = excluded.linha,
  categoria_id = excluded.categoria_id, subcategoria = excluded.subcategoria,
  preco_centavos = excluded.preco_centavos, preco_de_centavos = excluded.preco_de_centavos,
  preco_clube_centavos = excluded.preco_clube_centavos, imagem = excluded.imagem, galeria = excluded.galeria,
  nota = excluded.nota, qtd_avaliacoes = excluded.qtd_avaliacoes, estoque = excluded.estoque,
  destaque = excluded.destaque, generico = excluded.generico, receita = excluded.receita,
  farmacia_popular = excluded.farmacia_popular, tags = excluded.tags, resumo = excluded.resumo,
  beneficios = excluded.beneficios, descricao = excluded.descricao, modo_uso = excluded.modo_uso,
  ingredientes = excluded.ingredientes, especificacoes = excluded.especificacoes,
  aviso_legal = excluded.aviso_legal, variacoes = excluded.variacoes,
  relacionados = excluded.relacionados, ordem = excluded.ordem;

-- avaliações da carga inicial (sem conta associada; recarga substitui só estas)
delete from farmacia.avaliacoes where user_id is null;
insert into farmacia.avaliacoes (produto_sku, autor_nome, nota, titulo, texto, verificada, criado_em) values
  ('LUM-CPH-250', 'Camila R.', 5, 'Meu cabelo voltou a ter brilho', 'Uso há dois meses depois de uma progressiva que ressecou tudo. O desembaraço mudou completamente e não pesa, mesmo eu tendo cabelo fino.', true, '2026-08-28T12:00:00Z'),
  ('LUM-CPH-250', 'Juliana M.', 5, 'Rende muito', 'Um pote dura bastante porque precisa de pouquíssimo produto. Cheiro discreto, não enjoa.', true, '2026-08-14T12:00:00Z'),
  ('LUM-CPH-250', 'Patrícia L.', 4, 'Bom, mas o preço subiu', 'Produto excelente para cabelo cacheado, define sem deixar duro. Tirei uma estrela só porque achei caro fora de promoção.', true, '2026-07-30T12:00:00Z'),
  ('LUM-CPH-250', 'Renata S.', 5, 'Recomendo para cabelo cacheado', 'Faço fitagem com ele e os cachos ficam definidos o dia todo, sem frizz. Chegou bem embalado e dentro do prazo.', false, '2026-07-11T12:00:00Z'),
  ('LUM-CPH-250', 'Ana Beatriz', 4, 'Cumpre o que promete', 'Hidrata bem e o cabelo fica sedoso. Senti falta de uma embalagem com válvula pump, mas o produto em si é ótimo.', true, '2026-06-22T12:00:00Z');

-- lojas (recarga substitui a tabela inteira)
truncate farmacia.lojas restart identity;
insert into farmacia.lojas (nome, numero, cidade, uf, endereco, horario, telefone, plantao, ordem) values
  ('Bonfim Paulista', 'Loja 08', 'Ribeirão Preto', 'SP', 'Via Doutor Luiz Carlos Bianchi, 2995', 'Diariamente das 7h às 23h', '(16) 4042-0778', false, 1),
  ('Garibaldi', 'Loja 04', 'Ribeirão Preto', 'SP', 'Rua Garibaldi, 941', 'Diariamente das 7h às 23h', '(16) 4042-0778', false, 2),
  ('Jardim Cristo Redentor', 'Nova 02', 'Ribeirão Preto', 'SP', 'Av. Maximilliam Maggioni, 320', 'Diariamente das 7h às 23h', '(16) 4042-0778', false, 3),
  ('Jardim Paulista', 'Loja 09', 'Ribeirão Preto', 'SP', 'Rua Henrique Dumont, 736', 'Diariamente das 7h às 23h', '(16) 4042-0778', false, 4),
  ('Jardim Roberto Benedetti', 'Loja 10', 'Ribeirão Preto', 'SP', 'Rua Thereza Moreira Pastori, 56', 'Diariamente das 7h às 23h', '(16) 4042-0778', false, 5),
  ('Jardim das Palmeiras', 'Loja 15', 'Ribeirão Preto', 'SP', 'Av. Henry Nestlé, 1400', 'Diariamente das 7h às 23h', '(16) 4042-0778', false, 6),
  ('Lagoinha', '', 'Ribeirão Preto', 'SP', 'Rua Niterói, 886', 'Diariamente das 7h às 23h', '(16) 4042-0778', false, 7),
  ('Parque Ribeirão Preto', 'Loja 02', 'Ribeirão Preto', 'SP', 'Av. Luzitana, 824', 'Diariamente das 7h às 23h', '(16) 4042-0778', false, 8),
  ('Parque São Sebastião', '', 'Ribeirão Preto', 'SP', 'Rua Heron Domingues, 654', 'Diariamente das 7h às 23h', '(16) 4042-0778', false, 9),
  ('Planalto Verde', 'Loja 16', 'Ribeirão Preto', 'SP', 'Rua Sérgio Achê, 911', 'Aberta 24 horas', '(16) 4042-0778', true, 10),
  ('Ribeirão Verde', '', 'Ribeirão Preto', 'SP', 'Rua Emygidio Rosseto, 2537', 'Diariamente das 7h às 23h', '(16) 4042-0778', false, 11),
  ('Saudade', 'Loja 07', 'Ribeirão Preto', 'SP', 'Av. Saudade, 969', 'Diariamente das 7h às 23h', '(16) 4042-0778', false, 12),
  ('Rui Barbosa', '', 'Matão', 'SP', 'Rua Rui Barbosa, 980', 'Diariamente das 7h às 23h', '(16) 3384-6607', false, 13),
  ('XV de Novembro', '', 'Matão', 'SP', 'Av. XV de Novembro, 986', 'Diariamente das 7h às 23h', '(16) 3384-9300', false, 14),
  ('24 Horas', '', 'Pirassununga', 'SP', 'Rua Duque de Caxias, 1446', '24 horas', '(19) 3561-3010', true, 15),
  ('Centro', '', 'Pirassununga', 'SP', 'Rua Duque de Caxias, 1306', 'Diariamente das 7h às 23h', '(19) 3561-9266', false, 16),
  ('Jardim Oliveira', 'Loja 13', 'Jardinópolis', 'SP', 'Av. Belarmino Pereira de Oliveira, 483', 'Diariamente das 7h às 23h', '', false, 17);

-- serviços
insert into farmacia.servicos (id, icone, titulo, resumo, texto, ordem) values
  ('farmacia-popular', 'escudo', 'Farmácia Popular', 'Medicamentos gratuitos ou com desconto pelo programa do Ministério da Saúde.', 'A rede é credenciada ao programa e trabalha com os principais laboratórios nele incluídos. São gratuitos os medicamentos para hipertensão, diabetes e asma, e têm desconto os de dislipidemia, osteoporose, rinite, glaucoma, doença de Parkinson e anticoncepcionais. Leve documento com foto, CPF e a receita dentro da validade.', 1),
  ('injecoes', 'escudo', 'Injeções', 'Aplicação de injetáveis em sala apropriada, por profissional qualificado.', 'As lojas têm local reservado e equipe habilitada para aplicar medicamentos injetáveis. Traga a receita e o medicamento. Consulte a unidade mais próxima para confirmar os horários em que o serviço está disponível.', 2),
  ('afericoes', 'relogio', 'Aferições', 'Medição de pressão arterial e de glicose com equipe especializada.', 'Acompanhamento de rotina para quem controla pressão ou diabetes, feito por equipe treinada. É um serviço de acompanhamento: não substitui consulta médica nem exame laboratorial.', 3),
  ('pbm', 'medicamentos', 'PBM', 'Mais de 3.000 medicamentos de marca e genéricos com desconto de laboratório.', 'Os Programas de Benefício em Medicamentos aplicam o desconto do próprio laboratório direto no balcão, mediante cadastro e apresentação da receita. A rede trabalha com mais de 3.000 medicamentos de marca e genéricos para os mais variados tratamentos.', 4),
  ('convenios', 'cartao', 'Convênios', 'Descontos por convênio particular ou empresarial.', 'Empresas e entidades conveniadas garantem desconto a funcionários e associados, com compra identificada e desconto em folha quando o convênio prevê. Consulte se o seu convênio já é atendido pela rede.', 5),
  ('plantao', 'relogio', 'Atendimento 24 horas', 'Duas unidades de plantão, para quando a necessidade não espera.', 'Planalto Verde, em Ribeirão Preto, e a unidade 24 Horas, em Pirassununga, atendem em regime de plantão, todos os dias. As demais lojas funcionam diariamente das 7h às 23h.', 6),
  ('entrega', 'caminhao', 'Disk Entrega', 'Medicamentos e perfumaria entregues em casa, pedidos pelo WhatsApp.', 'Hoje o pedido é feito por telefone ou WhatsApp e passa por um atendente. Com a loja online, o mesmo pedido pode ser fechado pelo próprio cliente, a qualquer hora, com o frete calculado pelo CEP e sem ocupar ninguém no balcão.', 7),
  ('recarga', 'celular', 'Recarga de celular', 'Recarga das principais operadoras, na hora.', 'Recarga de crédito pré-pago das principais operadoras de telefonia móvel, feita no caixa em poucos segundos.', 8),
  ('estacionamento', 'carro', 'Estacionamento próprio', 'Todas as lojas da rede têm estacionamento para clientes.', 'Todas as unidades contam com estacionamento próprio, o que facilita a compra de volume e a retirada de pedidos feitos pelo site.', 9)
on conflict (id) do update set icone = excluded.icone, titulo = excluded.titulo, resumo = excluded.resumo, texto = excluded.texto, ordem = excluded.ordem;

-- faixas de frete (recarga substitui a tabela inteira)
truncate farmacia.faixas_frete restart identity;
insert into farmacia.faixas_frete (cep_inicio, cep_fim, uf, nome, base_centavos, prazo_dias, expresso) values
  (1000000, 19999999, 'SP', 'São Paulo', 1690, 2, true),
  (20000000, 28999999, 'RJ', 'Rio de Janeiro', 1990, 3, true),
  (29000000, 29999999, 'ES', 'Espírito Santo', 2290, 4, false),
  (30000000, 39999999, 'MG', 'Minas Gerais', 2190, 3, true),
  (40000000, 48999999, 'BA', 'Bahia', 2790, 6, false),
  (49000000, 56999999, 'NE', 'Nordeste', 2990, 7, false),
  (57000000, 63999999, 'NE', 'Nordeste', 2990, 7, false),
  (64000000, 69999999, 'NO', 'Norte', 3490, 9, false),
  (70000000, 76999999, 'DF', 'Distrito Federal e Goiás', 2390, 4, true),
  (77000000, 79999999, 'CO', 'Centro-Oeste', 2690, 6, false),
  (80000000, 87999999, 'PR', 'Paraná', 1990, 4, true),
  (88000000, 89999999, 'SC', 'Santa Catarina', 2190, 4, false),
  (90000000, 99999999, 'RS', 'Rio Grande do Sul', 2390, 5, false);

-- cupons
insert into farmacia.cupons (codigo, tipo, valor, descricao, minimo_centavos) values
  ('SAOCARLOS10', 'percentual', 0.1, '10% de desconto', null),
  ('PRIMEIRA20', 'percentual', 0.2, '20% na primeira compra', 12000),
  ('FRETEGRATIS', 'frete', 1, 'frete grátis', null)
on conflict (codigo) do update set tipo = excluded.tipo, valor = excluded.valor, descricao = excluded.descricao, minimo_centavos = excluded.minimo_centavos;
