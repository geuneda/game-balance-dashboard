-- 채팅 메시지 테이블 생성
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL,
  message TEXT NOT NULL,
  room TEXT DEFAULT 'arcade', -- 채팅방 구분 (기본: arcade)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- room과 created_at으로 복합 인덱스 생성 (채팅방별 최신 메시지 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON chat_messages(room, created_at DESC);

-- 오래된 메시지 자동 정리를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Row Level Security 활성화
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 채팅 메시지를 조회할 수 있도록 허용
CREATE POLICY "Anyone can read chat_messages" 
  ON chat_messages 
  FOR SELECT 
  USING (true);

-- 모든 사용자가 채팅 메시지를 생성할 수 있도록 허용
CREATE POLICY "Anyone can insert chat_messages" 
  ON chat_messages 
  FOR INSERT 
  WITH CHECK (true);

-- Realtime 활성화 (Supabase Realtime을 위해)
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
