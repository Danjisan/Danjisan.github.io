export type UserRole = "admin" | "profesor" | "parinte" | "elev" | "anonim";

export interface PlayerInfo {
  userId: string;
  displayName: string;
  role: UserRole;
  socketId: string;
}

export interface LobbySession {
  id: string;
  createdBy: Pick<PlayerInfo, "userId" | "displayName" | "role">;
  config: { timerSec: number; questionCount: number; category: string | null };
  createdAt: number;
}

export interface ChatMessage {
  userId: string;
  displayName: string;
  role: UserRole;
  text: string;
  timestamp: number;
}

export interface SessionQuestion {
  questionId: string;
  index: number;
  total: number;
  text: string;
  options: string[];
  timerSec: number;
}

export interface RoundResultPayload {
  questionId: string;
  correctAnswer: string;
  explanation: string | null;
  yourAnswer: string | null;
  yourPoints: number;
  opponentPoints: number;
  scores: Record<string, number>;
}

export interface GameOverPayload {
  scores: Record<string, number>;
  winnerId: string | null;
  players: PlayerInfo[];
}

// ── Socket.io event maps ──────────────────────────────────────

export interface ClientToServerEvents {
  "lobby:join": () => void;
  "session:create": (config: LobbySession["config"]) => void;
  "session:join": (sessionId: string) => void;
  "session:answer": (data: { questionId: string; answer: string }) => void;
  "lobby:chat": (text: string) => void;
  "session:leave": () => void;
}

export interface OnlineUser {
  userId: string;
  displayName: string;
  role: UserRole;
  schoolName: string | null;
  xp: number;
  status: "lobby" | "in_quiz";
}

export interface ServerToClientEvents {
  "lobby:state": (sessions: LobbySession[]) => void;
  "lobby:users": (users: OnlineUser[]) => void;
  "lobby:alone": () => void;
  "lobby:chat_message": (msg: ChatMessage) => void;
  "session:joined": (data: { sessionId: string; players: PlayerInfo[] }) => void;
  "session:starting": (data: { countdown: number; players: PlayerInfo[] }) => void;
  "session:question": (data: SessionQuestion) => void;
  "session:opponent_answered": (data: { timeLeftMs: number }) => void;
  "session:round_result": (data: RoundResultPayload) => void;
  "session:game_over": (data: GameOverPayload) => void;
  "session:player_disconnected": (data: { userId: string; score: number }) => void;
  error: (message: string) => void;
}
