-- Um cadastro por e-mail, CPF e celular.
--
-- E-mail: o Supabase Auth já garante (auth.users). CPF e celular não tinham
-- trava nenhuma. Aqui ficam as travas no banco (que valem mesmo se alguém
-- chamar a API direto, sem passar pelo site) e uma função de checagem para o
-- formulário mostrar uma mensagem clara antes de tentar cadastrar.
--
-- ANTES DE RODAR: se já existem contas de teste com o mesmo CPF ou celular,
-- a criação dos índices falha. Procure e apague as duplicatas:
--
--   select farmacia.normaliza_cpf(cpf) as cpf, count(*)
--     from farmacia.clientes where farmacia.normaliza_cpf(cpf) <> ''
--    group by 1 having count(*) > 1;
--   select farmacia.normaliza_tel(telefone) as tel, count(*)
--     from farmacia.clientes where farmacia.normaliza_tel(telefone) <> ''
--    group by 1 having count(*) > 1;
--
-- (as funções abaixo precisam existir para essas consultas: rode a migration
-- primeiro até o fim do bloco 1, ou apague as contas de teste em
-- Authentication → Users.)

-- 1) Normalização: "123.456.789-09" e "12345678909" são o mesmo CPF;
--    "(16) 99999-9999" e "+55 16 99999-9999" são o mesmo celular.
create or replace function farmacia.normaliza_cpf(t text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select regexp_replace(coalesce(t, ''), '\D', '', 'g')
$$;

create or replace function farmacia.normaliza_tel(t text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select case when length(d) > 11 and left(d, 2) = '55' then substr(d, 3) else d end
    from (select regexp_replace(coalesce(t, ''), '\D', '', 'g') as d) x
$$;

-- 2) Travas. Campo vazio não conta (clientes antigos podem não ter CPF).
create unique index clientes_cpf_unico
  on farmacia.clientes (farmacia.normaliza_cpf(cpf))
  where farmacia.normaliza_cpf(cpf) <> '';

create unique index clientes_telefone_unico
  on farmacia.clientes (farmacia.normaliza_tel(telefone))
  where farmacia.normaliza_tel(telefone) <> '';

-- 3) Checagem para o formulário de cadastro.
--    - e-mail: só conta se a conta já foi confirmada. Se ainda não foi, o
--      cadastro segue e o Supabase reenvia o e-mail de confirmação.
--    - CPF/celular: ignora a linha que pertence ao mesmo e-mail (quem se
--      cadastrou, não confirmou e está tentando de novo).
create or replace function farmacia.cadastro_em_uso(p_email text, p_cpf text, p_telefone text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'email',
      trim(coalesce(p_email, '')) <> '' and exists (
        select 1 from auth.users u
         where lower(u.email) = lower(trim(p_email))
           and u.email_confirmed_at is not null),
    'cpf',
      farmacia.normaliza_cpf(p_cpf) <> '' and exists (
        select 1 from farmacia.clientes c
          join auth.users u on u.id = c.id
         where farmacia.normaliza_cpf(c.cpf) = farmacia.normaliza_cpf(p_cpf)
           and lower(coalesce(u.email, '')) <> lower(trim(coalesce(p_email, '')))),
    'telefone',
      farmacia.normaliza_tel(p_telefone) <> '' and exists (
        select 1 from farmacia.clientes c
          join auth.users u on u.id = c.id
         where farmacia.normaliza_tel(c.telefone) = farmacia.normaliza_tel(p_telefone)
           and lower(coalesce(u.email, '')) <> lower(trim(coalesce(p_email, ''))))
  )
$$;

revoke all on function farmacia.cadastro_em_uso(text, text, text) from public;
grant execute on function farmacia.cadastro_em_uso(text, text, text) to anon, authenticated;

-- 4) OPCIONAL — libera CPF e celular de cadastros que nunca foram confirmados
--    (o Supabase não apaga esses usuários sozinho). Exige a extensão pg_cron
--    (Database → Extensions). Remova o comentário para ativar:
--
-- select cron.schedule(
--   'limpar-cadastros-nao-confirmados', '0 3 * * *',
--   $$ delete from auth.users
--       where email_confirmed_at is null and created_at < now() - interval '3 days' $$);
