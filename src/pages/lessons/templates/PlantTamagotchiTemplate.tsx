import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import type { TemplateProps } from "./types";
import {
  ALEXANDRIA_TELEORMAN,
  GARDEN_SPECIES,
  SPECIES_LIST,
  stageLabel,
  type SpeciesId,
} from "./garden/species";
import {
  formatSunHint,
  getSunState,
} from "./garden/sun";
import {
  applyHarvest,
  applyWater,
  applyWeed,
  simulatePlant,
  type SimPlantState,
} from "./garden/simulate";
import {
  canPlantSpecies,
  ensurePlot,
  listPlants,
  persistPlantSim,
  plantSeed,
  rowToSim,
  touchPlotSim,
  type GardenPlantRow,
  type GardenPlotRow,
} from "./garden/api";

const STATUS_LABEL: Record<string, string> = {
  growing: "În creștere",
  stressed: "Stresată",
  mature: "Matură",
  harvested: "Recoltată (istoric)",
  dead: "Moartă (istoric)",
};

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export default function PlantTamagotchiTemplate({ lesson }: TemplateProps) {
  const { user, loading: authLoading } = useAuth();
  const [plot, setPlot] = useState<GardenPlotRow | null>(null);
  const [plants, setPlants] = useState<GardenPlantRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sim, setSim] = useState<SimPlantState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  const sun = useMemo(
    () =>
      getSunState(
        plot?.latitude ?? ALEXANDRIA_TELEORMAN.latitude,
        plot?.longitude ?? ALEXANDRIA_TELEORMAN.longitude,
        now,
      ),
    [plot, now],
  );

  const active = plants.filter(
    (p) => p.status === "growing" || p.status === "stressed" || p.status === "mature",
  );
  const history = plants.filter(
    (p) => p.status === "harvested" || p.status === "dead",
  );
  const selectedRow = plants.find((p) => p.id === selectedId) ?? null;

  const showFlash = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 4000);
  };

  const runSimAndPersist = useCallback(
    async (row: GardenPlantRow, plotRow: GardenPlotRow) => {
      const result = simulatePlant(rowToSim(row), {
        latitude: plotRow.latitude,
        longitude: plotRow.longitude,
      });
      await persistPlantSim(row.id, result.plant);
      await touchPlotSim(plotRow.id);
      return result;
    },
    [],
  );

  const reload = useCallback(async () => {
    if (!user) return;
    setError(null);
    setBusy(true);
    try {
      const plotRow = await ensurePlot(user.id);
      setPlot(plotRow);
      let rows = await listPlants(user.id);

      // Catch-up sim pe plantele active
      for (const row of rows) {
        if (
          row.status === "growing" ||
          row.status === "stressed" ||
          row.status === "mature"
        ) {
          const result = await runSimAndPersist(row, plotRow);
          rows = rows.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  growth_progress: result.plant.growthProgress,
                  soil_moisture: result.plant.soilMoisture,
                  health: result.plant.health,
                  weed_level: result.plant.weedLevel,
                  status: result.plant.status,
                  last_sim_at: result.plant.lastSimAt,
                  last_watered_at: result.plant.lastWateredAt,
                }
              : r,
          );
        }
      }

      setPlants(rows);
      setSelectedId((prev) => {
        if (prev && rows.some((r) => r.id === prev)) return prev;
        const firstActive = rows.find(
          (r) =>
            r.status === "growing" ||
            r.status === "stressed" ||
            r.status === "mature",
        );
        return firstActive?.id ?? rows[0]?.id ?? null;
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Nu am putut încărca grădina. Verifică migrarea Supabase.",
      );
    } finally {
      setBusy(false);
    }
  }, [user, runSimAndPersist]);

  useEffect(() => {
    if (!authLoading && user) void reload();
  }, [authLoading, user, reload]);

  useEffect(() => {
    if (!selectedRow) {
      setSim(null);
      return;
    }
    setSim(rowToSim(selectedRow));
  }, [selectedRow]);

  // Tick UI soare + sim ușor la fiecare minut cât e pagina deschisă
  useEffect(() => {
    if (!user || !plot || !selectedId) return;
    const id = window.setInterval(() => {
      setNow(new Date());
      void (async () => {
        const row = plants.find((p) => p.id === selectedId);
        if (!row || !plot) return;
        if (
          row.status !== "growing" &&
          row.status !== "stressed" &&
          row.status !== "mature"
        ) {
          return;
        }
        const result = await runSimAndPersist(row, plot);
        setPlants((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  growth_progress: result.plant.growthProgress,
                  soil_moisture: result.plant.soilMoisture,
                  health: result.plant.health,
                  weed_level: result.plant.weedLevel,
                  status: result.plant.status,
                  last_sim_at: result.plant.lastSimAt,
                  last_watered_at: result.plant.lastWateredAt,
                }
              : r,
          ),
        );
        setSim(result.plant);
      })();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [user, plot, selectedId, plants, runSimAndPersist]);

  async function handlePlant(speciesId: SpeciesId) {
    if (!user || !plot) return;
    if (active.length >= 4) {
      setWarn("Maxim 4 plante active. Recoltează sau așteaptă.");
      return;
    }
    if (!canPlantSpecies(speciesId, plants)) {
      setWarn("Deblochezi această sămânță după ce termini specia anterioară.");
      return;
    }
    setBusy(true);
    setWarn(null);
    try {
      const row = await plantSeed(user.id, plot.id, speciesId);
      setPlants((prev) => [row, ...prev]);
      setSelectedId(row.id);
      showFlash(`Ai plantat: ${GARDEN_SPECIES[speciesId].label}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Plantare eșuată.");
    } finally {
      setBusy(false);
    }
  }

  async function handleWater() {
    if (!selectedRow || !plot || !sim) return;
    if (sim.status === "dead" || sim.status === "harvested") return;
    setBusy(true);
    setWarn(null);
    try {
      // Catch-up înainte de udare
      let current = simulatePlant(sim, {
        latitude: plot.latitude,
        longitude: plot.longitude,
      }).plant;
      const watered = applyWater(current, plot.latitude, plot.longitude);
      watered.plant.lastSimAt = new Date().toISOString();
      await persistPlantSim(selectedRow.id, watered.plant);
      setSim(watered.plant);
      setPlants((prev) =>
        prev.map((r) =>
          r.id === selectedRow.id
            ? {
                ...r,
                ...{
                  growth_progress: watered.plant.growthProgress,
                  soil_moisture: watered.plant.soilMoisture,
                  health: watered.plant.health,
                  weed_level: watered.plant.weedLevel,
                  status: watered.plant.status,
                  last_sim_at: watered.plant.lastSimAt,
                  last_watered_at: watered.plant.lastWateredAt,
                },
              }
            : r,
        ),
      );
      if (watered.warning) setWarn(watered.warning);
      showFlash(watered.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Udat eșuat.");
    } finally {
      setBusy(false);
    }
  }

  async function handleWeed() {
    if (!selectedRow || !sim) return;
    if (sim.status === "dead" || sim.status === "harvested") return;
    setBusy(true);
    try {
      const next = applyWeed(sim);
      next.lastSimAt = new Date().toISOString();
      await persistPlantSim(selectedRow.id, next);
      setSim(next);
      setPlants((prev) =>
        prev.map((r) =>
          r.id === selectedRow.id
            ? {
                ...r,
                weed_level: next.weedLevel,
                health: next.health,
                status: next.status,
                last_sim_at: next.lastSimAt,
              }
            : r,
        ),
      );
      showFlash("Ai smuls buruienile.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Acțiune eșuată.");
    } finally {
      setBusy(false);
    }
  }

  async function handleHarvest() {
    if (!selectedRow || !sim) return;
    setBusy(true);
    try {
      const next = applyHarvest(sim);
      next.lastSimAt = new Date().toISOString();
      await persistPlantSim(selectedRow.id, next);
      setSim(next);
      setPlants((prev) =>
        prev.map((r) =>
          r.id === selectedRow.id
            ? { ...r, status: next.status, growth_progress: 1, last_sim_at: next.lastSimAt }
            : r,
        ),
      );
      showFlash("Recoltat — planta rămâne în istoric.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recoltare eșuată.");
    } finally {
      setBusy(false);
    }
  }

  if (authLoading) {
    return <p className="garden-muted">Se încarcă contul…</p>;
  }

  if (!user) {
    return (
      <div className="garden-shell">
        <p className="template-description">{lesson.description}</p>
        <div className="garden-gate">
          <p>
            Grădina Virtuală salvează plantele pe contul tău (istoric pe
            Supabase).{" "}
            <Link to="/login" className="auth-link">
              Intră în cont
            </Link>{" "}
            ca să plantezi.
          </p>
        </div>
      </div>
    );
  }

  const species = sim ? GARDEN_SPECIES[sim.speciesId] : null;

  return (
    <div className="garden-shell">
      <p className="template-description">{lesson.description}</p>

      <div className="garden-meta">
        <span>
          Locație soare: <strong>{ALEXANDRIA_TELEORMAN.label}</strong>
        </span>
        <span>
          Acum: <strong>{sun.label}</strong> (~{sun.elevationDeg.toFixed(0)}°)
        </span>
      </div>
      <p className="garden-sun-hint">{formatSunHint(sun)}</p>

      {error && <p className="auth-error">{error}</p>}
      {warn && <p className="garden-warn">{warn}</p>}
      {flash && <p className="auth-info">{flash}</p>}

      <section className="garden-panel">
        <h2 className="garden-h2">Semănător</h2>
        <p className="garden-muted">
          Fasole e liberă. Restul se deblochează pe rând după ce duci specia
          anterioară la maturitate / recoltare. Maxim 4 plante active.
        </p>
        <div className="garden-seed-grid">
          {SPECIES_LIST.map((s) => {
            const unlocked = canPlantSpecies(s.id, plants);
            return (
              <button
                key={s.id}
                type="button"
                className="garden-seed-btn"
                disabled={busy || !unlocked || active.length >= 4}
                onClick={() => handlePlant(s.id)}
                title={unlocked ? s.blurb : "Blocat până termini specia anterioară"}
              >
                <span className="garden-seed-emoji" aria-hidden>
                  {s.emoji}
                </span>
                <span className="garden-seed-label">{s.label}</span>
                {!unlocked && <span className="garden-lock">Blocat</span>}
              </button>
            );
          })}
        </div>
      </section>

      <div className="garden-layout">
        <section className="garden-panel">
          <h2 className="garden-h2">Parcela activă</h2>
          {active.length === 0 ? (
            <p className="garden-muted">Nicio plantă activă. Plantează o fasole.</p>
          ) : (
            <ul className="garden-plant-list">
              {active.map((p) => {
                const sp = GARDEN_SPECIES[p.species_id as SpeciesId];
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={
                        p.id === selectedId
                          ? "garden-plant-row selected"
                          : "garden-plant-row"
                      }
                      onClick={() => setSelectedId(p.id)}
                    >
                      <span aria-hidden>{sp?.emoji ?? "🌱"}</span>
                      <span>
                        {sp?.label ?? p.species_id} · {STATUS_LABEL[p.status]} ·{" "}
                        {stageLabel(p.growth_progress)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {history.length > 0 && (
            <>
              <h3 className="garden-h3">Istoric</h3>
              <ul className="garden-plant-list garden-history">
                {history.map((p) => {
                  const sp = GARDEN_SPECIES[p.species_id as SpeciesId];
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        className={
                          p.id === selectedId
                            ? "garden-plant-row selected"
                            : "garden-plant-row"
                        }
                        onClick={() => setSelectedId(p.id)}
                      >
                        <span aria-hidden>{sp?.emoji ?? "🌱"}</span>
                        <span>
                          {sp?.label ?? p.species_id} · {STATUS_LABEL[p.status]}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        <section className="garden-panel garden-detail">
          <h2 className="garden-h2">Îngrijire</h2>
          {!sim || !species ? (
            <p className="garden-muted">Selectează o plantă.</p>
          ) : (
            <>
              <div className="garden-viz" aria-hidden>
                <div
                  className={`garden-viz-plant stage-${Math.min(5, Math.floor(sim.growthProgress * 5))}`}
                >
                  {species.emoji}
                </div>
                {sim.weedLevel > 0.15 && (
                  <div className="garden-viz-weeds">
                    {"🌿".repeat(Math.min(5, Math.ceil(sim.weedLevel * 5)))}
                  </div>
                )}
              </div>
              <p className="garden-plant-title">
                {species.emoji} {species.label} — {stageLabel(sim.growthProgress)}
              </p>
              <p className="garden-muted">{species.blurb}</p>
              <p>
                Status: <strong>{STATUS_LABEL[sim.status]}</strong>
              </p>

              <div className="garden-meters">
                <label>
                  Creștere {pct(Math.min(1, sim.growthProgress))}
                  <meter min={0} max={1} value={Math.min(1, sim.growthProgress)} />
                </label>
                <label>
                  Umiditate sol {pct(sim.soilMoisture)}
                  <meter min={0} max={1} value={sim.soilMoisture} />
                </label>
                <label>
                  Sănătate {pct(sim.health)}
                  <meter min={0} max={1} value={sim.health} />
                </label>
                <label>
                  Buruieni {pct(sim.weedLevel)}
                  <meter min={0} max={1} value={sim.weedLevel} />
                </label>
              </div>

              <div className="garden-actions">
                <button
                  type="button"
                  className="auth-submit"
                  disabled={busy || sim.status === "dead" || sim.status === "harvested"}
                  onClick={handleWater}
                >
                  Udă
                </button>
                <button
                  type="button"
                  className="garden-btn-secondary"
                  disabled={busy || sim.status === "dead" || sim.status === "harvested"}
                  onClick={handleWeed}
                >
                  Smulge buruieni
                </button>
                <button
                  type="button"
                  className="garden-btn-secondary"
                  disabled={
                    busy ||
                    (sim.status !== "mature" && sim.growthProgress < 0.95)
                  }
                  onClick={handleHarvest}
                >
                  Recoltează
                </button>
              </div>
              {sun.isHarshSun &&
                sim.status !== "dead" &&
                sim.status !== "harvested" && (
                  <p className="garden-warn">
                    Acum e soare tare afară (simulat pentru Alexandria). Udatul
                    funcționează, dar e mai puțin eficient.
                  </p>
                )}
            </>
          )}
        </section>
      </div>

      <p className="garden-muted garden-footnote">
        Vizualul e placeholder (emoji). Creșterea rulează în timp real pe
        serverul tău de date — poți închide pagina și te întorci mâine. GLB-uri
        3D se pot agăța ulterior pe specie.
      </p>
    </div>
  );
}
