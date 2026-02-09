export type YeastType = 'fresh' | 'dry' | 'sourdough'

export type FermentationMethod = 'direct' | 'poolish' | 'biga'

export type ServingMode = 'balls' | 'tray'

export interface Range {
  min: number
  max: number
}

export interface FlourType {
  id: string
  name: string
  w: Range
  protein: Range
  pl: string
  description: string
  recommendedStyles: string[]
}

export interface PizzaStyle {
  id: string
  name: string
  emoji: string
  description: string
  hydration: Range
  salt: Range
  oil: Range
  sugar: Range
  malt: Range
  ballWeight: Range
  fermentationH: Range
  recommendedTempC: number
  recommendedFlours: string[]
  servingMode: ServingMode
  trayDefaultCm?: number
}

export interface DoughInput {
  styleId: string
  numberOfBalls: number
  ballWeight: number
  hydration: number
  flourId: string
  salt: number
  oil: number
  sugar: number
  malt: number
  yeastType: YeastType
  temperatureC: number
  fermentationTimeH: number
  fermentationMethod: FermentationMethod
}

export interface DoughResult {
  totalWeight: number
  flour: number
  water: number
  salt: number
  oil: number
  sugar: number
  malt: number
  yeast: number
  yeastType: YeastType
  perBall: IngredientAmounts
}

export interface IngredientAmounts {
  flour: number
  water: number
  salt: number
  oil: number
  sugar: number
  malt: number
  yeast: number
}

export interface PreFermentResult {
  flour: number
  water: number
  yeast: number
  fermentationTimeH: number
}

export interface FermentationSchedule {
  method: FermentationMethod
  preFerment?: PreFermentResult
  totalYeast: number
  yeastType: YeastType
  steps: FermentationStep[]
}

export interface FermentationStep {
  time: string
  action: string
  description: string
}

export interface SavedRecipe {
  id: string
  name: string
  createdAt: string
  input: DoughInput
  result: DoughResult
}

export interface RecipePreset {
  id: string
  name: string
  description: string
  emoji: string
  input: Partial<DoughInput>
}

export const YEAST_TYPES: readonly YeastType[] = ['fresh', 'dry', 'sourdough'] as const
export const FERMENTATION_METHODS: readonly FermentationMethod[] = ['direct', 'poolish', 'biga'] as const

export function isYeastType(v: string): v is YeastType {
  return (YEAST_TYPES as readonly string[]).includes(v)
}

export function isFermentationMethod(v: string): v is FermentationMethod {
  return (FERMENTATION_METHODS as readonly string[]).includes(v)
}

export function rangeMid(r: Range): number {
  return (r.min + r.max) / 2
}
