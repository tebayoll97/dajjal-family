-- Additive public profile fields for approved Blog contributors.
alter table public.df_blog_contributors
  add column if not exists bio_id text,
  add column if not exists bio_en text,
  add column if not exists avatar_url text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'df_blog_contributors_bio_id_length') then
    alter table public.df_blog_contributors add constraint df_blog_contributors_bio_id_length check (bio_id is null or char_length(bio_id) <= 600);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'df_blog_contributors_bio_en_length') then
    alter table public.df_blog_contributors add constraint df_blog_contributors_bio_en_length check (bio_en is null or char_length(bio_en) <= 600);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'df_blog_contributors_avatar_url_https') then
    alter table public.df_blog_contributors add constraint df_blog_contributors_avatar_url_https check (avatar_url is null or (avatar_url ~ '^https://' and char_length(avatar_url) <= 2000));
  end if;
end $$;
