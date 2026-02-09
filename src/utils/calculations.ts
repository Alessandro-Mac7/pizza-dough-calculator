import type {
  DoughInput,
  DoughResult,
  YeastType,
  IngredientAmounts,
  FermentationPhase,
} from '../types'

// --- Named constants ---

const REFERENCE_FRESH_PERCENT = 0.1 // 0.1% = 1g/kg flour at reference conditions
const REFERENCE_TEMP_C = 20
const REFERENCE_TIME_H = 24
const TEMP_HALVING_INTERVAL_C = 5 // Every +5°C halves yeast (or time)
const POOLISH_FLOUR_RATIO = 0.5 // 50% of total flour
const POOLISH_HYDRATION = 1.0 // 100% hydration
const BIGA_FLOUR_RATIO = 0.5 // 50% of total flour
const BIGA_HYDRATION = 0.45 // 45% hydration
const BIGA_YEAST_MULTIPLIER = 6 // Biga's low hydration reduces yeast activity
const TRAY_G_PER_CM2 = 0.7
const MIN_YEAST_PERCENT = 0.01
const MAX_YEAST_PERCENT = 5
const MIN_FERMENTATION_H = 1
const MAX_FERMENTATION_H = 120

// Yeast conversion factors relative to fresh yeast
const YEAST_TO_FRESH: Record<YeastType, number> = {
  fresh: 1,
  dry: 3, // 1g dry = 3g fresh
  sourdough: 1 / 25, // 1g starter = 0.04g fresh equivalent
}

// --- Pure calculation functions ---

export function calculateDough(input: DoughInput): DoughResult {
  const totalWeight = input.numberOfBalls * input.ballWeight

  const percentToFrac = (p: number) => p / 100

  const hydrationFrac = percentToFrac(input.hydration)
  const saltFrac = percentToFrac(input.salt)
  const oilFrac = percentToFrac(input.oil)
  const sugarFrac = percentToFrac(input.sugar)
  const maltFrac = percentToFrac(input.malt)
  const yeastPercent =
    input.multiPhase?.enabled
      ? calculateMultiPhaseYeastPercent(
          [input.multiPhase.roomPhase, input.multiPhase.coldPhase, input.multiPhase.temperPhase],
          input.yeastType,
        )
      : calculateYeastPercent(input.temperatureC, input.fermentationTimeH, input.yeastType)
  const yeastFrac = percentToFrac(yeastPercent)

  const divisor = 1 + hydrationFrac + saltFrac + oilFrac + sugarFrac + maltFrac + yeastFrac
  const flour = totalWeight / divisor

  const amounts: IngredientAmounts = {
    flour: roundGrams(flour),
    water: roundGrams(flour * hydrationFrac),
    salt: roundGrams(flour * saltFrac),
    oil: roundGrams(flour * oilFrac),
    sugar: roundGrams(flour * sugarFrac),
    malt: roundGrams(flour * maltFrac),
    yeast: roundYeast(flour * yeastFrac),
  }

  const n = Math.max(1, input.numberOfBalls)
  const perBall: IngredientAmounts = {
    flour: roundGrams(flour / n),
    water: roundGrams((flour * hydrationFrac) / n),
    salt: roundGrams((flour * saltFrac) / n),
    oil: roundGrams((flour * oilFrac) / n),
    sugar: roundGrams((flour * sugarFrac) / n),
    malt: roundGrams((flour * maltFrac) / n),
    yeast: roundYeast((flour * yeastFrac) / n),
  }

  return {
    totalWeight,
    ...amounts,
    yeastType: input.yeastType,
    perBall,
  }
}

/**
 * Calculate yeast activity factor for a given temperature.
 * At 20°C the factor is 1. Higher temps increase activity, lower temps decrease it.
 */
export function yeastActivityFactor(temperatureC: number): number {
  return Math.pow(2, (temperatureC - REFERENCE_TEMP_C) / TEMP_HALVING_INTERVAL_C)
}

/**
 * Calculate "equivalent time at 20°C" for a multi-phase fermentation.
 * Each phase contributes: durationH * activityFactor(temp).
 * This converts variable-temperature fermentation into a single reference time.
 */
export function calculateEquivalentTime(phases: FermentationPhase[]): number {
  let equivalentH = 0
  for (const phase of phases) {
    equivalentH += phase.durationH * yeastActivityFactor(phase.temperatureC)
  }
  return equivalentH
}

/**
 * Calculate yeast baker's percentage for multi-phase fermentation.
 * Sums the "equivalent time at 20°C" across all phases, then applies
 * the standard yeast formula.
 */
export function calculateMultiPhaseYeastPercent(
  phases: FermentationPhase[],
  yeastType: YeastType,
): number {
  const equivalentH = calculateEquivalentTime(phases)
  if (equivalentH <= 0) return MAX_YEAST_PERCENT

  const timeFactor = REFERENCE_TIME_H / equivalentH
  const freshPercent = clamp(REFERENCE_FRESH_PERCENT * timeFactor, MIN_YEAST_PERCENT, MAX_YEAST_PERCENT)
  return convertYeast(freshPercent, 'fresh', yeastType)
}

/**
 * Calculate yeast baker's percentage based on temperature, time, and yeast type.
 *
 * Reference: fresh yeast at 20°C for 24h = ~1g per kg flour = 0.1%
 * Every +5°C halves the needed yeast (or time). Every -5°C doubles it.
 *
 * yeast% = 0.1 * (24 / time) * 2^((20 - temp) / 5)
 */
export function calculateYeastPercent(
  temperatureC: number,
  fermentationTimeH: number,
  yeastType: YeastType,
): number {
  const tempFactor = Math.pow(2, (REFERENCE_TEMP_C - temperatureC) / TEMP_HALVING_INTERVAL_C)
  const timeFactor = REFERENCE_TIME_H / fermentationTimeH

  const freshPercent = clamp(
    REFERENCE_FRESH_PERCENT * tempFactor * timeFactor,
    MIN_YEAST_PERCENT,
    MAX_YEAST_PERCENT,
  )

  return convertYeast(freshPercent, 'fresh', yeastType)
}

/**
 * Calculate fermentation time given temperature and yeast percentage.
 * Inverse of calculateYeastPercent.
 */
export function calculateFermentationTime(
  temperatureC: number,
  yeastPercent: number,
  yeastType: YeastType,
): number {
  const freshPercent = convertYeast(yeastPercent, yeastType, 'fresh')
  const tempFactor = Math.pow(2, (REFERENCE_TEMP_C - temperatureC) / TEMP_HALVING_INTERVAL_C)

  return clamp(
    (REFERENCE_FRESH_PERCENT * tempFactor * REFERENCE_TIME_H) / freshPercent,
    MIN_FERMENTATION_H,
    MAX_FERMENTATION_H,
  )
}

/**
 * Convert yeast amount between types using a lookup table.
 * All conversions go through fresh yeast as the canonical unit.
 */
export function convertYeast(amount: number, from: YeastType, to: YeastType): number {
  const freshEquivalent = amount * YEAST_TO_FRESH[from]
  return freshEquivalent / YEAST_TO_FRESH[to]
}

export function convertYeastWeight(grams: number, from: YeastType, to: YeastType): number {
  return roundYeast(convertYeast(grams, from, to))
}

/**
 * Calculate poolish pre-ferment.
 * Poolish: 50% of total flour + equal water (100% hydration) + yeast.
 */
export function calculatePoolish(
  totalFlour: number,
  temperatureC: number,
  prefermentTimeH: number,
): PreFermentCalc {
  return calculatePreFerment(
    totalFlour,
    temperatureC,
    prefermentTimeH,
    POOLISH_FLOUR_RATIO,
    POOLISH_HYDRATION,
  )
}

/**
 * Calculate biga pre-ferment.
 * Biga: 50% of total flour + 45% water (relative to biga flour) + yeast.
 */
export function calculateBiga(
  totalFlour: number,
  temperatureC: number,
  prefermentTimeH: number,
): PreFermentCalc {
  return calculatePreFerment(
    totalFlour,
    temperatureC,
    prefermentTimeH,
    BIGA_FLOUR_RATIO,
    BIGA_HYDRATION,
    BIGA_YEAST_MULTIPLIER,
  )
}

interface PreFermentCalc {
  flour: number
  water: number
  yeast: number
}

function calculatePreFerment(
  totalFlour: number,
  temperatureC: number,
  prefermentTimeH: number,
  flourRatio: number,
  hydration: number,
  yeastMultiplier: number = 1,
): PreFermentCalc {
  const flour = totalFlour * flourRatio
  const water = flour * hydration
  const yeastPercent = calculateYeastPercent(temperatureC, prefermentTimeH, 'fresh')
  const yeast = flour * (yeastPercent / 100) * yeastMultiplier

  return {
    flour: roundGrams(flour),
    water: roundGrams(water),
    yeast: roundYeast(yeast),
  }
}

/**
 * Calculate tray weight from dimensions (cm).
 * Approximate: ~0.7g per cm² for a standard pizza in teglia.
 */
export function trayWeight(widthCm: number, heightCm: number): number {
  return roundGrams(widthCm * heightCm * TRAY_G_PER_CM2)
}

export function roundGrams(g: number): number {
  return Math.round(g)
}

export function roundYeast(g: number): number {
  return Math.round(g * 10) / 10
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
