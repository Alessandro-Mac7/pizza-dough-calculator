import { describe, it, expect } from 'vitest'
import {
  calculateDough,
  calculateYeastPercent,
  calculateFermentationTime,
  convertYeast,
  convertYeastWeight,
  calculatePoolish,
  calculateBiga,
  trayWeight,
  roundGrams,
  roundYeast,
  calculateMultiPhaseYeastPercent,
  calculateEquivalentTime,
  yeastActivityFactor,
} from '../src/utils/calculations'
import type { DoughInput, FermentationPhase } from '../src/types'

// --- Helpers ---

function makeDoughInput(overrides: Partial<DoughInput> = {}): DoughInput {
  return {
    styleId: 'napoletana-stg',
    numberOfBalls: 4,
    ballWeight: 250,
    hydration: 65,
    flourId: '00-w260',
    salt: 2.8,
    oil: 0,
    sugar: 0,
    malt: 0,
    yeastType: 'fresh',
    temperatureC: 20,
    fermentationTimeH: 24,
    fermentationMethod: 'direct',
    ...overrides,
  }
}

function sumIngredients(r: ReturnType<typeof calculateDough>): number {
  return r.flour + r.water + r.salt + r.oil + r.sugar + r.malt + r.yeast
}

// --- Tests ---

describe('roundGrams', () => {
  it('rounds to whole numbers', () => {
    expect(roundGrams(595.3)).toBe(595)
    expect(roundGrams(595.7)).toBe(596)
    expect(roundGrams(0)).toBe(0)
    expect(roundGrams(-1.5)).toBe(-1)
  })
})

describe('roundYeast', () => {
  it('rounds to 1 decimal', () => {
    expect(roundYeast(1.83)).toBe(1.8)
    expect(roundYeast(1.87)).toBe(1.9)
    expect(roundYeast(0)).toBe(0)
    expect(roundYeast(0.05)).toBe(0.1)
  })
})

describe('calculateDough — Napoletana classica (CLAUDE.md reference)', () => {
  const input = makeDoughInput()

  it('calculates total weight correctly', () => {
    const result = calculateDough(input)
    expect(result.totalWeight).toBe(1000)
  })

  it('calculates flour close to 595g (reference example)', () => {
    const result = calculateDough(input)
    expect(result.flour).toBeGreaterThan(585)
    expect(result.flour).toBeLessThan(600)
  })

  it('water equals flour * hydration (rounded)', () => {
    const result = calculateDough(input)
    expect(result.water).toBe(Math.round(result.flour * 0.65))
  })

  it('salt equals flour * salt% (rounded)', () => {
    const result = calculateDough(input)
    expect(result.salt).toBe(Math.round(result.flour * 0.028))
  })

  it('sums to total weight within rounding tolerance', () => {
    const result = calculateDough(input)
    expect(Math.abs(sumIngredients(result) - 1000)).toBeLessThan(2)
  })

  it('has zero oil for Napoletana', () => {
    expect(calculateDough(input).oil).toBe(0)
  })

  it('calculates per-ball amounts', () => {
    const result = calculateDough(input)
    expect(result.perBall.flour).toBe(roundGrams(result.flour / 4))
    expect(result.perBall.water).toBe(roundGrams(result.water / 4))
  })

  it('preserves yeastType in result', () => {
    expect(calculateDough(input).yeastType).toBe('fresh')
  })
})

describe('calculateDough — Focaccia (high hydration)', () => {
  const input = makeDoughInput({
    styleId: 'focaccia',
    numberOfBalls: 1,
    ballWeight: 900,
    hydration: 85,
    salt: 2.5,
    oil: 6,
    temperatureC: 24,
    fermentationTimeH: 8,
  })

  it('sums to total weight', () => {
    expect(Math.abs(sumIngredients(calculateDough(input)) - 900)).toBeLessThan(2)
  })

  it('water is approximately 85% of flour', () => {
    const result = calculateDough(input)
    const ratio = result.water / result.flour
    expect(ratio).toBeGreaterThan(0.83)
    expect(ratio).toBeLessThan(0.87)
  })

  it('oil is non-zero', () => {
    expect(calculateDough(input).oil).toBeGreaterThan(0)
  })
})

describe('calculateDough — edge cases', () => {
  it('handles single ball', () => {
    const result = calculateDough(makeDoughInput({ numberOfBalls: 1, ballWeight: 250 }))
    expect(result.totalWeight).toBe(250)
    expect(result.perBall.flour).toBe(result.flour)
  })

  it('protects against zero numberOfBalls (uses 1 as minimum)', () => {
    const result = calculateDough(makeDoughInput({ numberOfBalls: 0 }))
    // totalWeight = 0 * 250 = 0, but perBall should not crash (Math.max(1, n))
    expect(Number.isFinite(result.perBall.flour)).toBe(true)
  })

  it('handles all percentages at zero', () => {
    const result = calculateDough(makeDoughInput({ salt: 0, oil: 0, sugar: 0, malt: 0 }))
    expect(result.salt).toBe(0)
    expect(result.oil).toBe(0)
    expect(result.sugar).toBe(0)
    expect(result.malt).toBe(0)
  })

  it('handles very high hydration', () => {
    const result = calculateDough(makeDoughInput({ hydration: 95 }))
    expect(result.water).toBeGreaterThan(result.flour * 0.93)
    expect(sumIngredients(result)).toBeCloseTo(1000, -1)
  })
})

describe('calculateYeastPercent', () => {
  it('returns ~0.1% for fresh yeast at 20°C/24h (reference)', () => {
    expect(calculateYeastPercent(20, 24, 'fresh')).toBeCloseTo(0.1, 1)
  })

  it('halves yeast when temperature rises by 5°C', () => {
    const at20 = calculateYeastPercent(20, 24, 'fresh')
    const at25 = calculateYeastPercent(25, 24, 'fresh')
    expect(at25).toBeCloseTo(at20 / 2, 1)
  })

  it('doubles yeast when temperature drops by 5°C', () => {
    const at20 = calculateYeastPercent(20, 24, 'fresh')
    const at15 = calculateYeastPercent(15, 24, 'fresh')
    expect(at15).toBeCloseTo(at20 * 2, 1)
  })

  it('doubles yeast when time is halved', () => {
    const at24h = calculateYeastPercent(20, 24, 'fresh')
    const at12h = calculateYeastPercent(20, 12, 'fresh')
    expect(at12h).toBeCloseTo(at24h * 2, 1)
  })

  it('returns dry yeast as fresh / 3', () => {
    const fresh = calculateYeastPercent(20, 24, 'fresh')
    const dry = calculateYeastPercent(20, 24, 'dry')
    expect(dry).toBeCloseTo(fresh / 3, 2)
  })

  it('returns sourdough as fresh * 25', () => {
    const fresh = calculateYeastPercent(20, 24, 'fresh')
    const sd = calculateYeastPercent(20, 24, 'sourdough')
    expect(sd).toBeCloseTo(fresh * 25, 1)
  })

  it('clamps at minimum (very long fermentation)', () => {
    const pct = calculateYeastPercent(20, 1000, 'fresh')
    expect(pct).toBeGreaterThanOrEqual(0.01)
  })

  it('clamps at maximum (very short fermentation + high temp)', () => {
    const pct = calculateYeastPercent(35, 1, 'fresh')
    expect(pct).toBeLessThanOrEqual(5)
  })
})

describe('calculateFermentationTime', () => {
  it('returns ~24h for 0.1% fresh yeast at 20°C', () => {
    expect(calculateFermentationTime(20, 0.1, 'fresh')).toBeCloseTo(24, 0)
  })

  it('halves time when temperature rises by 5°C', () => {
    const at20 = calculateFermentationTime(20, 0.1, 'fresh')
    const at25 = calculateFermentationTime(25, 0.1, 'fresh')
    expect(at25).toBeCloseTo(at20 / 2, 0)
  })

  it('clamps minimum at 1h', () => {
    expect(calculateFermentationTime(35, 5, 'fresh')).toBeGreaterThanOrEqual(1)
  })

  it('clamps maximum at 120h', () => {
    expect(calculateFermentationTime(5, 0.001, 'fresh')).toBeLessThanOrEqual(120)
  })
})

describe('convertYeast', () => {
  it('fresh -> dry divides by 3', () => {
    expect(convertYeast(3, 'fresh', 'dry')).toBeCloseTo(1, 5)
  })

  it('dry -> fresh multiplies by 3', () => {
    expect(convertYeast(1, 'dry', 'fresh')).toBeCloseTo(3, 5)
  })

  it('fresh -> sourdough multiplies by 25', () => {
    expect(convertYeast(1, 'fresh', 'sourdough')).toBeCloseTo(25, 5)
  })

  it('sourdough -> fresh divides by 25', () => {
    expect(convertYeast(25, 'sourdough', 'fresh')).toBeCloseTo(1, 5)
  })

  it('same type is identity', () => {
    expect(convertYeast(5, 'fresh', 'fresh')).toBeCloseTo(5, 5)
    expect(convertYeast(5, 'dry', 'dry')).toBeCloseTo(5, 5)
    expect(convertYeast(5, 'sourdough', 'sourdough')).toBeCloseTo(5, 5)
  })

  it('round-trips through fresh and back', () => {
    const original = 7
    const asFresh = convertYeast(original, 'dry', 'fresh')
    const backToDry = convertYeast(asFresh, 'fresh', 'dry')
    expect(backToDry).toBeCloseTo(original, 5)
  })
})

describe('convertYeastWeight', () => {
  it('converts 10g fresh to ~3.3g dry (rounded)', () => {
    expect(convertYeastWeight(10, 'fresh', 'dry')).toBeCloseTo(3.3, 0)
  })

  it('converts 10g fresh to 250g sourdough', () => {
    expect(convertYeastWeight(10, 'fresh', 'sourdough')).toBe(250)
  })
})

describe('calculatePoolish', () => {
  it('uses 50% of total flour', () => {
    expect(calculatePoolish(600, 20, 12).flour).toBe(300)
  })

  it('has 100% hydration (flour equals water)', () => {
    const poolish = calculatePoolish(600, 20, 12)
    expect(poolish.water).toBe(poolish.flour)
  })

  it('calculates positive yeast amount', () => {
    expect(calculatePoolish(600, 20, 12).yeast).toBeGreaterThan(0)
  })
})

describe('calculateBiga', () => {
  it('uses 50% of total flour', () => {
    expect(calculateBiga(600, 20, 12).flour).toBe(300)
  })

  it('has 45% hydration', () => {
    expect(calculateBiga(600, 20, 12).water).toBe(roundGrams(300 * 0.45))
  })

  it('calculates positive yeast amount', () => {
    expect(calculateBiga(600, 20, 12).yeast).toBeGreaterThan(0)
  })
})

describe('trayWeight', () => {
  it('calculates weight for 40x30 tray', () => {
    expect(trayWeight(40, 30)).toBe(840)
  })

  it('handles square tray', () => {
    expect(trayWeight(30, 30)).toBe(630)
  })
})

describe('calculateBiga — corrected yeast multiplier', () => {
  it('produces ~5-7x more yeast than poolish for same conditions', () => {
    const poolish = calculatePoolish(600, 20, 16)
    const biga = calculateBiga(600, 20, 16)
    const ratio = biga.yeast / poolish.yeast
    expect(ratio).toBeGreaterThan(4)
    expect(ratio).toBeLessThan(8)
  })

  it('produces ~1% yeast at 20°C/16h (professional reference)', () => {
    // 300g flour in biga (50% of 600g), professional ref ~1% = 3g
    const biga = calculateBiga(600, 20, 16)
    const yeastPercent = (biga.yeast / biga.flour) * 100
    expect(yeastPercent).toBeGreaterThan(0.5)
    expect(yeastPercent).toBeLessThan(1.5)
  })
})

describe('yeastActivityFactor', () => {
  it('returns 1 at reference temperature (20°C)', () => {
    expect(yeastActivityFactor(20)).toBeCloseTo(1, 5)
  })

  it('returns ~0.109 at 4°C (fridge)', () => {
    // 2^((4-20)/5) = 2^(-3.2) ≈ 0.109
    expect(yeastActivityFactor(4)).toBeCloseTo(0.109, 2)
  })

  it('returns 2 at 25°C', () => {
    expect(yeastActivityFactor(25)).toBeCloseTo(2, 1)
  })
})

describe('calculateEquivalentTime', () => {
  it('returns exact hours for single phase at 20°C', () => {
    const phases: FermentationPhase[] = [{ temperatureC: 20, durationH: 24 }]
    expect(calculateEquivalentTime(phases)).toBeCloseTo(24, 1)
  })

  it('fridge 24h at 4°C → ~2.6h equivalent', () => {
    const phases: FermentationPhase[] = [{ temperatureC: 4, durationH: 24 }]
    const eq = calculateEquivalentTime(phases)
    expect(eq).toBeGreaterThan(2)
    expect(eq).toBeLessThan(3.5)
  })

  it('multi-phase: 2h@22 + 46h@4 + 2h@22 → reasonable equivalent', () => {
    const phases: FermentationPhase[] = [
      { temperatureC: 22, durationH: 2 },
      { temperatureC: 4, durationH: 46 },
      { temperatureC: 22, durationH: 2 },
    ]
    const eq = calculateEquivalentTime(phases)
    // 2*1.32 + 46*0.109 + 2*1.32 ≈ 2.64 + 5.01 + 2.64 = 10.29
    expect(eq).toBeGreaterThan(8)
    expect(eq).toBeLessThan(13)
  })
})

describe('calculateMultiPhaseYeastPercent', () => {
  it('matches single-phase formula when only room temp phase', () => {
    const phases: FermentationPhase[] = [{ temperatureC: 20, durationH: 24 }]
    const mp = calculateMultiPhaseYeastPercent(phases, 'fresh')
    const sp = calculateYeastPercent(20, 24, 'fresh')
    expect(mp).toBeCloseTo(sp, 1)
  })

  it('fridge-only 4°C/24h → ~0.9% fresh (ref: ~9g/kg)', () => {
    const phases: FermentationPhase[] = [{ temperatureC: 4, durationH: 24 }]
    const pct = calculateMultiPhaseYeastPercent(phases, 'fresh')
    // ~9g/kg = 0.9%
    expect(pct).toBeGreaterThan(0.5)
    expect(pct).toBeLessThan(1.5)
  })

  it('room phase reduces needed yeast compared to fridge-only', () => {
    const fridgeOnly: FermentationPhase[] = [{ temperatureC: 4, durationH: 24 }]
    const withRoom: FermentationPhase[] = [
      { temperatureC: 22, durationH: 2 },
      { temperatureC: 4, durationH: 24 },
      { temperatureC: 22, durationH: 2 },
    ]
    const pctFridge = calculateMultiPhaseYeastPercent(fridgeOnly, 'fresh')
    const pctWithRoom = calculateMultiPhaseYeastPercent(withRoom, 'fresh')
    expect(pctWithRoom).toBeLessThan(pctFridge)
  })

  it('room 20°C/8h → ~3g/kg = ~0.3%', () => {
    const phases: FermentationPhase[] = [{ temperatureC: 20, durationH: 8 }]
    const pct = calculateMultiPhaseYeastPercent(phases, 'fresh')
    // 0.1 * (24/8) = 0.3%
    expect(pct).toBeCloseTo(0.3, 1)
  })

  it('room 20°C/24h → ~1g/kg = ~0.1%', () => {
    const phases: FermentationPhase[] = [{ temperatureC: 20, durationH: 24 }]
    const pct = calculateMultiPhaseYeastPercent(phases, 'fresh')
    expect(pct).toBeCloseTo(0.1, 1)
  })
})

describe('calculateDough with multi-phase', () => {
  it('uses multi-phase yeast when enabled', () => {
    const input = makeDoughInput({
      multiPhase: {
        enabled: true,
        roomPhase: { temperatureC: 22, durationH: 2 },
        coldPhase: { temperatureC: 4, durationH: 24 },
        temperPhase: { temperatureC: 22, durationH: 2 },
      },
    })
    const result = calculateDough(input)
    // With fridge, yeast should be higher than room-temp 24h
    const singlePhaseResult = calculateDough(makeDoughInput())
    expect(result.yeast).toBeGreaterThan(singlePhaseResult.yeast)
  })

  it('ignores multi-phase when disabled', () => {
    const input = makeDoughInput({
      multiPhase: {
        enabled: false,
        roomPhase: { temperatureC: 22, durationH: 2 },
        coldPhase: { temperatureC: 4, durationH: 24 },
        temperPhase: { temperatureC: 22, durationH: 2 },
      },
    })
    const resultWithMpOff = calculateDough(input)
    const resultNoMp = calculateDough(makeDoughInput())
    expect(resultWithMpOff.yeast).toBeCloseTo(resultNoMp.yeast, 1)
  })

  it('sums to total weight with multi-phase', () => {
    const input = makeDoughInput({
      multiPhase: {
        enabled: true,
        roomPhase: { temperatureC: 22, durationH: 2 },
        coldPhase: { temperatureC: 4, durationH: 48 },
        temperPhase: { temperatureC: 22, durationH: 2 },
      },
    })
    const result = calculateDough(input)
    expect(Math.abs(sumIngredients(result) - 1000)).toBeLessThan(2)
  })
})
