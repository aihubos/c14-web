-- Run as database owner, e.g. psql "$C14_DATABASE_URL" -v ON_ERROR_STOP=1 -f backend-check.sql
-- All fixtures are rolled back; this verifies DB policies, not a person's email login.
begin;
insert into public.c14_posts(id,nickname,category,title,body,created_at)
values('14000000-0000-4000-8000-000000000001','확인용','질문','임시 확인용','이 기록은 트랜잭션 종료 시 사라집니다.',now()-interval '1 day');
set local role anon;
do $$
begin
  if public.c14_is_admin() then raise exception 'anonymous admin allowed'; end if;
  if public.c14_create_post('14000000-0000-4000-8000-000000000001','확인용','질문','임시 확인용','이 기록은 트랜잭션 종료 시 사라집니다.') <> '14000000-0000-4000-8000-000000000001'::uuid then raise exception 'retry failed'; end if;
  begin
    perform public.c14_create_post('14000000-0000-4000-8000-000000000001','확인용','질문','바뀐 제목','바뀐 내용을 조용히 버리면 안 됩니다.');
    raise exception 'changed retry silently accepted';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.c14_delete_post('14000000-0000-4000-8000-000000000001');
    raise exception 'anonymous delete allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.c14_create_post(gen_random_uuid(),'','','','');
    raise exception 'invalid post allowed';
  exception when invalid_parameter_value then null;
  end;
  begin
    insert into public.c14_posts(id,nickname,category,title,body) values(gen_random_uuid(),'x','질문','xx','xxxxx');
    raise exception 'direct insert allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
-- An unrelated verified identity must not gain access through user metadata.
insert into auth.users(id,aud,role,email,email_confirmed_at,raw_user_meta_data)
values('14000000-0000-4000-8000-000000000002','authenticated','authenticated','c14-check@example.invalid',now(),'{"email":"jeremylee0213@gmail.com","admin":true}');
select set_config('request.jwt.claims','{"sub":"14000000-0000-4000-8000-000000000002","role":"authenticated","email":"jeremylee0213@gmail.com"}',true);
set local role authenticated;
do $$
begin
  if public.c14_is_admin() then raise exception 'metadata impersonation allowed'; end if;
  begin
    perform public.c14_delete_post('14000000-0000-4000-8000-000000000001');
    raise exception 'non-admin delete allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
-- Positive/negative verified-email cases using a transaction-only fixture.
update auth.users set email='jeremylee0213@gmail.com',email_confirmed_at=null where id='14000000-0000-4000-8000-000000000002';
do $$ begin if public.c14_is_admin() then raise exception 'unverified email allowed'; end if; end; $$;
update auth.users set email_confirmed_at=now() where id='14000000-0000-4000-8000-000000000002';
set local role authenticated;
do $$
begin
  if not public.c14_is_admin() then raise exception 'verified admin denied'; end if;
  if not public.c14_delete_post('14000000-0000-4000-8000-000000000001') then raise exception 'admin delete failed'; end if;
end;
$$;
reset role;
do $$
declare before_count bigint; after_count bigint;
begin
  before_count := (public.c14_visit(null)->>'total')::bigint;
  perform public.c14_visit('14000000-0000-4000-8000-000000000003');
  after_count := (public.c14_visit('14000000-0000-4000-8000-000000000003')->>'total')::bigint;
  if after_count <> before_count+1 then raise exception 'visitor deduplication failed'; end if;
end;
$$;
rollback;
select 'C14 DB validation passed; fixtures rolled back' as result;
