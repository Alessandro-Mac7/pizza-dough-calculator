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

const MS_PER_HOUR = 3_600_000
const MAX_PREFERMENT_H = 18

export function useFermentation(input: Ref<DoughInput>, result: Ref<DoughResult>) {
  const schedule = computed<FermentationSchedule>(() => {
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
  const actionVerb =
    method === 'poolish'
      ? 'Coprire e far fermentare'
      : 'Impastare brevemente, coprire e far fermentare'

  const startTime = new Date(readyTime.getTime() - i.fermentationTimeH * MS_PER_HOUR)
  const preFermentEnd = new Date(startTime.getTime() + preFermentTimeH * MS_PER_HOUR)

  const steps: FermentationStep[] = [
    step(
      startTime,
      `Preparare ${method === 'poolish' ? 'il Poolish' : 'la Biga'}`,
      `Mescolare ${preFerment.flour}g farina + ${preFerment.water}g acqua + ${preFerment.yeast}g lievito fresco. ${actionVerb} a ${i.temperatureC}°C.`,
    ),
    step(
      preFermentEnd,
      'Impastare il Tutto',
      `Aggiungere i restanti ${r.flour - preFerment.flour}g farina, ${r.water - preFerment.water}g acqua, ${r.salt}g sale${oilNote(r.oil)}. Impastare fino a liscio.`,
    ),
    step(
      addHours(preFermentEnd, 0.5),
      'Puntata',
      `Lasciar riposare e lievitare l'impasto a ${i.temperatureC}°C.`,
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
      'Impastare',
      `Sciogliere ${r.yeast}g di ${yeastLabel(i.yeastType)} nell'acqua. Mescolare farina + acqua, autolisi 20min, aggiungere sale${oilNote(r.oil)}. Impastare fino a liscio.`,
    ),
  ]

  if (i.fermentationTimeH > 12) {
    const rtHours = Math.min(2, i.fermentationTimeH * 0.1)
    steps.push(
      step(
        addHours(startTime, rtHours),
        'Puntata a Temperatura Ambiente',
        `Lasciar lievitare a ${i.temperatureC}°C per ~${Math.round(rtHours)}h. Fare 2-3 pieghe.`,
      ),
      step(
        addHours(startTime, rtHours + 1),
        'Staglio e Frigo',
        `Dividere in ${i.numberOfBalls} panetti da ~${i.ballWeight}g. Oliare i contenitori, mettere in frigo a 4°C.`,
      ),
      step(
        addHours(readyTime, -2),
        'Tirare Fuori dal Frigo',
        'Estrarre i panetti dal frigo. Lasciar tornare a temperatura ambiente (2h).',
      ),
    )
  } else {
    steps.push(
      step(addHours(startTime, 1), 'Puntata', `Lasciar lievitare a ${i.temperatureC}°C.`),
      step(
        addHours(readyTime, -1),
        'Staglio',
        `Dividere in ${i.numberOfBalls} panetti da ~${i.ballWeight}g. Far riposare 1h prima di stendere.`,
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
        'Frigo',
        'Dividere in panetti, mettere in contenitori oliati, refrigerare a 4°C.',
      ),
      step(
        addHours(readyTime, -2),
        'Tirare Fuori dal Frigo',
        'Estrarre i panetti dal frigo. Lasciar tornare a temperatura ambiente (2h).',
      ),
      readyStep(readyTime),
    ]
  }

  return [
    step(
      addHours(readyTime, -1),
      'Staglio',
      `Dividere in ${i.numberOfBalls} panetti da ~${i.ballWeight}g ciascuno. Far riposare 1h prima di stendere.`,
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
      'Impastare',
      `Sciogliere ${r.yeast}g di ${yeastLabel(i.yeastType)} nell'acqua. Mescolare farina + acqua, autolisi 20min, aggiungere sale${oilNote(r.oil)}. Impastare fino a liscio.`,
    ),
  ]

  if (mp.roomPhase.durationH > 0) {
    steps.push(
      step(
        addHours(startTime, 0.5),
        'Puntata a Temperatura Ambiente',
        `Lasciar lievitare a ${mp.roomPhase.temperatureC}°C per ${mp.roomPhase.durationH}h. Fare 2-3 pieghe.`,
      ),
    )
  }

  steps.push(
    step(
      roomEnd,
      'Staglio e Frigo',
      `Dividere in ${i.numberOfBalls} panetti da ~${i.ballWeight}g. Oliare i contenitori, mettere in frigo a ${mp.coldPhase.temperatureC}°C per ${mp.coldPhase.durationH}h.`,
    ),
  )

  if (mp.temperPhase.durationH > 0) {
    steps.push(
      step(
        coldEnd,
        'Tirare Fuori dal Frigo',
        `Estrarre i panetti dal frigo. Lasciar tornare a temperatura ambiente (${mp.temperPhase.durationH}h).`,
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
  return step(time, 'Pronto per Stendere!', "L'impasto è pronto. Stendere, condire e infornare!")
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * MS_PER_HOUR)
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function yeastLabel(type: YeastType): string {
  const labels: Record<YeastType, string> = {
    fresh: 'lievito fresco',
    dry: 'lievito secco',
    sourdough: 'lievito madre',
  }
  return labels[type]
}

function oilNote(oilGrams: number): string {
  return oilGrams > 0 ? `, ${oilGrams}g olio` : ''
}
