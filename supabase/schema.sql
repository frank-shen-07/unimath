-- UniMath Supabase Schema
-- Run this in the Supabase SQL Editor to create all required tables

-- Profiles (auto-created on user signup)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Conversations
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null default 'New conversation',
  topic_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.conversations enable row level security;

create policy "Users can manage own conversations" on public.conversations
  for all using (auth.uid() = user_id);

-- Messages
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  image_url text,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Users can manage messages in own conversations" on public.messages
  for all using (
    conversation_id in (
      select id from public.conversations where user_id = auth.uid()
    )
  );

-- Practice sessions
create table if not exists public.practice_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  topic text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  total_questions int not null default 0,
  correct_answers int not null default 0,
  created_at timestamptz default now()
);

alter table public.practice_sessions enable row level security;

create policy "Users can manage own practice sessions" on public.practice_sessions
  for all using (auth.uid() = user_id);

-- Practice attempts
create table if not exists public.practice_attempts (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.practice_sessions on delete cascade not null,
  question text not null,
  user_answer text,
  correct_answer text not null,
  explanation text not null,
  is_correct boolean,
  created_at timestamptz default now()
);

alter table public.practice_attempts enable row level security;

create policy "Users can manage own practice attempts" on public.practice_attempts
  for all using (
    session_id in (
      select id from public.practice_sessions where user_id = auth.uid()
    )
  );

-- Formula sheets
create table if not exists public.formula_sheets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  topic text not null,
  formulas jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.formula_sheets enable row level security;

create policy "Users can manage own formula sheets" on public.formula_sheets
  for all using (auth.uid() = user_id);

-- Topic nodes (for knowledge map)
create table if not exists public.topic_nodes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  topic_name text not null,
  category text not null,
  practice_count int not null default 0,
  mastery_score float not null default 0,
  position_x float not null default 0,
  position_y float not null default 0,
  unique (user_id, topic_name)
);

alter table public.topic_nodes enable row level security;

create policy "Users can manage own topic nodes" on public.topic_nodes
  for all using (auth.uid() = user_id);

-- Topic edges (for knowledge map)
create table if not exists public.topic_edges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  source_node uuid references public.topic_nodes on delete cascade not null,
  target_node uuid references public.topic_nodes on delete cascade not null,
  relationship text not null default 'related'
);

alter table public.topic_edges enable row level security;

create policy "Users can manage own topic edges" on public.topic_edges
  for all using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_conversations_updated_at on public.conversations(updated_at desc);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_practice_sessions_user_id on public.practice_sessions(user_id);
create index if not exists idx_formula_sheets_user_id on public.formula_sheets(user_id);
create index if not exists idx_topic_nodes_user_id on public.topic_nodes(user_id);
