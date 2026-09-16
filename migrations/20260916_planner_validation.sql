-- Additional validation for the already provisioned c14_plans RPC-only table.
begin;
create or replace function public.c14_validate_plan_row() returns trigger language plpgsql set search_path='' as $$
declare i jsonb; ids text[]:=array[]::text[];
begin
 for i in select value from jsonb_array_elements(new.data->'items') loop
  if coalesce(i->>'id','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' or (i->>'id')=any(ids) then raise exception '가구 식별자 오류';end if;
  ids:=array_append(ids,i->>'id');
  if coalesce(i->>'type','') not in ('sofa','corner-sofa','tv','coffee','bed','nightstand','wardrobe','drawers','vanity','dining','round-table','chair','fridge','desk','bookshelf','washer','dryer','custom') then raise exception '가구 종류 오류';end if;
  if jsonb_typeof(i->'name') is distinct from 'string' or length(btrim(i->>'name'))=0 or jsonb_typeof(i->'note') is distinct from 'string' or jsonb_typeof(i->'url') is distinct from 'string' or jsonb_typeof(i->'locked') is distinct from 'boolean' or coalesce(i->>'color','') !~* '^#[0-9a-f]{6}$' then raise exception '가구 상세 정보 오류';end if;
  if i->>'url'<>'' and i->>'url' !~* '^https?://[^[:space:]]+$' then raise exception '제품 링크 오류';end if;
 end loop;return new;
end $$;
create trigger c14_plans_validate before insert or update on public.c14_plans for each row execute function public.c14_validate_plan_row();
revoke all on function public.c14_validate_plan_row() from public;
commit;
