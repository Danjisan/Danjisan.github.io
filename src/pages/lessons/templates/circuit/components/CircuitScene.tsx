import { useEffect, useRef, useState } from "react";
import type { SceneId } from "../../../../../content/circuits/chapters/types";
import { nodeRotation } from "../logic/terminalPositions";
import type { CircuitNode } from "../types";

/**
 * Fundalul unei scene „din viața reală” (lanternă, cameră, bicicletă), desenat în spatele firelor.
 * Formele se calculează în pixeli din mărimea mesei, din aceleași coordonate 0..1 ca piesele,
 * deci piesele stau pe desen la fel pe laptop și pe telefon.
 *
 * Peste desen: un con de lumină din fiecare LED aprins, în direcția în care e întors.
 */

interface CircuitSceneProps {
  scene: SceneId;
  nodes: CircuitNode[];
  ledOnIds: Set<string>;
}

export default function CircuitScene({ scene, nodes, ledOnIds }: CircuitSceneProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { w, h } = size;
  const litLeds = nodes.filter((n) => n.type === "led" && ledOnIds.has(n.id));

  return (
    <svg ref={ref} className={`circuit-scene circuit-scene--${scene}`} aria-hidden="true">
      <defs>
        <linearGradient id="circuit-scene-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#475569" />
          <stop offset="0.5" stopColor="#334155" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      {w > 0 && h > 0 && (
        <>
          {scene === "flashlight" && <Flashlight w={w} h={h} />}
          {scene === "room" && <Room w={w} h={h} />}
          {scene === "bike" && <Bike w={w} h={h} />}
          {litLeds.map((n) => (
            <Beam key={n.id} node={n} w={w} h={h} />
          ))}
        </>
      )}
    </svg>
  );
}

/** Con de lumină din LED, în direcția „capului” LED-ului (după rotire). */
function Beam({ node, w, h }: { node: CircuitNode; w: number; h: number }) {
  const angle = { 0: -90, 90: 0, 180: 90, 270: 180 }[nodeRotation(node)];
  const cx = node.position.x * w;
  const cy = node.position.y * h;
  const len = Math.max(w, h) * 0.5;
  const spread = 26;
  const rad = (a: number) => (a * Math.PI) / 180;
  const p1 = { x: cx + len * Math.cos(rad(angle - spread)), y: cy + len * Math.sin(rad(angle - spread)) };
  const p2 = { x: cx + len * Math.cos(rad(angle + spread)), y: cy + len * Math.sin(rad(angle + spread)) };
  const gradientId = `circuit-beam-${node.id}`;
  return (
    <g className="circuit-scene-beam">
      <defs>
        <radialGradient id={gradientId} gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={len}>
          <stop offset="0" stopColor="#fff7c2" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff7c2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <polygon points={`${cx},${cy} ${p1.x},${p1.y} ${p2.x},${p2.y}`} fill={`url(#${gradientId})`} />
      <circle cx={cx} cy={cy} r={Math.min(w, h) * 0.12} fill="#fff7c2" opacity="0.12" />
    </g>
  );
}

/* ── Scene ──────────────────────────────────────────────────────────────
 * Coordonatele de mai jos trebuie să se potrivească cu pozițiile pieselor din
 * src/content/circuits/chapters/01-primul-circuit.ts (scenele cu același nume).
 */

/** Lanternă culcată: corp de la stânga la 70%, cap evazat, lentilă la 84%. */
function Flashlight({ w, h }: { w: number; h: number }) {
  const x0 = 0.05 * w;
  const x1 = 0.7 * w;
  const xh = 0.86 * w;
  const y0 = 0.22 * h;
  const y1 = 0.78 * h;
  const r = Math.min(0.08 * h, 28);
  return (
    <g>
      <rect x={x0 - 0.02 * w} y={0.3 * h} width={0.03 * w} height={0.4 * h} rx={6} fill="#1e293b" />
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={r} fill="url(#circuit-scene-metal)" stroke="#64748b" strokeWidth="2" />
      {[0.1, 0.13, 0.16, 0.19].map((f) => (
        <line key={f} x1={f * w} y1={y0 + 8} x2={f * w} y2={y1 - 8} stroke="#0f172a" strokeWidth="3" opacity="0.5" />
      ))}
      <polygon
        points={`${x1},${y0} ${xh},${0.1 * h} ${xh},${0.9 * h} ${x1},${y1}`}
        fill="#3b4a5f"
        stroke="#64748b"
        strokeWidth="2"
      />
      <ellipse cx={xh} cy={0.5 * h} rx={Math.max(4, 0.012 * w)} ry={0.4 * h} fill="#cbd5e1" opacity="0.35" />
    </g>
  );
}

/** Cameră: tavan cu lampă (sus, la mijloc), întrerupător pe perete (dreapta), tablou electric (stânga-jos). */
function Room({ w, h }: { w: number; h: number }) {
  const lampX = 0.5 * w;
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} fill="#211a33" />
      <rect x={0} y={0} width={w} height={0.06 * h} fill="#2e2647" />
      <rect x={0} y={0.92 * h} width={w} height={0.08 * h} fill="#3a2c1c" />
      <line x1={lampX} y1={0.06 * h} x2={lampX} y2={0.12 * h} stroke="#94a3b8" strokeWidth="3" />
      <rect x={0.06 * w} y={0.56 * h} width={0.3 * w} height={0.34 * h} rx={8} fill="#1b2433" stroke="#475569" strokeWidth="2" strokeDasharray="6 4" />
      <text x={0.07 * w} y={0.89 * h} fill="#64748b" fontSize="12">tablou electric</text>
      <rect x={0.72 * w} y={0.3 * h} width={0.2 * w} height={0.46 * h} rx={10} fill="#e2e8f0" opacity="0.12" stroke="#94a3b8" strokeWidth="2" />
      <text x={0.73 * w} y={0.28 * h} fill="#64748b" fontSize="12">pe perete</text>
    </g>
  );
}

/** Bicicletă: roți jos, cadru, ghidon în dreapta-sus cu farul în față. */
function Bike({ w, h }: { w: number; h: number }) {
  const R = Math.min(0.2 * h, 0.16 * w);
  const rear = { x: 0.2 * w, y: 0.76 * h };
  const front = { x: 0.8 * w, y: 0.76 * h };
  const crank = { x: 0.46 * w, y: 0.76 * h };
  const seat = { x: 0.36 * w, y: 0.42 * h };
  const head = { x: 0.72 * w, y: 0.36 * h };
  const bar = { x: 0.7 * w, y: 0.16 * h };
  const line = (a: { x: number; y: number }, b: { x: number; y: number }, k: string) => (
    <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#475569" strokeWidth="7" strokeLinecap="round" />
  );
  return (
    <g opacity="0.85">
      <circle cx={rear.x} cy={rear.y} r={R} fill="none" stroke="#334155" strokeWidth="8" />
      <circle cx={front.x} cy={front.y} r={R} fill="none" stroke="#334155" strokeWidth="8" />
      {line(rear, crank, "a")}
      {line(rear, seat, "b")}
      {line(seat, crank, "c")}
      {line(seat, head, "d")}
      {line(crank, head, "e")}
      {line(head, front, "f")}
      {line(head, bar, "g")}
      <line x1={bar.x - 0.06 * w} y1={bar.y} x2={bar.x + 0.04 * w} y2={bar.y} stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
      <rect x={seat.x - 0.05 * w} y={seat.y - 10} width={0.1 * w} height={10} rx={5} fill="#64748b" />
    </g>
  );
}
