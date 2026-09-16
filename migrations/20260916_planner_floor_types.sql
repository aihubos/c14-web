-- Expand supported drawing versions without changing ownership or sharing permissions.
do $migration$
declare definition text;
begin
 select pg_get_functiondef('public.c14_save_plan(uuid,jsonb,integer)'::regprocedure) into definition;
 if strpos(definition,$old$p_data->>'floorVersion' is distinct from '52a-v1'$old$)=0 then
  raise exception 'Expected floor validation was not found; inspect the function before applying';
 end if;
 definition=replace(definition,$old$p_data->>'floorVersion' is distinct from '52a-v1'$old$,$new$coalesce(p_data->>'floorVersion','') not in ('52a-v1','84a-v1','84b-v1')$new$);
 execute definition;
end
$migration$;
