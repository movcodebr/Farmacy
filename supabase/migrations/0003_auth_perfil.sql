-- Cadastro com perfil completo.
-- O formulário envia nome, CPF e celular em `data` (raw_user_meta_data).
-- Com "Confirm email" ligado o cadastro não devolve sessão, então o front não
-- consegue gravar o perfil depois: o trigger precisa copiar tudo na criação.
create or replace function farmacia.criar_cliente_ao_cadastrar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into farmacia.clientes (id, nome, email, cpf, telefone)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'nome', ''), 120),
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'cpf', ''), 20),
    left(coalesce(new.raw_user_meta_data ->> 'telefone', ''), 20)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
