begin;
create table public.c14_visit_days (
  day date not null,
  visitor_id uuid not null references public.c14_visitors(id),
  primary key(day,visitor_id)
);
alter table public.c14_visit_days enable row level security;
revoke all on public.c14_visit_days from anon, authenticated;
create table public.c14_metrics_start (id boolean primary key default true check(id), day date not null);
insert into public.c14_metrics_start values(true,(now() at time zone 'Asia/Seoul')::date);
alter table public.c14_metrics_start enable row level security;
revoke all on public.c14_metrics_start from anon, authenticated;
insert into public.c14_visit_days
select last_seen,id from public.c14_visitors where last_seen=(now() at time zone 'Asia/Seoul')::date;

create or replace function public.c14_visit(p_id uuid default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare d date := (now() at time zone 'Asia/Seoul')::date; t bigint; y bigint; total_count bigint; added bigint;
begin
  if p_id is not null then
    insert into public.c14_visitors(id,first_seen,last_seen) values(p_id,d,d)
    on conflict(id) do update set last_seen=excluded.last_seen where c14_visitors.last_seen<excluded.last_seen;
    insert into public.c14_visit_days values(d,p_id) on conflict do nothing;
  end if;
  select count(*) into t from public.c14_visit_days where day=d;
  if d>(select day from public.c14_metrics_start where id) then
    select count(*) into y from public.c14_visit_days where day=d-1;
  end if;
  select count(*),count(*) filter(where first_seen=d) into total_count,added from public.c14_visitors;
  return jsonb_build_object('today',t,'total',total_count,'date',d,'yesterday',y,'todayDelta',t-y,'totalDelta',added);
end; $$;
revoke all on function public.c14_visit(uuid) from public;
grant execute on function public.c14_visit(uuid) to anon,authenticated;

create table public.c14_article_days (
  article_id text not null, day date not null,
  comment_count integer not null check(comment_count>=0),
  reaction_count integer not null check(reaction_count>=0),
  checked_at timestamptz not null,
  primary key(article_id,day)
);
alter table public.c14_article_days enable row level security;
revoke all on public.c14_article_days from anon,authenticated;
create function public.c14_article_snapshot(p_id text,p_comments integer,p_reactions integer,p_checked_at timestamptz)
returns jsonb language plpgsql security definer set search_path='' as $$
declare d date := (p_checked_at at time zone 'Asia/Seoul')::date; previous public.c14_article_days;
begin
  if p_id is distinct from 'yonhap-newhome-20260907' or p_checked_at is null then raise exception 'Invalid article'; end if;
  select * into previous from public.c14_article_days where article_id=p_id and day=d-1;
  if p_comments is not null and p_reactions is not null then
    insert into public.c14_article_days values(p_id,d,p_comments,p_reactions,p_checked_at)
    on conflict(article_id,day) do update set comment_count=excluded.comment_count,reaction_count=excluded.reaction_count,checked_at=excluded.checked_at
    where c14_article_days.checked_at<excluded.checked_at;
  end if;
  return jsonb_build_object('commentDelta',p_comments-previous.comment_count,'reactionDelta',p_reactions-previous.reaction_count,'baselineCheckedAt',previous.checked_at);
end; $$;
revoke all on function public.c14_article_snapshot(text,integer,integer,timestamptz) from public;
grant execute on function public.c14_article_snapshot(text,integer,integer,timestamptz) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('c14-audit','c14-audit',false,10485760,array['application/pdf','application/vnd.openxmlformats-officedocument.presentationml.presentation']);

create table public.c14_download_attempts (client_key text primary key,window_start timestamptz not null default now(),failures integer not null default 0);
alter table public.c14_download_attempts enable row level security;
revoke all on public.c14_download_attempts from anon,authenticated;
create function public.c14_download_attempt(p_key text,p_failed boolean default false)
returns boolean language plpgsql security definer set search_path='' as $$
declare n integer;
begin
  if p_key is null or length(p_key)<>64 then return false; end if;
  delete from public.c14_download_attempts where window_start<now()-interval '1 day';
  if p_failed then
    insert into public.c14_download_attempts(client_key,failures) values(p_key,1)
    on conflict(client_key) do update set
      failures=case when c14_download_attempts.window_start<now()-interval '15 minutes' then 1 else c14_download_attempts.failures+1 end,
      window_start=case when c14_download_attempts.window_start<now()-interval '15 minutes' then now() else c14_download_attempts.window_start end
    returning failures into n;
  else
    select failures into n from public.c14_download_attempts where client_key=p_key and window_start>now()-interval '15 minutes';
  end if;
  return coalesce(n,0)<5;
end; $$;
revoke all on function public.c14_download_attempt(text,boolean) from public;
grant execute on function public.c14_download_attempt(text,boolean) to service_role;
commit;
