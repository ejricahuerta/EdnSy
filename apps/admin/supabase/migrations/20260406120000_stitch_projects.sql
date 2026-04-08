-- Maps each prospect to a Google Stitch project id (one project per prospect for screen quota isolation).

create table if not exists public.stitch_projects (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  stitch_project_id text not null,
  project_title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (prospect_id)
);

comment on table public.stitch_projects is 'Prospect ↔ Stitch project id; reused across demo regenerations';
comment on column public.stitch_projects.stitch_project_id is 'Stitch API project id (string)';

create index if not exists idx_stitch_projects_stitch_project_id on public.stitch_projects (stitch_project_id);

alter table public.stitch_projects enable row level security;

drop policy if exists "Allow service access to stitch_projects" on public.stitch_projects;
create policy "Allow service access to stitch_projects"
  on public.stitch_projects for all using (true) with check (true);
