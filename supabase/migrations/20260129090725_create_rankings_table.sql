-- 스네이크 게임 랭킹 테이블 생성
create table if not exists rankings (
  id serial primary key,
  nickname text not null,
  score integer not null,
  created_at timestamp with time zone default now()
);

-- 점수 기준 내림차순 인덱스 생성 (랭킹 조회 최적화)
create index if not exists idx_rankings_score on rankings(score desc);

-- Row Level Security 활성화
alter table rankings enable row level security;

-- 모든 사용자가 랭킹을 조회할 수 있도록 허용
create policy "Anyone can read rankings" 
  on rankings 
  for select 
  using (true);

-- 모든 사용자가 랭킹을 등록할 수 있도록 허용
create policy "Anyone can insert rankings" 
  on rankings 
  for insert 
  with check (true);

-- 시스템이 오래된 랭킹을 삭제할 수 있도록 허용
create policy "Anyone can delete rankings" 
  on rankings 
  for delete 
  using (true);
