-- 1. rankings 테이블에 game_type 컬럼 추가
ALTER TABLE rankings ADD COLUMN IF NOT EXISTS game_type TEXT DEFAULT 'snake';

-- 기존 데이터는 모두 snake 게임으로 설정
UPDATE rankings SET game_type = 'snake' WHERE game_type IS NULL;

-- game_type과 score로 복합 인덱스 생성 (게임별 랭킹 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_rankings_game_type_score ON rankings(game_type, score DESC);

-- 2. game_rooms 테이블 생성 (멀티플레이어 틱택토용)
CREATE TABLE IF NOT EXISTS game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  player_x TEXT NOT NULL,
  player_o TEXT,
  board TEXT[] DEFAULT ARRAY[NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL]::TEXT[],
  current_turn TEXT DEFAULT 'X',
  winner TEXT,
  status TEXT DEFAULT 'waiting', -- waiting, playing, finished
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- room_code로 검색 최적화
CREATE INDEX IF NOT EXISTS idx_game_rooms_room_code ON game_rooms(room_code);

-- 상태별 검색 최적화
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);

-- Row Level Security 활성화
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 게임 방을 조회할 수 있도록 허용
CREATE POLICY "Anyone can read game_rooms" 
  ON game_rooms 
  FOR SELECT 
  USING (true);

-- 모든 사용자가 게임 방을 생성할 수 있도록 허용
CREATE POLICY "Anyone can insert game_rooms" 
  ON game_rooms 
  FOR INSERT 
  WITH CHECK (true);

-- 모든 사용자가 게임 방을 업데이트할 수 있도록 허용
CREATE POLICY "Anyone can update game_rooms" 
  ON game_rooms 
  FOR UPDATE 
  USING (true);

-- 오래된 게임 방 정리를 위한 삭제 정책
CREATE POLICY "Anyone can delete game_rooms" 
  ON game_rooms 
  FOR DELETE 
  USING (true);

-- Realtime 활성화 (Supabase Realtime을 위해)
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
