import { computed } from 'vue'
import type { Ref } from 'vue'
import type {
  DoughInput,
  DoughResult,
  FermentationSchedule,
  FermentationStep,
  YeastType,
} from '../types'
import { calculatePoolish, calculateBiga } from '../utils/calculations'
import { t, locale } from '../i18n'

const MS_PER_HOUR = 3_600_000
const MAX_PREFERMENT_H = 18

export function useFermentation(input: Ref<DoughInput>, result: Ref<DoughResult>) {
  const schedule = computed<FermentationSchedule>(() => {
    // Read locale.value so this computed reacts to locale changes
    void locale.value

    const i = input.value
    const r = result.value
    const now = new Date()

    if (i.multiPhase?.enabled) {
      const totalH =
        i.multiPhase.roomPhase.durationH +
        i.multiPhase.coldPhase.durationH +
        i.multiPhase.temperPhase.durationH
      const readyTime = new Date(now.getTime() + totalH * MS_PER_HOUR)
      return buildMultiPhaseSchedule(i, r, readyTime)
    }

    const readyTime = new Date(now.getTime() + i.fermentationTimeH * MS_PER_HOUR)

    if (i.fermentationMethod === 'poolish') {
      return buildPreFermentSchedule(i, r, readyTime, 'poolish')
    }

    if (i.fermentationMethod === 'biga') {
      return buildPreFermentSchedule(i, r, readyTime, 'biga')
    }

    return buildDirectSchedule(i, r, readyTime)
  })

  return { schedule }
}

// --- Schedule builders ---

function buildPreFermentSchedule(
  i: DoughInput,
  r: DoughResult,
  readyTime: Date,
  method: 'poolish' | 'biga',
): FermentationSchedule {
  const preFermentTimeH = Math.min(i.fermentationTimeH * 0.5, MAX_PREFERMENT_H)
  const calc = method === 'poolish' ? calculatePoolish : calculateBiga
  const preFerment = calc(r.flour, i.temperatureC, preFermentTimeH)

  const startTime = new Date(readyTime.getTime() - i.fermentationTimeH * MS_PER_HOUR)
  const preFermentEnd = new Date(startTime.getTime() + preFermentTimeH * MS_PER_HOUR)

  const prepKey = method === 'poolish' ? 'ferm.preparePoolish' : 'ferm.prepareBiga'
  const descKey = method === 'poolish' ? 'ferm.preparePoolishDesc' : 'ferm.prepareBigaDesc'

  const steps: FermentationStep[] = [
    step(
      startTime,
      t(prepKey),
      t(descKey, {
        flour: preFerment.flour,
        water: preFerment.water,
        yeast: preFerment.yeast,
        temp: i.temperatureC,
      }),
    ),
    step(
      preFermentEnd,
      t('ferm.mixAll'),
      t('ferm.mixAllDesc', {
        flour: r.flour - preFerment.flour,
        water: r.water - preFerment.water,
        salt: r.salt,
        oilNote: oilNote(r.oil),
      }),
    ),
    step(
      addHours(preFermentEnd, 0.5),
      t('ferm.bulkRise'),
      t('ferm.bulkRiseDesc', { temp: i.temperatureC }),
    ),
    ...buildFinalSteps(i, readyTime, preFermentEnd),
  ]

  return {
    method,
    preFerment: { ...preFerment, fermentationTimeH: preFermentTimeH },
    totalYeast: preFerment.yeast,
    yeastType: 'fresh',
    steps,
  }
}

function buildDirectSchedule(i: DoughInput, r: DoughResult, readyTime: Date): FermentationSchedule {
  const startTime = new Date(readyTime.getTime() - i.fermentationTimeH * MS_PER_HOUR)

  const steps: FermentationStep[] = [
    step(
      startTime,
      t('ferm.knead'),
      t('ferm.kneadDesc', {
        yeast: r.yeast,
        yeastType: yeastLabel(i.yeastType),
        oilNote: oilNote(r.oil),
      }),
    ),
  ]

  if (i.fermentationTimeH > 12) {
    const rtHours = Math.min(2, i.fermentationTimeH * 0.1)
    steps.push(
      step(
        addHours(startTime, rtHours),
        t('ferm.roomBulk'),
        t('ferm.roomBulkDesc', { temp: i.temperatureC, hours: Math.round(rtHours) }),
      ),
      step(
        addHours(startTime, rtHours + 1),
        t('ferm.divideAndFridge'),
        t('ferm.divideAndFridgeDesc', { balls: i.numberOfBalls, weight: i.ballWeight }),
      ),
      step(
        addHours(readyTime, -2),
        t('ferm.removeFromFridge'),
        t('ferm.removeFromFridgeDesc'),
      ),
    )
  } else {
    steps.push(
      step(addHours(startTime, 1), t('ferm.bulkRise'), t('ferm.bulkRiseTemp', { temp: i.temperatureC })),
      step(
        addHours(readyTime, -1),
        t('ferm.divide'),
        t('ferm.divideDesc', { balls: i.numberOfBalls, weight: i.ballWeight }),
      ),
    )
  }

  steps.push(readyStep(readyTime))

  return {
    method: 'direct',
    totalYeast: r.yeast,
    yeastType: i.yeastType,
    steps,
  }
}

function buildFinalSteps(i: DoughInput, readyTime: Date, afterBulkStart: Date): FermentationStep[] {
  if (i.fermentationTimeH > 12) {
    return [
      step(
        addHours(afterBulkStart, 2),
        t('ferm.fridgeOnly'),
        t('ferm.fridgeOnlyDesc'),
      ),
      step(
        addHours(readyTime, -2),
        t('ferm.removeFromFridge'),
        t('ferm.removeFromFridgeDesc'),
      ),
      readyStep(readyTime),
    ]
  }

  return [
    step(
      addHours(readyTime, -1),
      t('ferm.divide'),
      t('ferm.divideDescLong', { balls: i.numberOfBalls, weight: i.ballWeight }),
    ),
    readyStep(readyTime),
  ]
}

function buildMultiPhaseSchedule(
  i: DoughInput,
  r: DoughResult,
  readyTime: Date,
): FermentationSchedule {
  const mp = i.multiPhase!
  const totalH = mp.roomPhase.durationH + mp.coldPhase.durationH + mp.temperPhase.durationH
  const startTime = new Date(readyTime.getTime() - totalH * MS_PER_HOUR)

  const roomEnd = addHours(startTime, mp.roomPhase.durationH)
  const coldEnd = addHours(roomEnd, mp.coldPhase.durationH)

  const steps: FermentationStep[] = [
    step(
      startTime,
      t('ferm.knead'),
      t('ferm.kneadDesc', {
        yeast: r.yeast,
        yeastType: yeastLabel(i.yeastType),
        oilNote: oilNote(r.oil),
      }),
    ),
  ]

  if (mp.roomPhase.durationH > 0) {
    steps.push(
      step(
        addHours(startTime, 0.5),
        t('ferm.roomBulk'),
        t('ferm.roomBulkDesc', { temp: mp.roomPhase.temperatureC, hours: mp.roomPhase.durationH }),
      ),
    )
  }

  steps.push(
    step(
      roomEnd,
      t('ferm.divideAndFridge'),
      t('ferm.divideAndFridgeMultiDesc', {
        balls: i.numberOfBalls,
        weight: i.ballWeight,
        temp: mp.coldPhase.temperatureC,
        hours: mp.coldPhase.durationH,
      }),
    ),
  )

  if (mp.temperPhase.durationH > 0) {
    steps.push(
      step(
        coldEnd,
        t('ferm.removeFromFridge'),
        t('ferm.removeFromFridgeMultiDesc', { hours: mp.temperPhase.durationH }),
      ),
    )
  }

  steps.push(readyStep(readyTime))

  return {
    method: 'direct',
    totalYeast: r.yeast,
    yeastType: i.yeastType,
    steps,
  }
}

// --- Helpers ---

function step(time: Date, action: string, description: string): FermentationStep {
  return { time: formatTime(time), action, description }
}

function readyStep(time: Date): FermentationStep {
  return step(time, t('ferm.ready'), t('ferm.readyDesc'))
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * MS_PER_HOUR)
}

function formatTime(date: Date): string {
  const loc = locale.value === 'it' ? 'it-IT' : 'en-GB'
  return date.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', hour12: false })
}

function yeastLabel(type: YeastType): string {
  const keys: Record<YeastType, string> = {
    fresh: 'ferm.yeastFresh',
    dry: 'ferm.yeastDry',
    sourdough: 'ferm.yeastSourdough',
  }
  return t(keys[type])
}

function oilNote(oilGrams: number): string {
  return oilGrams > 0 ? t('ferm.oilNote', { oil: oilGrams }) : ''
}
