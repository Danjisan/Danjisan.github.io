import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getSocket } from "../lib/socket";
import type {
  LobbySession,
  ChatMessage,
  OnlineUser,
  PlayerInfo,
} from "../lib/socketTypes";

const CAN_CHAT_ROLES = ["admin", "profesor"];

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  profesor: "Profesor",
  parinte: "Părinte",
  elev: "Elev",
  anonim: "Anonim",
};

export default function LobbyPage() {
  const { profile, session: authSession, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<LobbySession[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [config, setConfig] = useState({ questionCount: 10, category: "" });
  const [connected, setConnected] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aloneNotice, setAloneNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;

    // Conectare — cu token dacă e logat, fără dacă e anonim
    const token = authSession?.access_token ?? null;
    const sock = getSocket(token);

    // Dacă socket-ul e deja conectat (ex: revenire din joc), setăm imediat
    if (sock.connected) setConnected(true);

    sock.on("connect", () => setConnected(true));
    sock.on("disconnect", () => setConnected(false));
    sock.on("lobby:state", setSessions);
    sock.on("lobby:users", setOnlineUsers);
    sock.on("lobby:alone", () => setAloneNotice(true));
    sock.on("lobby:chat_message", (msg) =>
      setChat((prev) => [...prev.slice(-99), msg]),
    );
    sock.on("error", setError);
    sock.on("session:joined", (data: { sessionId: string; players: PlayerInfo[] }) => {
      navigate(`/joc/${data.sessionId}`, { state: { players: data.players } });
    });

    sock.emit("lobby:join");

    return () => {
      sock.off("connect");
      sock.off("disconnect");
      sock.off("lobby:state");
      sock.off("lobby:users");
      sock.off("lobby:alone");
      sock.off("lobby:chat_message");
      sock.off("error");
      sock.off("session:joined");
    };
  }, [authLoading, authSession?.access_token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Inchide drawer la click in afara
  useEffect(() => {
    if (!drawerOpen) return;
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [drawerOpen]);

  function handleCreate() {
    const token = authSession?.access_token ?? null;
    const sock = getSocket(token);
    sock.emit("session:create", {
      timerSec: 0,
      questionCount: config.questionCount,
      category: config.category || null,
    });
    setCreateOpen(false);
  }

  function handleJoin(sessionId: string) {
    const token = authSession?.access_token ?? null;
    const sock = getSocket(token);
    sock.emit("session:join", sessionId);
  }

  function handleChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const token = authSession?.access_token ?? null;
    const sock = getSocket(token);
    sock.emit("lobby:chat", chatInput.trim());
    setChatInput("");
  }

  const onlineCount = onlineUsers.length;

  return (
    <div className="lobby-layout">
      <div className="lobby-main">
        <div className="lobby-header">
          <h1>Lumea Online</h1>
          <span className={`lobby-status ${connected ? "online" : "offline"}`}>
            {connected ? "conectat" : "deconectat"}
          </span>
          <button
            className="lobby-online-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Utilizatori online"
          >
            👥 {onlineCount} online
          </button>
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            + Crează sesiune
          </button>
        </div>

        {aloneNotice && (
          <p className="lobby-alone-notice" onClick={() => setAloneNotice(false)}>
            Ești singurul în lobby momentan. ×
          </p>
        )}

        {error && (
          <p className="form-error" style={{ marginBottom: "1rem" }}>
            {error}
          </p>
        )}

        {createOpen && (
          <div className="lobby-create-form">
            <h3>Sesiune nouă</h3>
            <label>
              Număr întrebări
              <input
                type="number"
                min={1}
                max={30}
                value={config.questionCount}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, questionCount: Number(e.target.value) }))
                }
              />
            </label>
            <label>
              Categorie (opțional)
              <input
                type="text"
                placeholder="ex: biologie"
                value={config.category}
                onChange={(e) => setConfig((c) => ({ ...c, category: e.target.value }))}
              />
            </label>
            <div className="lobby-create-actions">
              <button className="btn-primary" onClick={handleCreate}>
                Pornește
              </button>
              <button className="btn-secondary" onClick={() => setCreateOpen(false)}>
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
                      {ROLE_LABELS[s.createdBy.role] ?? s.createdBy.role}
                    </span>
                  </span>
                  <span className="lobby-config">
                    {s.config.questionCount} întrebări
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

      {/* Chat */}
      <div className="lobby-chat">
        <h3 className="lobby-chat-title">Chat lobby</h3>
        <div className="lobby-chat-messages">
          {chat.length === 0 && (
            <p className="chat-empty">Niciun mesaj încă.</p>
          )}
          {chat.map((msg, i) => (
            <div key={i} className="chat-message">
              <span className="chat-author">
                {msg.displayName}
                <span className={`role-badge role-${msg.role}`}>
                  {ROLE_LABELS[msg.role] ?? msg.role}
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

      {/* Online users drawer */}
      {drawerOpen && (
        <div className="online-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div
            ref={drawerRef}
            className="online-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="online-drawer-header">
              <span>👥 {onlineCount} online</span>
              <button
                className="online-drawer-close"
                onClick={() => setDrawerOpen(false)}
                aria-label="Închide"
              >
                ×
              </button>
            </div>
            <div className="online-drawer-list">
              {onlineUsers.map((u) => (
                <div
                  key={u.userId}
                  className={`online-user-row ${u.role === "anonim" ? "anon" : "registered"}`}
                >
                  {u.role === "anonim" ? (
                    <span className="ou-name-anon">{u.displayName}</span>
                  ) : (
                    <>
                      <div className="ou-top">
                        <span className="ou-name">{u.displayName}</span>
                        <span className={`role-badge role-${u.role}`}>
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                        {u.status === "in_quiz" && (
                          <span className="ou-in-quiz">în quiz</span>
                        )}
                      </div>
                      <div className="ou-bottom">
                        {u.schoolName && (
                          <span className="ou-school">{u.schoolName}</span>
                        )}
                        <span className="ou-xp">{u.xp} XP</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
