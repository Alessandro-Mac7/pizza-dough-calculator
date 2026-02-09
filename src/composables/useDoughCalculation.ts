import { ref, computed } from 'vue'
import type { DoughInput, DoughResult } from '../types'
import { rangeMid, isYeastType, isFermentationMethod } from '../types'
import { calculateDough } from '../utils/calculations'
import { getStyleById } from '../data/styles'

const DEFAULT_INPUT: DoughInput = {
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
  temperatureC: 22,
  fermentationTimeH: 24,
  fermentationMethod: 'direct',
}

export function useDoughCalculation() {
  const input = ref<DoughInput>({ ...DEFAULT_INPUT })

  const result = computed<DoughResult>(() => calculateDough(input.value))

  function applyStyle(styleId: string) {
    const style = getStyleById(styleId)
    if (!style) return

    const roundDec = (n: number) => Math.round(n * 10) / 10

    input.value = {
      ...input.value,
      styleId,
      hydration: Math.round(rangeMid(style.hydration)),
      salt: roundDec(rangeMid(style.salt)),
      oil: roundDec(rangeMid(style.oil)),
      sugar: roundDec(rangeMid(style.sugar)),
      malt: roundDec(rangeMid(style.malt)),
      ballWeight: Math.round(rangeMid(style.ballWeight)),
      temperatureC: style.recommendedTempC,
      fermentationTimeH: Math.round(rangeMid(style.fermentationH)),
      flourId: style.recommendedFlours[0] ?? input.value.flourId,
    }
  }

  function applyPreset(presetInput: Partial<DoughInput>) {
    input.value = { ...input.value, ...presetInput }
  }

  function loadFromUrl() {
    const params = new URLSearchParams(window.location.search)
    if (params.size === 0) return

    const str = (key: string) => params.get(key)
    const num = (key: string) => {
      const raw = params.get(key)
      if (raw === null) return undefined
      const n = Number(raw)
      return Number.isFinite(n) ? n : undefined
    }

    const patch: Partial<DoughInput> = {}

    const style = str('style')
    if (style && getStyleById(style)) patch.styleId = style

    const flour = str('flour')
    if (flour) patch.flourId = flour

    const yeast = str('yeast')
    if (yeast && isYeastType(yeast)) patch.yeastType = yeast

    const method = str('method')
    if (method && isFermentationMethod(method)) patch.fermentationMethod = method

    const balls = num('balls')
    if (balls && balls >= 1 && balls <= 20) patch.numberOfBalls = balls

    const weight = num('weight')
    if (weight && weight >= 100 && weight <= 2000) patch.ballWeight = weight

    const hydration = num('hydration')
    if (hydration && hydration >= 40 && hydration <= 100) patch.hydration = hydration

    const salt = num('salt')
    if (salt !== undefined && salt >= 0 && salt <= 10) patch.salt = salt

    const oil = num('oil')
    if (oil !== undefined && oil >= 0 && oil <= 20) patch.oil = oil

    const sugar = num('sugar')
    if (sugar !== undefined && sugar >= 0 && sugar <= 15) patch.sugar = sugar

    const malt = num('malt')
    if (malt !== undefined && malt >= 0 && malt <= 5) patch.malt = malt

    const temp = num('temp')
    if (temp && temp >= 5 && temp <= 45) patch.temperatureC = temp

    const time = num('time')
    if (time && time >= 1 && time <= 120) patch.fermentationTimeH = time

    input.value = { ...input.value, ...patch }
  }

  function toShareUrl(): string {
    const i = input.value
    const params = new URLSearchParams({
      style: i.styleId,
      balls: String(i.numberOfBalls),
      weight: String(i.ballWeight),
      hydration: String(i.hydration),
      flour: i.flourId,
      salt: String(i.salt),
      oil: String(i.oil),
      sugar: String(i.sugar),
      malt: String(i.malt),
      yeast: i.yeastType,
      temp: String(i.temperatureC),
      time: String(i.fermentationTimeH),
      method: i.fermentationMethod,
    })
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`
  }

  return { input, result, applyStyle, applyPreset, loadFromUrl, toShareUrl }
}
