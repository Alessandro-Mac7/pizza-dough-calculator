import { ref, computed } from 'vue'
import type { YeastType } from '../types'
import { convertYeastWeight } from '../utils/calculations'

export function useYeastConversion() {
  const amount = ref(10)
  const fromType = ref<YeastType>('fresh')

  const conversions = computed(() => {
    const fresh = convertYeastWeight(amount.value, fromType.value, 'fresh')
    const dry = convertYeastWeight(amount.value, fromType.value, 'dry')
    const sourdough = convertYeastWeight(amount.value, fromType.value, 'sourdough')
    return { fresh, dry, sourdough }
  })

  return { amount, fromType, conversions }
}
