import { supabase } from "../../../../lib/supabase";
import {
  ALEXANDRIA_TELEORMAN,
  type SpeciesId,
} from "./species";
import type { PlantStatus, SimPlantState } from "./simulate";

export interface GardenPlotRow {
  id: string;
  user_id: string;
  name: string;
  latitude: number;
  longitude: number;
  last_sim_at: string;
}

export interface GardenPlantRow {
  id: string;
  plot_id: string;
  user_id: string;
  species_id: string;
  planted_at: string;
  last_sim_at: string;
  growth_progress: number;
  soil_moisture: number;
  health: number;
  weed_level: number;
  status: PlantStatus;
  last_watered_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function rowToSim(row: GardenPlantRow): SimPlantState {
  return {
    speciesId: row.species_id as SpeciesId,
    growthProgress: row.growth_progress,
    soilMoisture: row.soil_moisture,
    health: row.health,
    weedLevel: row.weed_level,
    status: row.status,
    lastWateredAt: row.last_watered_at,
    lastSimAt: row.last_sim_at,
  };
}

export async function ensurePlot(userId: string): Promise<GardenPlotRow> {
  const { data: existing, error: selErr } = await supabase
    .from("garden_plots")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing) return existing as GardenPlotRow;

  const { data, error } = await supabase
    .from("garden_plots")
    .insert({
      user_id: userId,
      name: "Parcela mea",
      latitude: ALEXANDRIA_TELEORMAN.latitude,
      longitude: ALEXANDRIA_TELEORMAN.longitude,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as GardenPlotRow;
}

export async function listPlants(userId: string): Promise<GardenPlantRow[]> {
  const { data, error } = await supabase
    .from("garden_plants")
    .select("*")
    .eq("user_id", userId)
    .order("planted_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as GardenPlantRow[];
}

export async function plantSeed(
  userId: string,
  plotId: string,
  speciesId: SpeciesId,
): Promise<GardenPlantRow> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("garden_plants")
    .insert({
      user_id: userId,
      plot_id: plotId,
      species_id: speciesId,
      planted_at: now,
      last_sim_at: now,
      growth_progress: 0,
      soil_moisture: 0.55,
      health: 1,
      weed_level: 0,
      status: "growing",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as GardenPlantRow;
}

export async function persistPlantSim(
  plantId: string,
  sim: SimPlantState,
): Promise<void> {
  const { error } = await supabase
    .from("garden_plants")
    .update({
      growth_progress: sim.growthProgress,
      soil_moisture: sim.soilMoisture,
      health: sim.health,
      weed_level: sim.weedLevel,
      status: sim.status,
      last_watered_at: sim.lastWateredAt,
      last_sim_at: sim.lastSimAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", plantId);
  if (error) throw error;
}

export async function touchPlotSim(plotId: string): Promise<void> {
  await supabase
    .from("garden_plots")
    .update({
      last_sim_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", plotId);
}

/** Câte specii mature/recoltate a avut userul (pentru unlock soft). */
export function unlockedSpeciesIds(plants: GardenPlantRow[]): Set<SpeciesId> {
  const done = new Set<SpeciesId>();
  for (const p of plants) {
    if (p.status === "mature" || p.status === "harvested") {
      done.add(p.species_id as SpeciesId);
    }
  }
  // Fasole mereu deblocată
  done.add("fasole");
  // Deblochează următoarea din ordine dacă ai terminat una
  return done;
}

export function canPlantSpecies(
  speciesId: SpeciesId,
  plants: GardenPlantRow[],
): boolean {
  if (speciesId === "fasole") return true;
  const order = ["fasole", "floarea-soarelui", "rosii", "ceapa", "ardei", "castraveti"] as SpeciesId[];
  const idx = order.indexOf(speciesId);
  if (idx <= 0) return true;
  const prev = order[idx - 1];
  return plants.some(
    (p) =>
      p.species_id === prev &&
      (p.status === "mature" || p.status === "harvested"),
  );
}
