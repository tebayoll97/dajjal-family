-- DAJJAL AI Memory Cloud: structured memory, public/private governance, and retrieval.
create extension if not exists vector with schema extensions;

create table if not exists public.dajjal_ai_memory_documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  content text not null,
  memory_type text not null check (memory_type in ('identity','project_knowledge','technical_knowledge','operational_memory','episodic_memory','learning_memory')),
  visibility text not null default 'private' check (visibility in ('private','public')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  source_type text not null default 'curated',
  source_ref text,
  source_url text,
  language text not null default 'id',
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by text not null default 'DAJJAL AI Memory Curator',
  verified_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dajjal_ai_memory_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.dajjal_ai_memory_documents(id) on delete cascade,
  chunk_index integer not null default 0,
  content text not null,
  embedding extensions.vector(384),
  embedding_model text,
  embedded_at timestamptz,
  search_tsv tsvector generated always as (to_tsvector('simple', coalesce(content, ''))) stored,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(document_id, chunk_index)
);

create index if not exists dajjal_ai_memory_documents_visibility_status_idx on public.dajjal_ai_memory_documents (visibility, status, memory_type);
create index if not exists dajjal_ai_memory_documents_tags_idx on public.dajjal_ai_memory_documents using gin (tags);
create index if not exists dajjal_ai_memory_chunks_document_idx on public.dajjal_ai_memory_chunks (document_id, chunk_index);
create index if not exists dajjal_ai_memory_chunks_search_idx on public.dajjal_ai_memory_chunks using gin (search_tsv);
create index if not exists dajjal_ai_memory_chunks_embedding_idx on public.dajjal_ai_memory_chunks using hnsw (embedding vector_cosine_ops) where embedding is not null;

create or replace function public.dajjal_ai_memory_set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dajjal_ai_memory_documents_updated_at on public.dajjal_ai_memory_documents;
create trigger dajjal_ai_memory_documents_updated_at
before update on public.dajjal_ai_memory_documents
for each row execute function public.dajjal_ai_memory_set_updated_at();

alter table public.dajjal_ai_memory_documents enable row level security;
alter table public.dajjal_ai_memory_chunks enable row level security;

drop policy if exists "Public can read published DAJJAL AI memory" on public.dajjal_ai_memory_documents;
create policy "Public can read published DAJJAL AI memory"
on public.dajjal_ai_memory_documents for select to anon, authenticated
using (visibility = 'public' and status = 'published');

drop policy if exists "Public can read chunks of published DAJJAL AI memory" on public.dajjal_ai_memory_chunks;
create policy "Public can read chunks of published DAJJAL AI memory"
on public.dajjal_ai_memory_chunks for select to anon, authenticated
using (exists (
  select 1 from public.dajjal_ai_memory_documents d
  where d.id = document_id and d.visibility = 'public' and d.status = 'published'
));

revoke all on public.dajjal_ai_memory_documents from anon, authenticated;
revoke all on public.dajjal_ai_memory_chunks from anon, authenticated;
grant select on public.dajjal_ai_memory_documents to anon, authenticated;
grant select on public.dajjal_ai_memory_chunks to anon, authenticated;
grant all on public.dajjal_ai_memory_documents to service_role;
grant all on public.dajjal_ai_memory_chunks to service_role;

create or replace function public.search_dajjal_ai_memory(
  query_embedding extensions.vector(384),
  match_threshold float default 0.35,
  match_count integer default 8
)
returns table (
  chunk_id uuid, document_id uuid, slug text, title text, summary text, content text,
  memory_type text, visibility text, status text, source_type text, source_url text,
  language text, tags text[], similarity float
)
language sql stable security invoker set search_path = public, extensions
as $$
  select c.id, d.id, d.slug, d.title, d.summary, c.content, d.memory_type,
    d.visibility, d.status, d.source_type, d.source_url, d.language, d.tags,
    (1 - (c.embedding <=> query_embedding))::float
  from public.dajjal_ai_memory_chunks c
  join public.dajjal_ai_memory_documents d on d.id = c.document_id
  where c.embedding is not null
    and (1 - (c.embedding <=> query_embedding)) >= greatest(-1, least(match_threshold, 1))
  order by c.embedding <=> query_embedding
  limit greatest(1, least(match_count, 30));
$$;

create or replace function public.search_dajjal_ai_memory_keyword(query_text text, match_count integer default 10)
returns table (
  chunk_id uuid, document_id uuid, slug text, title text, summary text, content text,
  memory_type text, visibility text, status text, source_type text, source_url text,
  language text, tags text[], rank real
)
language sql stable security invoker set search_path = public
as $$
  select c.id, d.id, d.slug, d.title, d.summary, c.content, d.memory_type,
    d.visibility, d.status, d.source_type, d.source_url, d.language, d.tags,
    ts_rank(c.search_tsv, websearch_to_tsquery('simple', query_text))::real
  from public.dajjal_ai_memory_chunks c
  join public.dajjal_ai_memory_documents d on d.id = c.document_id
  where nullif(trim(query_text), '') is not null
    and c.search_tsv @@ websearch_to_tsquery('simple', query_text)
  order by ts_rank(c.search_tsv, websearch_to_tsquery('simple', query_text)) desc
  limit greatest(1, least(match_count, 30));
$$;

grant execute on function public.search_dajjal_ai_memory(extensions.vector, float, integer) to anon, authenticated, service_role;
grant execute on function public.search_dajjal_ai_memory_keyword(text, integer) to anon, authenticated, service_role;

insert into public.dajjal_ai_memory_documents
(slug,title,summary,content,memory_type,visibility,status,source_type,language,tags,metadata,verified_at,published_at)
values
('dajjal-ai-public-identity','DAJJAL AI — Public Identity','DAJJAL AI is the digital intelligence initiative of the DAJJAL FAMILY ecosystem.','DAJJAL AI is the digital intelligence initiative of the DAJJAL FAMILY ecosystem. It is being developed as an AI brand with its own identity, knowledge base, memory, research workflows, and application interfaces. Its knowledge system is designed to distinguish public information from private operational memory. Public knowledge is published deliberately and can be accessed through approved public experiences. DAJJAL AI may use external foundation models while retaining ownership of its identity, curated knowledge, memory architecture, and orchestration.','identity','public','published','curated','en',array['DAJJAL AI','identity','public knowledge','AI brand'],'{"record_kind":"public_brand_overview","curation":"initial_foundation"}'::jsonb,now(),now()),
('dajjal-ai-core-identity','DAJJAL AI Core Identity','Internal identity and purpose of DAJJAL AI.','DAJJAL AI is the intelligence system being built for the DAJJAL FAMILY ecosystem and as a future independent AI brand. It must have a consistent identity, durable memory, research capability, knowledge retrieval, task orchestration, and auditable operational history. The system may use third-party foundation models; it must not claim to own or train a proprietary foundation model unless that work is actually completed. Its identity and curated knowledge remain controlled by the project owner.','identity','private','published','curated','id',array['identity','mission','brand','foundation'],'{"authority":"owner-controlled","version":1}'::jsonb,now(),null),
('dajjal-ai-operating-principles','DAJJAL AI Operating Principles','Rules for trustworthy memory and action.','DAJJAL AI must distinguish verified facts, explicit decisions, plans, assumptions, and historical records. It must not present a planned feature as completed. It must preserve source provenance and timestamps. It must not invent URLs, citations, data, or successful deployment claims. It must report whether an action was planned, executed, and verified. It must not expose secrets, credentials, private conversations, or personal sensitive data in public memory. Public publication requires deliberate curation. The project owner retains ultimate control over permissions and irreversible actions.','operational_memory','private','published','curated','id',array['principles','safety','verification','permissions'],'{"authority":"owner-controlled","version":1}'::jsonb,now(),null),
('dajjal-family-project-context','DAJJAL FAMILY Project Context','Internal technical and product context for the DAJJAL FAMILY ecosystem.','DAJJAL FAMILY is a bilingual Indonesian and English digital ecosystem using a dark military visual direction with black and charcoal foundations and crimson accents. Its website uses Next.js and Vercel, with Supabase for PostgreSQL, authentication, storage, and backend services, and GitHub for source control and project documentation. The ecosystem includes a public website, blog, admin dashboard, community and Discord plans, and DAJJAL AI article automation. Mobile-first compact interfaces, reusable design tokens, global CSS, SEO, and consistent shared components are established project preferences. Existing project facts must be checked against current code and database before being treated as current implementation status.','project_knowledge','private','published','curated','id',array['DAJJAL FAMILY','Next.js','Vercel','Supabase','GitHub','architecture'],'{"repo":"tebayoll97/dajjal-family","branch":"main","supabase_project":"kdcetzubnjtjcedusxav","version":1}'::jsonb,now(),null),
('dajjal-ai-memory-governance','DAJJAL AI Memory Governance','Memory classes, visibility rules, provenance, and lifecycle.','DAJJAL AI memory is organized into identity, project knowledge, technical knowledge, operational memory, episodic memory, and learning memory. Each record must have a source type and, when available, a source reference or URL. Records must be classified as private or public and draft, published, or archived. Public users may read only records explicitly marked public and published. Public visitors cannot create, edit, or delete canonical memory records directly. Contributions may be accepted through a separate submission workflow and require curation before publication. Private memory must never be exposed by a public search endpoint.','operational_memory','private','published','curated','id',array['memory','governance','privacy','public-private'],'{"version":1}'::jsonb,now(),null),
('dajjal-ai-memory-architecture','DAJJAL AI Memory Architecture','Supabase is the active memory store; GitHub and Akashic Record have separate roles.','The DAJJAL AI Memory Cloud uses Supabase PostgreSQL as the active structured memory store and pgvector for semantic retrieval. Supabase Storage may hold approved source files and archives. Vercel hosts application routes and the memory API. GitHub stores source code, SQL migrations, and architecture documentation. Akashic Record remains the historical project chronicle and curated reference archive; it is not the only live database. Public and private memory are separated using visibility and publication status, with Row Level Security enforcing public read access only to published public records. Embeddings are generated with one consistent model per embedding space. The initial semantic embedding dimension is 384 using Supabase Edge Runtime gte-small.','technical_knowledge','private','published','curated','id',array['Supabase','pgvector','Vercel','GitHub','Akashic Record','RAG'],'{"embedding_model":"gte-small","embedding_dimensions":384,"version":1}'::jsonb,now(),null)
on conflict (slug) do nothing;

insert into public.dajjal_ai_memory_chunks (document_id,chunk_index,content,metadata)
select d.id,0,d.title || E'\\n\\n' || coalesce(d.summary,'') || E'\\n\\n' || d.content,
  jsonb_build_object('seeded_by','foundation_setup','source_slug',d.slug)
from public.dajjal_ai_memory_documents d
where d.slug in ('dajjal-ai-public-identity','dajjal-ai-core-identity','dajjal-ai-operating-principles','dajjal-family-project-context','dajjal-ai-memory-governance','dajjal-ai-memory-architecture')
on conflict (document_id,chunk_index) do nothing;
