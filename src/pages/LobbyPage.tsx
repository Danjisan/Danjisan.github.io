import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getSocket } from "../lib/socket";
import type {
  LobbySession,
  ChatMessage,
  PlayerInfo,
} from "../lib/socketTypes";

const CAN_CHAT_ROLES = ["admin", "profesor"];

export default function LobbyPage() {
  const { user, profile, session: authSession } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<LobbySession[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [config, setConfig] = useState({
    timerSec: 30,
    questionCount: 10,
    category: "",
  });
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !authSession?.access_token) return;

    const sock = getSocket(authSession.access_token);

    sock.on("connect", () => setConnected(true));
    sock.on("disconnect", () => setConnected(false));
    sock.on("lobby:state", setSessions);
    sock.on("lobby:chat_message", (msg) =>
      setChat((prev) => [...prev.slice(-99), msg]),
    );
    sock.on("error", setError);

    sock.on(
      "session:joined",
      (data: { sessionId: string; players: PlayerInfo[] }) => {
        navigate(`/joc/${data.sessionId}`);
      },
    );

    sock.emit("lobby:join");

    return () => {
      sock.off("connect");
      sock.off("disconnect");
      sock.off("lobby:state");
      sock.off("lobby:chat_message");
      sock.off("error");
      sock.off("session:joined");
    };
  }, [user, authSession]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  function handleCreate() {
    if (!authSession?.access_token) return;
    const sock = getSocket(authSession.access_token);
    sock.emit("session:create", {
      timerSec: config.timerSec,
      questionCount: config.questionCount,
      category: config.category || null,
    });
    setCreateOpen(false);
  }

  function handleJoin(sessionId: string) {
    if (!authSession?.access_token) return;
    const sock = getSocket(authSession.access_token);
    sock.emit("session:join", sessionId);
  }

  function handleChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || !authSession?.access_token) return;
    const sock = getSocket(authSession.access_token);
    sock.emit("lobby:chat", chatInput.trim());
    setChatInput("");
  }

  if (!user) {
    return (
      <div className="page-container">
        <p>
          Trebuie să fii <a href="/login">autentificat</a> pentru a accesa lobby-ul.
        </p>
      </div>
    );
  }

  return (
    <div className="lobby-layout">
      <div className="lobby-main">
        <div className="lobby-header">
          <h1>Lobby</h1>
          <span className={`lobby-status ${connected ? "online" : "offline"}`}>
            {connected ? "conectat" : "deconectat"}
          </span>
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            + Crează sesiune
          </button>
        </div>

        {error && (
          <p className="form-error" style={{ marginBottom: "1rem" }}>
            {error}
          </p>
        )}

        {createOpen && (
          <div className="lobby-create-form">
            <h3>Sesiune nouă</h3>
            <label>
              Timer (secunde)
              <input
                type="number"
                min={5}
                max={120}
                value={config.timerSec}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, timerSec: Number(e.target.value) }))
                }
              />
            </label>
            <label>
              Număr întrebări
              <input
                type="number"
                min={1}
                max={30}
                value={config.questionCount}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    questionCount: Number(e.target.value),
                  }))
                }
              />
            </label>
            <label>
              Categorie (opțional)
              <input
                type="text"
                placeholder="ex: biologie"
                value={config.category}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, category: e.target.value }))
                }
              />
            </label>
            <div className="lobby-create-actions">
              <button className="btn-primary" onClick={handleCreate}>
                Pornește
              </button>
              <button
                className="btn-secondary"
                onClick={() => setCreateOpen(false)}
              >
                Anulează
              </button>
            </div>
          </div>
        )}

        <div className="lobby-sessions">
          {sessions.length === 0 ? (
            <p className="lobby-empty">Nu există sesiuni active. Fii primul!</p>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="lobby-session-card">
                <div className="lobby-session-info">
                  <span className="lobby-host">
                    {s.createdBy.displayName}
                    <span className={`role-badge role-${s.createdBy.role}`}>
                      {s.createdBy.role}
                    </span>
                  </span>
                  <span className="lobby-config">
                    {s.config.questionCount} întrebări · {s.config.timerSec}s
                    {s.config.category ? ` · ${s.config.category}` : ""}
                  </span>
                </div>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => handleJoin(s.id)}
                >
                  Intră
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lobby-chat">
        <h3 className="lobby-chat-title">Chat lobby</h3>
        <div className="lobby-chat-messages">
          {chat.map((msg, i) => (
            <div key={i} className="chat-message">
              <span className="chat-author">
                {msg.displayName}
                <span className={`role-badge role-${msg.role}`}>
                  {msg.role}
                </span>
              </span>
              <span className="chat-text">{msg.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        {profile && CAN_CHAT_ROLES.includes(profile.role) && (
          <form className="lobby-chat-form" onSubmit={handleChat}>
            <input
              type="text"
              placeholder="Mesaj..."
              value={chatInput}
              maxLength={500}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="btn-primary btn-sm">
              Trimite
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
