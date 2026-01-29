"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";

const CHAT_ROOM = "arcade";
const MAX_MESSAGES = 50;

interface ChatMessage {
    id: string;
    nickname: string;
    message: string;
    created_at: string;
}

// Supabase 클라이언트 생성 (브라우저용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null;

interface GameChatProps {
    defaultNickname?: string;
}

export function GameChat({ defaultNickname = "" }: GameChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [nickname, setNickname] = useState(defaultNickname);
    const [isNicknameSet, setIsNicknameSet] = useState(!!defaultNickname);
    const [onlineCount, setOnlineCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    // 메시지 스크롤 자동 이동
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // 초기 메시지 로드
    useEffect(() => {
        const loadMessages = async () => {
            if (!supabase) {
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("chat_messages")
                    .select("*")
                    .eq("room", CHAT_ROOM)
                    .order("created_at", { ascending: true })
                    .limit(MAX_MESSAGES);

                if (error) {
                    console.error("Failed to load messages:", error);
                } else if (data) {
                    setMessages(data);
                }
            } catch (e) {
                console.error("Error loading messages:", e);
            } finally {
                setIsLoading(false);
            }
        };

        loadMessages();
    }, []);

    // Realtime 구독
    useEffect(() => {
        if (!supabase || !isNicknameSet) return;

        // Presence 채널 (온라인 사용자 수 추적)
        const presenceChannel = supabase.channel(`presence:${CHAT_ROOM}`, {
            config: {
                presence: {
                    key: nickname,
                },
            },
        });

        presenceChannel
            .on("presence", { event: "sync" }, () => {
                const state = presenceChannel.presenceState();
                const count = Object.keys(state).length;
                setOnlineCount(count);
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await presenceChannel.track({
                        nickname,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        // 메시지 채널 (새 메시지 실시간 수신)
        const messageChannel = supabase
            .channel(`chat:${CHAT_ROOM}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages",
                    filter: `room=eq.${CHAT_ROOM}`,
                },
                (payload) => {
                    const newMsg = payload.new as ChatMessage;
                    setMessages((prev) => {
                        // 중복 방지
                        if (prev.some((m) => m.id === newMsg.id)) {
                            return prev;
                        }
                        const updated = [...prev, newMsg];
                        // 최대 메시지 수 유지
                        if (updated.length > MAX_MESSAGES) {
                            return updated.slice(-MAX_MESSAGES);
                        }
                        return updated;
                    });
                },
            )
            .subscribe();

        channelRef.current = messageChannel;

        return () => {
            presenceChannel.unsubscribe();
            messageChannel.unsubscribe();
        };
    }, [isNicknameSet, nickname]);

    // 메시지 전송
    const handleSendMessage = useCallback(async () => {
        if (!newMessage.trim() || !supabase || !isNicknameSet) return;

        const messageToSend = newMessage.trim();
        setNewMessage("");

        try {
            const { error } = await supabase.from("chat_messages").insert({
                nickname,
                message: messageToSend,
                room: CHAT_ROOM,
            });

            if (error) {
                console.error("Failed to send message:", error);
                setNewMessage(messageToSend); // 실패 시 복원
            }
        } catch (e) {
            console.error("Error sending message:", e);
            setNewMessage(messageToSend);
        }
    }, [newMessage, nickname, isNicknameSet]);

    // 엔터키로 메시지 전송
    const handleKeyPress = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isNicknameSet && nickname.trim()) {
                    setIsNicknameSet(true);
                } else {
                    handleSendMessage();
                }
            }
        },
        [isNicknameSet, nickname, handleSendMessage],
    );

    // 시간 포맷팅
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!supabase) {
        return (
            <div className="bg-gray-800 rounded-lg p-4 h-full flex items-center justify-center">
                <p className="text-gray-400 text-sm">
                    채팅 기능을 사용하려면 Supabase 설정이 필요합니다
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg flex flex-col h-[400px] w-[280px]">
            {/* 헤더 */}
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                    💬 실시간 채팅
                </h3>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-400 text-xs">
                        {onlineCount}명 접속중
                    </span>
                </div>
            </div>

            {/* 닉네임 입력 */}
            {!isNicknameSet && (
                <div className="p-4 border-b border-gray-700">
                    <p className="text-gray-400 text-sm mb-2">
                        채팅에 참여하려면 닉네임을 입력하세요
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) =>
                                setNickname(e.target.value.slice(0, 10))
                            }
                            onKeyPress={handleKeyPress}
                            placeholder="닉네임 (최대 10자)"
                            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                        <button
                            onClick={() =>
                                nickname.trim() && setIsNicknameSet(true)
                            }
                            disabled={!nickname.trim()}
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-bold disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            참여
                        </button>
                    </div>
                </div>
            )}

            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-sm">로딩 중...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-sm">
                            아직 메시지가 없습니다
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${
                                msg.nickname === nickname
                                    ? "items-end"
                                    : "items-start"
                            }`}
                        >
                            <div className="flex items-center gap-1 mb-0.5">
                                <span
                                    className={`text-xs ${
                                        msg.nickname === nickname
                                            ? "text-blue-400"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {msg.nickname}
                                </span>
                                <span className="text-gray-600 text-xs">
                                    {formatTime(msg.created_at)}
                                </span>
                            </div>
                            <div
                                className={`max-w-[200px] px-3 py-1.5 rounded-lg text-sm break-words ${
                                    msg.nickname === nickname
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-700 text-gray-200"
                                }`}
                            >
                                {msg.message}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 */}
            {isNicknameSet && (
                <div className="p-3 border-t border-gray-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) =>
                                setNewMessage(e.target.value.slice(0, 200))
                            }
                            onKeyPress={handleKeyPress}
                            placeholder="메시지 입력..."
                            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={200}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-bold disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            전송
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
