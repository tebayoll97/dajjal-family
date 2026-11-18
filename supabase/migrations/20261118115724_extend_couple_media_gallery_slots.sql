alter table public.df_couple_media drop constraint if exists df_couple_media_slot_key_check;
alter table public.df_couple_media add constraint df_couple_media_slot_key_check
check (slot_key in ('cover','male_portrait','female_portrait','gallery_1','gallery_2','gallery_3','gallery_4','gallery_5','gallery_6'));
comment on table public.df_couple_media is 'Google Drive file ID references for cover, two portraits, and up to six gallery images. No voice-note media.';
