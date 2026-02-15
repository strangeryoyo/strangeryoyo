
import { Tier } from './types';

export const TIER_CONFIGS = [
  { tier: Tier.FISH, minScore: 0, label: "Tiny Fish", bgColor: "#0077be", zoom: 1 },
  { tier: Tier.HUMAN, minScore: 50, label: "Swimmers & Rafts", bgColor: "#005f9e", zoom: 0.7 },
  { tier: Tier.BOAT, minScore: 200, label: "Speedboats & Yachts", bgColor: "#004a7c", zoom: 0.5 },
  { tier: Tier.HARBOR, minScore: 800, label: "Harbors & Tankers", bgColor: "#00355a", zoom: 0.3 },
  { tier: Tier.CITY, minScore: 2500, label: "Coastal Cities", bgColor: "#002138", zoom: 0.15 },
  { tier: Tier.ISLAND, minScore: 8000, label: "Islands & Continents", bgColor: "#00101a", zoom: 0.08 },
  { tier: Tier.PLANET, minScore: 25000, label: "Planetary Predator", bgColor: "#050510", zoom: 0.04 },
  { tier: Tier.GALAXY, minScore: 100000, label: "Galactic Consumer", bgColor: "#000000", zoom: 0.015 },
  { tier: Tier.UNIVERSE, minScore: 500000, label: "Universal Devourer", bgColor: "#000000", zoom: 0.005 },
  { tier: Tier.META, minScore: 2000000, label: "THE SIMULATION", bgColor: "#000000", zoom: 0.001 },
];

export const INITIAL_SHARK_RADIUS = 18;
export const MAX_ENTITIES = 150;
export const SPAWN_INTERVAL = 1000;
