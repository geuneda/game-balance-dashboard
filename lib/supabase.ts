import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Supabase가 설정되지 않은 경우를 체크
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Supabase 클라이언트를 조건부로 생성 (환경 변수가 없으면 null)
let supabaseClient: SupabaseClient | null = null;

if (isSupabaseConfigured) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;

export interface RankingRow {
    id: number;
    nickname: string;
    score: number;
    game_type: string;
    created_at: string;
}

export interface GameRoomRow {
    id: string;
    room_code: string;
    player_x: string;
    player_o: string | null;
    board: (string | null)[];
    current_turn: string;
    winner: string | null;
    status: "waiting" | "playing" | "finished";
    created_at: string;
    updated_at: string;
}

export interface ChatMessageRow {
    id: string;
    nickname: string;
    message: string;
    room: string;
    created_at: string;
}
