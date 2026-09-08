create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
select cron.schedule('c14-article-15min','*/15 * * * *', $job$
select net.http_get(url:='https://gledekahwxiofzpfybdg.supabase.co/functions/v1/article-counts',headers:='{"apikey":"sb_publishable_Ax3jGUOpRvTDwTGJrkpEhQ_nhXFpx2F","Authorization":"Bearer sb_publishable_Ax3jGUOpRvTDwTGJrkpEhQ_nhXFpx2F"}'::jsonb,timeout_milliseconds:=15000);
$job$);
-- pg_cron uses UTC; 14:59 UTC is 23:59 Asia/Seoul.
select cron.schedule('c14-article-kst-final','59 14 * * *', $job$
select net.http_get(url:='https://gledekahwxiofzpfybdg.supabase.co/functions/v1/article-counts',headers:='{"apikey":"sb_publishable_Ax3jGUOpRvTDwTGJrkpEhQ_nhXFpx2F","Authorization":"Bearer sb_publishable_Ax3jGUOpRvTDwTGJrkpEhQ_nhXFpx2F"}'::jsonb,timeout_milliseconds:=15000);
$job$);
