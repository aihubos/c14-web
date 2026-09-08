create table public.c14_posts (
  id uuid primary key,
  nickname text not null check (char_length(btrim(nickname)) between 1 and 24),
  category text not null check (category in ('질문','의견','정보공유')),
  title text not null check (char_length(btrim(title)) between 2 and 100),
  body text not null check (char_length(btrim(body)) between 5 and 5000),
  created_at timestamptz not null default now()
);
create index c14_posts_created on public.c14_posts (created_at desc, id desc);
alter table public.c14_posts enable row level security;
revoke all on public.c14_posts from anon, authenticated;
grant select on public.c14_posts to anon, authenticated;
create policy c14_posts_read on public.c14_posts for select to anon, authenticated using (true);

create function public.c14_is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from auth.users u
    where u.id = (select auth.uid())
      and u.email_confirmed_at is not null
      and lower(u.email) = 'jeremylee0213@gmail.com'
      and (u.banned_until is null or u.banned_until < now()));
$$;
revoke all on function public.c14_is_admin() from public;
grant execute on function public.c14_is_admin() to anon, authenticated;

create function public.c14_create_post(
  p_id uuid, p_nickname text, p_category text, p_title text, p_body text, p_website text default ''
) returns uuid language plpgsql security definer set search_path = ''
as $$
begin
  if p_id is null or p_website is distinct from '' then
    raise exception '입력 내용을 확인해 주세요.' using errcode = '22023';
  end if;
  if p_nickname is null or char_length(btrim(p_nickname)) not between 1 and 24
    or p_category is null or p_category not in ('질문','의견','정보공유')
    or p_title is null or char_length(btrim(p_title)) not between 2 and 100
    or p_body is null or char_length(btrim(p_body)) not between 5 and 5000 then
    raise exception '별명·제목·내용의 길이를 확인해 주세요.' using errcode = '22023';
  end if;
  -- ponytail: 610세대 게시판의 전체 등록 제한. 이용량이 늘면 IP 기반 게이트웨이 제한으로 이전.
  perform pg_catalog.pg_advisory_xact_lock(14092026);
  if exists (select 1 from public.c14_posts where id = p_id) then
    if exists (select 1 from public.c14_posts where id = p_id
      and (nickname,category,title,body) = (btrim(p_nickname),p_category,btrim(p_title),btrim(p_body))) then return p_id; end if;
    raise exception '이전 요청이 이미 저장되었습니다. 목록을 확인한 뒤 새 글로 등록해 주세요.' using errcode = '22023';
  end if;
  if exists (select 1 from public.c14_posts where created_at > now() - interval '3 seconds')
    or (select count(*) from public.c14_posts where created_at > now() - interval '1 day') >= 200 then
    raise exception '등록이 많습니다. 잠시 후 다시 시도해 주세요.' using errcode = 'P0001';
  end if;
  insert into public.c14_posts (id,nickname,category,title,body)
  values (p_id,btrim(p_nickname),p_category,btrim(p_title),btrim(p_body));
  return p_id;
end;
$$;
revoke all on function public.c14_create_post(uuid,text,text,text,text,text) from public;
grant execute on function public.c14_create_post(uuid,text,text,text,text,text) to anon, authenticated;

create function public.c14_delete_post(p_id uuid) returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.c14_is_admin() then
    raise exception '관리자 인증이 필요합니다.' using errcode = '42501';
  end if;
  delete from public.c14_posts where id = p_id;
  return found;
end;
$$;
revoke all on function public.c14_delete_post(uuid) from public;
grant execute on function public.c14_delete_post(uuid) to authenticated;

create table public.c14_visitors (
  id uuid primary key,
  first_seen date not null default (now() at time zone 'Asia/Seoul')::date,
  last_seen date not null default (now() at time zone 'Asia/Seoul')::date
);
create index c14_visitors_last_seen on public.c14_visitors(last_seen);
alter table public.c14_visitors enable row level security;
revoke all on public.c14_visitors from anon, authenticated;

create function public.c14_visit(p_id uuid default null) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare today_kst date := (now() at time zone 'Asia/Seoul')::date;
begin
  if p_id is not null then
    insert into public.c14_visitors(id, first_seen, last_seen) values (p_id,today_kst,today_kst)
    on conflict (id) do update set last_seen=excluded.last_seen
    where c14_visitors.last_seen <> excluded.last_seen;
  end if;
  -- ponytail: 소규모 입주민 사이트에서 누적 브라우저 수를 직접 집계. 대규모일 때 일별 집계 테이블로 이전.
  return (select jsonb_build_object('today',count(*) filter(where last_seen=today_kst),'total',count(*),'date',today_kst)
    from public.c14_visitors);
end;
$$;
revoke all on function public.c14_visit(uuid) from public;
grant execute on function public.c14_visit(uuid) to anon, authenticated;
