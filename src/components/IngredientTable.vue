<script setup lang="ts">
import { computed } from 'vue'
import type { DoughResult, DoughInput, YeastType } from '../types'
import { t } from '../i18n'

const props = defineProps<{
  result: DoughResult
  input: DoughInput
}>()

const yeastKeys: Record<YeastType, string> = {
  fresh: 'recipe.yeastFresh',
  dry: 'recipe.yeastDry',
  sourdough: 'recipe.yeastSourdough',
}

const rows = computed(() => {
  const r = props.result
  const items = [
    { emoji: '\u{1F33E}', name: t('recipe.flour'), total: r.flour, perBall: r.perBall.flour },
    { emoji: '\u{1F4A7}', name: t('recipe.water'), total: r.water, perBall: r.perBall.water },
    { emoji: '\u{1F9C2}', name: t('recipe.salt'), total: r.salt, perBall: r.perBall.salt },
  ]
  if (r.oil > 0) items.push({ emoji: '\u{1FAD2}', name: t('recipe.oil'), total: r.oil, perBall: r.perBall.oil })
  if (r.sugar > 0)
    items.push({ emoji: '\u{1F36C}', name: t('recipe.sugar'), total: r.sugar, perBall: r.perBall.sugar })
  if (r.malt > 0) items.push({ emoji: '\u{1F36F}', name: t('recipe.malt'), total: r.malt, perBall: r.perBall.malt })
  items.push({
    emoji: '\u{1F35E}',
    name: t(yeastKeys[r.yeastType]),
    total: r.yeast,
    perBall: r.perBall.yeast,
  })
  return items
})

const isTray = computed(() => {
  const style = props.input.styleId
  return ['romana-teglia', 'pizza-pala', 'chicago', 'detroit', 'focaccia'].includes(style)
})
</script>

<template>
  <section class="mb-8">
    <h2 class="text-[13px] sm:text-[14px] font-bold mb-5 text-neon-cyan arcade-title">{{ t('recipe.title') }}</h2>

    <!-- Peso totale -->
    <div
      class="bg-arcade-panel border-2 border-neon-red p-5 mb-4 text-center"
    >
      <div class="text-[8px] font-medium text-neon-red/80 uppercase tracking-[2px]">{{ t('recipe.totalWeight') }}</div>
      <div class="text-[28px] sm:text-[34px] font-bold mt-2 tabular-nums animate-in text-neon-yellow tracking-[3px] border-b-3 border-neon-yellow/40 inline-block pb-1">{{ result.totalWeight }}g</div>
      <div class="text-[8px] text-arcade-text/60 mt-2">
        {{ input.numberOfBalls }}
        {{
          input.numberOfBalls === 1
            ? (isTray ? t('recipe.teglia') : t('recipe.pizza'))
            : isTray ? t('recipe.teglie') : t('recipe.pizze')
        }}
        &times; {{ input.ballWeight }}g
      </div>
    </div>

    <!-- Tabella ingredienti -->
    <div class="bg-arcade-panel border-2 border-arcade-border overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-neon-red/20 text-[8px] sm:text-[9px] text-neon-red border-b-2 border-neon-red/30">
            <th class="text-left py-3 px-4 lg:px-6">{{ t('recipe.ingredient') }}</th>
            <th class="text-right py-3 px-4 lg:px-6">{{ t('recipe.total') }}</th>
            <th class="text-right py-3 px-4 lg:px-6">{{ isTray ? t('recipe.perTray') : t('recipe.perBall') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.name"
            class="border-t border-arcade-border transition-colors hover:bg-neon-cyan/5"
          >
            <td class="py-3 px-4 lg:px-6 font-medium text-[9px] sm:text-[10px] text-arcade-text">
              <span class="mr-2">{{ row.emoji }}</span
              >{{ row.name }}
            </td>
            <td class="py-3 px-4 lg:px-6 text-right font-bold text-[13px] sm:text-[15px] text-neon-green tabular-nums tracking-[1px]">
              {{ row.total }}g
            </td>
            <td
              class="py-3 px-4 lg:px-6 text-right text-[9px] sm:text-[10px] text-arcade-text/60 tabular-nums"
            >
              {{ row.perBall }}g
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Riassunto percentuali del panificatore -->
    <div class="mt-3 text-[7px] text-arcade-text/40 text-center">
      {{ t('recipe.bakersPercent') }} | {{ t('recipe.water') }} {{ input.hydration }}% | {{ t('recipe.salt') }} {{ input.salt }}%
      <span v-if="input.oil > 0"> | {{ t('recipe.oil') }} {{ input.oil }}%</span>
      <span v-if="input.sugar > 0"> | {{ t('recipe.sugar') }} {{ input.sugar }}%</span>
      <span v-if="input.malt > 0"> | {{ t('recipe.malt') }} {{ input.malt }}%</span>
    </div>
  </section>
</template>
