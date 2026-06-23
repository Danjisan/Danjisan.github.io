import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getSocket } from "../lib/socket";
import type {
  PlayerInfo,
  SessionQuestion,
  RoundResultPayload,
  GameOverPayload,
} from "../lib/socketTypes";

type GamePhase =
  | "waiting"
  | "countdown"
  | "question"
  | "grace"
  | "round_result"
  | "game_over";

interface TimerState {
  total: number;
  left: number;
}

export default function GamePage() {
  useParams<{ sessionId: string }>();
  const { session: authSession, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialPlayers: PlayerInfo[] = (location.state as { players?: PlayerInfo[] })?.players ?? [];

  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [players, setPlayers] = useState<PlayerInfo[]>(initialPlayers);
  const [countdown, setCountdown] = useState(3);
  const [question, setQuestion] = useState<SessionQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResultPayload | null>(null);
  const [gameOver, setGameOver] = useState<GameOverPayload | null>(null);
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [disconnectMsg, setDisconnectMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearTimer() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }

  function startTimer(totalSec: number) {
    clearTimer();
    setTimer({ total: totalSec, left: totalSec });
    const end = Date.now() + totalSec * 1000;
    timerIntervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setTimer({ total: totalSec, left });
      if (left <= 0) clearTimer();
    }, 200);
  }

  useEffect(() => {
    if (authLoading) return;

    const sock = getSocket(authSession?.access_token ?? null);

    sock.on("session:joined", (data) => {
      setPlayers(data.players);
      setPhase("waiting");
    });

    sock.on("session:starting", (data) => {
      setPlayers(data.players);
      setCountdown(data.countdown);
      setPhase("countdown");

      let c = data.countdown;
      const t = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) clearInterval(t);
      }, 1000);
    });

    sock.on("session:question", (q) => {
      setQuestion(q);
      setSelectedAnswer(null);
      setOpponentAnswered(false);
      setRoundResult(null);
      setPhase("question");
      startTimer(q.timerSec);
    });

    sock.on("session:opponent_answered", () => {
      setOpponentAnswered(true);
      setPhase("grace");
    });

    sock.on("session:round_result", (result) => {
      clearTimer();
      setRoundResult(result);
      setPhase("round_result");
    });

    sock.on("session:game_over", (data) => {
      clearTimer();
      setGameOver(data);
      setPhase("game_over");
      // Refresh profil ca să apară XP-ul actualizat
      refreshProfile();
    });

    sock.on("session:player_disconnected", (data) => {
      clearTimer();
      setDisconnectMsg(`Adversarul s-a deconectat (${data.score} pct).`);
    });

    sock.on("error", setError);

    return () => {
      sock.off("session:joined");
      sock.off("session:starting");
      sock.off("session:question");
      sock.off("session:opponent_answered");
      sock.off("session:round_result");
      sock.off("session:game_over");
      sock.off("session:player_disconnected");
      sock.off("error");
    };
  }, [authLoading, authSession?.access_token]);

  // Cleanup timer la unmount
  useEffect(() => () => clearTimer(), []);

  function sendAnswer(answer: string) {
    if (!question || selectedAnswer) return;
    setSelectedAnswer(answer);
    const sock = getSocket(authSession?.access_token ?? null);
    sock.emit("session:answer", { questionId: question.questionId, answer });
  }

  function leaveGame() {
    const sock = getSocket(authSession?.access_token ?? null);
    sock.emit("session:leave");
    navigate("/lobby");
  }

  const myId = authSession?.user?.id ?? null;

  return (
    <div className="game-layout">
      {/* Scoreboard compact */}
      {players.length > 0 && phase !== "game_over" && (
        <div className="game-scoreboard">
          {players.map((p) => (
            <div
              key={p.userId}
              className={`scoreboard-player ${p.userId === myId ? "me" : "opponent"}`}
            >
              <span className="sb-name">{p.displayName}</span>
              <span className="sb-score">
                {roundResult?.scores[p.userId] ??
                  gameOver?.scores[p.userId] ??
                  0}{" "}
                pct
              </span>
            </div>
          ))}
        </div>
      )}

      {error && <p className="form-error game-error">{error}</p>}
      {disconnectMsg && <p className="game-disconnect">{disconnectMsg}</p>}

      {/* ── Faze ───────────────────────────────────────────── */}

      {phase === "waiting" && (
        <div className="game-center">
          <p className="game-waiting-msg">Se așteaptă adversarul…</p>
          <button className="btn-secondary" onClick={leaveGame}>
            Ieși
          </button>
        </div>
      )}

      {phase === "countdown" && (
        <div className="game-center">
          <p className="game-countdown-label">Jocul începe în</p>
          <span className="game-countdown-number">{countdown}</span>
          <div className="game-players-list">
            {players.map((p) => (
              <span key={p.userId} className="game-player-chip">
                {p.displayName}
              </span>
            ))}
          </div>
        </div>
      )}

      {(phase === "question" || phase === "grace") && question && (
        <div className="game-question-wrap">
          <div className="game-progress">
            Întrebarea {question.index + 1} / {question.total}
          </div>

          {timer && (
            <div className="game-timer">
              <div
                className="game-timer-bar"
                style={{ width: `${(timer.left / timer.total) * 100}%` }}
              />
              <span className="game-timer-label">{timer.left}s</span>
            </div>
          )}

          <p className="game-question-text">{question.text}</p>

          {opponentAnswered && phase === "grace" && (
            <p className="game-grace-notice">Adversarul a răspuns · 5s rămase</p>
          )}

          <div className="game-options">
            {question.options.map((opt) => {
              let cls = "game-option";
              if (selectedAnswer === opt) cls += " selected";
              return (
                <button
                  key={opt}
                  className={cls}
                  onClick={() => sendAnswer(opt)}
                  disabled={!!selectedAnswer}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {phase === "round_result" && roundResult && (
        <div className="game-round-result">
          <p className="round-correct-label">Răspuns corect:</p>
          <p className="round-correct-answer">{roundResult.correctAnswer}</p>
          {roundResult.explanation && (
            <p className="round-explanation">{roundResult.explanation}</p>
          )}
          <div className="round-points">
            <span>Tu: +{roundResult.yourPoints} pct</span>
            <span>Adversar: +{roundResult.opponentPoints} pct</span>
          </div>
          <div className="round-scores">
            {Object.entries(roundResult.scores).map(([uid, pts]) => {
              const name =
                players.find((p) => p.userId === uid)?.displayName ?? uid;
              return (
                <span key={uid}>
                  {name}: {pts}
                </span>
              );
            })}
          </div>
          <p className="round-next-hint">Urmează…</p>
        </div>
      )}

      {phase === "game_over" && gameOver && (
        <div className="game-over">
          <h2 className="game-over-title">
            {gameOver.winnerId === myId
              ? "Ai câștigat! 🏆"
              : gameOver.winnerId === null
              ? "Egalitate!"
              : "Ai pierdut."}
          </h2>
          <div className="game-over-scores">
            {gameOver.players.map((p) => (
              <div
                key={p.userId}
                className={`game-over-player ${
                  p.userId === gameOver.winnerId ? "winner" : ""
                }`}
              >
                <span>{p.displayName}</span>
                <span>{gameOver.scores[p.userId] ?? 0} pct</span>
              </div>
            ))}
          </div>
          {myId && (gameOver.scores[myId] ?? 0) > 0 && (
            <p className="game-over-xp">
              +{gameOver.scores[myId]} XP adăugat la profilul tău
            </p>
          )}
          <div className="game-over-actions">
            <button className="btn-primary" onClick={() => navigate("/lobby")}>
              Înapoi la lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
