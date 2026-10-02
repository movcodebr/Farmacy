-- =========================================================================
-- Drogaria São Carlos — esquema do banco (Supabase / PostgreSQL)
--
-- Tudo vive no schema `farmacia`. Depois de aplicar, exponha o schema em
-- Project Settings → API → Exposed schemas (adicione `farmacia`).
--
-- Convenções:
--   * dinheiro é sempre inteiro em centavos (sem float);
--   * catálogo: leitura pública, escrita só com service_role;
--   * dados de cliente e pedidos: só o próprio dono enxerga.
-- =========================================================================

create schema if not exists farmacia;

grant usage on schema farmacia to anon, authenticated, service_role;

-- ------------------------------------------------------------------ utilitário
create or replace function farmacia.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- ------------------------------------------------------------------ catálogo
create table farmacia.categorias (
  id     text primary key,
  nome   text not null,
  icone  text not null,
  ordem  integer not null default 0
);

create table farmacia.produtos (
  sku                  text primary key,
  slug                 text not null unique,
  nome                 text not null,
  marca                text not null,
  linha                text,
  categoria_id         text not null references farmacia.categorias (id),
  subcategoria         text,

  preco_centavos       integer not null check (preco_centavos >= 0),
  preco_de_centavos    integer check (preco_de_centavos >= 0),
  preco_clube_centavos integer check (preco_clube_centavos >= 0),

  imagem               text not null,
  galeria              text[] not null default '{}',

  nota                 numeric(2, 1) not null default 0 check (nota between 0 and 5),
  qtd_avaliacoes       integer not null default 0 check (qtd_avaliacoes >= 0),
  estoque              integer not null default 0 check (estoque >= 0),

  destaque             boolean not null default false,
  generico             boolean not null default false,
  receita              boolean not null default false,   -- venda sob prescrição
  farmacia_popular     text check (farmacia_popular in ('gratuito', 'desconto')),

  tags                 text[] not null default '{}',
  resumo               text,
  beneficios           text[] not null default '{}',
  descricao            text,
  modo_uso             text,
  ingredientes         text,
  especificacoes       jsonb not null default '[]'::jsonb,   -- [[rótulo, valor], ...]
  aviso_legal          text,
  variacoes            jsonb not null default '[]'::jsonb,   -- [{id, rotulo, detalhe, preco_centavos, preco_de_centavos, padrao}]
  relacionados         text[] not null default '{}',

  ordem                integer not null default 0,           -- sequência curada da vitrine
  criado_em            timestamptz not null default now(),
  atualizado_em        timestamptz not null default now()
);

create index produtos_categoria_idx on farmacia.produtos (categoria_id);
create index produtos_ordem_idx     on farmacia.produtos (ordem);
create index produtos_destaque_idx  on farmacia.produtos (destaque) where destaque;

create trigger produtos_atualizado_em
  before update on farmacia.produtos
  for each row execute function farmacia.tocar_atualizado_em();

create table farmacia.lojas (
  id        integer generated always as identity primary key,
  nome      text not null,
  numero    text not null default '',
  cidade    text not null,
  uf        char(2) not null,
  endereco  text not null,
  horario   text not null,
  telefone  text not null default '',
  plantao   boolean not null default false,
  ordem     integer not null default 0
);

create table farmacia.servicos (
  id      text primary key,
  icone   text not null,
  titulo  text not null,
  resumo  text not null,
  texto   text not null,
  ordem   integer not null default 0
);

create table farmacia.faixas_frete (
  id            integer generated always as identity primary key,
  cep_inicio    integer not null,
  cep_fim       integer not null,
  uf            text not null,
  nome          text not null,
  base_centavos integer not null check (base_centavos >= 0),
  prazo_dias    integer not null check (prazo_dias > 0),
  expresso      boolean not null default false,
  check (cep_fim >= cep_inicio)
);

create table farmacia.cupons (
  codigo          text primary key,
  tipo            text not null check (tipo in ('percentual', 'frete')),
  valor           numeric not null check (valor >= 0),
  descricao       text not null,
  minimo_centavos integer check (minimo_centavos >= 0),
  ativo           boolean not null default true
);

-- ------------------------------------------------------------------ clientes
-- Perfil do cliente, 1:1 com auth.users (o login é do Supabase Auth).
create table farmacia.clientes (
  id            uuid primary key references auth.users (id) on delete cascade,
  nome          text not null default '',
  email         text not null default '',
  cpf           text not null default '',
  telefone      text not null default '',
  clube         boolean not null default true,   -- Clube São Carlos é gratuito
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create trigger clientes_atualizado_em
  before update on farmacia.clientes
  for each row execute function farmacia.tocar_atualizado_em();

-- Cria o perfil automaticamente quando alguém se cadastra.
create or replace function farmacia.criar_cliente_ao_cadastrar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into farmacia.clientes (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger cliente_ao_cadastrar
  after insert on auth.users
  for each row execute function farmacia.criar_cliente_ao_cadastrar();

create table farmacia.enderecos (
  id           bigint generated always as identity primary key,
  cliente_id   uuid not null references farmacia.clientes (id) on delete cascade,
  cep          text not null,
  rua          text not null,
  numero       text not null,
  complemento  text not null default '',
  bairro       text not null,
  cidade       text not null,
  uf           char(2) not null,
  criado_em    timestamptz not null default now(),
  unique (cliente_id, cep)          -- o site salva um endereço por CEP
);

create index enderecos_cliente_idx on farmacia.enderecos (cliente_id);

-- ------------------------------------------------------------------ avaliações
create table farmacia.avaliacoes (
  id          bigint generated always as identity primary key,
  produto_sku text not null references farmacia.produtos (sku) on delete cascade,
  user_id     uuid references auth.users (id) on delete set null,  -- nulo nas avaliações da carga inicial
  autor_nome  text not null,
  nota        smallint not null check (nota between 1 and 5),
  titulo      text not null check (char_length(titulo) <= 120),
  texto       text not null check (char_length(texto) <= 2000),
  verificada  boolean not null default false,
  criado_em   timestamptz not null default now()
);

create index avaliacoes_produto_idx on farmacia.avaliacoes (produto_sku, criado_em desc);
-- cada conta avalia um produto uma única vez
create unique index avaliacoes_uma_por_conta_idx
  on farmacia.avaliacoes (produto_sku, user_id) where user_id is not null;

-- ------------------------------------------------------------------ pedidos
-- Pedido e itens guardam nome e preço da época: o catálogo muda, o pedido não.
create table farmacia.pedidos (
  id                 bigint generated always as identity primary key,
  numero             text not null unique,                 -- ex.: DSC-123456
  cliente_id         uuid references farmacia.clientes (id) on delete set null,

  cliente_nome       text not null,
  cliente_email      text not null,
  cliente_cpf        text not null default '',
  cliente_telefone   text not null default '',

  entrega_cep        text not null,
  entrega_rua        text not null,
  entrega_numero     text not null,
  entrega_complemento text not null default '',
  entrega_bairro     text not null,
  entrega_cidade     text not null,
  entrega_uf         char(2) not null,

  frete_nome         text not null,
  frete_prazo        text not null,
  frete_centavos     integer not null check (frete_centavos >= 0),

  pagamento          text not null check (pagamento in ('pix', 'cartao', 'boleto')),
  cupom              text,

  subtotal_centavos  integer not null check (subtotal_centavos >= 0),
  desconto_centavos  integer not null default 0 check (desconto_centavos >= 0),
  total_centavos     integer not null check (total_centavos >= 0),

  status             text not null default 'aguardando_pagamento'
                     check (status in ('aguardando_pagamento', 'em_analise', 'pago',
                                       'em_separacao', 'enviado', 'entregue', 'cancelado')),
  criado_em          timestamptz not null default now(),
  atualizado_em      timestamptz not null default now()
);

create index pedidos_cliente_idx on farmacia.pedidos (cliente_id, criado_em desc);

create trigger pedidos_atualizado_em
  before update on farmacia.pedidos
  for each row execute function farmacia.tocar_atualizado_em();

create table farmacia.itens_pedido (
  id             bigint generated always as identity primary key,
  pedido_id      bigint not null references farmacia.pedidos (id) on delete cascade,
  sku            text not null,                -- sem FK: o item sobrevive à saída do produto do catálogo
  nome           text not null,
  marca          text not null default '',
  imagem         text not null default '',
  rotulo         text,                         -- variação escolhida (ex.: "250 ml")
  preco_centavos integer not null check (preco_centavos >= 0),
  qtd            integer not null check (qtd > 0)
);

create index itens_pedido_pedido_idx on farmacia.itens_pedido (pedido_id);

-- ------------------------------------------------------------------ RLS
alter table farmacia.categorias    enable row level security;
alter table farmacia.produtos      enable row level security;
alter table farmacia.lojas         enable row level security;
alter table farmacia.servicos      enable row level security;
alter table farmacia.faixas_frete  enable row level security;
alter table farmacia.cupons        enable row level security;
alter table farmacia.avaliacoes    enable row level security;
alter table farmacia.clientes      enable row level security;
alter table farmacia.enderecos     enable row level security;
alter table farmacia.pedidos       enable row level security;
alter table farmacia.itens_pedido  enable row level security;

-- Catálogo: leitura pública. Escrita: nenhuma policy → só service_role (ignora RLS).
create policy "catalogo_leitura" on farmacia.categorias   for select to anon, authenticated using (true);
create policy "catalogo_leitura" on farmacia.produtos     for select to anon, authenticated using (true);
create policy "catalogo_leitura" on farmacia.lojas        for select to anon, authenticated using (true);
create policy "catalogo_leitura" on farmacia.servicos     for select to anon, authenticated using (true);
create policy "catalogo_leitura" on farmacia.faixas_frete for select to anon, authenticated using (true);
create policy "cupons_ativos_leitura" on farmacia.cupons  for select to anon, authenticated using (ativo);

-- Avaliações: qualquer um lê; avaliar exige conta; só apaga a própria.
create policy "avaliacoes_leitura" on farmacia.avaliacoes
  for select to anon, authenticated using (true);

create policy "avaliacoes_inserir_propria" on farmacia.avaliacoes
  for insert to authenticated
  with check (user_id = (select auth.uid()) and verificada = false);

create policy "avaliacoes_apagar_propria" on farmacia.avaliacoes
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- Cliente: vê e edita só o próprio perfil (o perfil nasce pelo trigger do cadastro).
create policy "clientes_ler_proprio" on farmacia.clientes
  for select to authenticated using (id = (select auth.uid()));

create policy "clientes_editar_proprio" on farmacia.clientes
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Endereços: CRUD só do dono.
create policy "enderecos_ler_proprios" on farmacia.enderecos
  for select to authenticated using (cliente_id = (select auth.uid()));

create policy "enderecos_inserir_proprios" on farmacia.enderecos
  for insert to authenticated with check (cliente_id = (select auth.uid()));

create policy "enderecos_editar_proprios" on farmacia.enderecos
  for update to authenticated
  using (cliente_id = (select auth.uid()))
  with check (cliente_id = (select auth.uid()));

create policy "enderecos_apagar_proprios" on farmacia.enderecos
  for delete to authenticated using (cliente_id = (select auth.uid()));

-- Pedidos: o dono só lê. Criar e mudar status é com service_role (Edge Function
-- do pagamento), que recalcula preço no servidor em vez de confiar no navegador.
create policy "pedidos_ler_proprios" on farmacia.pedidos
  for select to authenticated using (cliente_id = (select auth.uid()));

create policy "itens_ler_proprios" on farmacia.itens_pedido
  for select to authenticated
  using (exists (
    select 1 from farmacia.pedidos p
    where p.id = itens_pedido.pedido_id and p.cliente_id = (select auth.uid())
  ));

-- ------------------------------------------------------------------ privilégios
-- O RLS decide as linhas; os GRANTs decidem quem chega na tabela.
grant select on farmacia.categorias, farmacia.produtos, farmacia.lojas,
                farmacia.servicos, farmacia.faixas_frete, farmacia.cupons,
                farmacia.avaliacoes
  to anon, authenticated;

-- inserir avaliação: só as colunas que o cliente pode preencher (não `verificada`)
grant insert (produto_sku, user_id, autor_nome, nota, titulo, texto)
  on farmacia.avaliacoes to authenticated;
grant delete on farmacia.avaliacoes to authenticated;

grant select on farmacia.clientes to authenticated;
grant update (nome, telefone, cpf, clube) on farmacia.clientes to authenticated;

grant select, insert, update, delete on farmacia.enderecos to authenticated;
grant select on farmacia.pedidos, farmacia.itens_pedido to authenticated;

grant all on all tables    in schema farmacia to service_role;
grant all on all sequences in schema farmacia to service_role;
grant usage on all sequences in schema farmacia to authenticated;
