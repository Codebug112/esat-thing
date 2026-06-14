-- Run this in your Supabase SQL editor

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  paper_id text not null,
  paper_name text not null,
  goal_time_sec integer not null default 120,
  started_at timestamptz default now(),
  completed_at timestamptz,
  status text not null default 'in_progress', -- 'in_progress' | 'completed'
  selected_parts text, -- comma-separated part names chosen at start
  draft_state jsonb  -- in-progress question state for resume across devices
);

create table if not exists session_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  question_number integer not null,
  user_answer text,
  correct_answer text not null,
  is_correct boolean,
  time_taken_ms integer,
  flagged boolean default false,
  wrong_reason text,
  subject_part text
);

-- Enable RLS
alter table sessions enable row level security;
alter table session_answers enable row level security;

-- Policies: users can only see/edit their own data
create policy "Users can manage own sessions"
  on sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own answers"
  on session_answers for all
  using (
    session_id in (select id from sessions where user_id = auth.uid())
  )
  with check (
    session_id in (select id from sessions where user_id = auth.uid())
  );

create table if not exists flagged_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  paper_id text not null,
  question_number integer not null,
  created_at timestamptz default now(),
  unique (user_id, paper_id, question_number)
);

alter table flagged_questions enable row level security;

create policy "Users can manage own flagged questions"
  on flagged_questions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes
create index if not exists sessions_user_id_idx on sessions(user_id);
create index if not exists session_answers_session_id_idx on session_answers(session_id);
create index if not exists flagged_questions_user_id_idx on flagged_questions(user_id);
