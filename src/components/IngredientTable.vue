<script setup lang="ts">
import { computed } from 'vue'
import type { DoughResult, DoughInput, YeastType } from '../types'

const props = defineProps<{
  result: DoughResult
  input: DoughInput
}>()

const yeastLabels: Record<YeastType, string> = {
  fresh: 'Lievito Fresco',
  dry: 'Lievito Secco',
  sourdough: 'Lievito Madre',
}

const rows = computed(() => {
  const r = props.result
  const items = [
    { emoji: '🌾', name: 'Farina', total: r.flour, perBall: r.perBall.flour },
    { emoji: '💧', name: 'Acqua', total: r.water, perBall: r.perBall.water },
    { emoji: '🧂', name: 'Sale', total: r.salt, perBall: r.perBall.salt },
  ]
  if (r.oil > 0) items.push({ emoji: '🫒', name: 'Olio', total: r.oil, perBall: r.perBall.oil })
  if (r.sugar > 0)
    items.push({ emoji: '🍬', name: 'Zucchero', total: r.sugar, perBall: r.perBall.sugar })
  if (r.malt > 0) items.push({ emoji: '🍯', name: 'Malto', total: r.malt, perBall: r.perBall.malt })
  items.push({
    emoji: '🍞',
    name: yeastLabels[r.yeastType],
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
    <h2 class="text-[13px] sm:text-[14px] font-bold mb-5 text-neon-cyan arcade-title">3. LA TUA RICETTA</h2>

    <!-- Peso totale -->
    <div
      class="bg-arcade-panel border-2 border-neon-red p-5 mb-4 text-center"
    >
      <div class="text-[8px] font-medium text-neon-red/80">Peso Totale Impasto</div>
      <div class="text-[32px] sm:text-[40px] font-bold mt-1 tabular-nums animate-in text-neon-yellow">{{ result.totalWeight }}g</div>
      <div class="text-[8px] text-arcade-text/60 mt-2">
        {{ input.numberOfBalls }}
        {{
          input.numberOfBalls === 1 ? (isTray ? 'teglia' : 'pizza') : isTray ? 'teglie' : 'pizze'
        }}
        &times; {{ input.ballWeight }}g
      </div>
    </div>

    <!-- Tabella ingredienti -->
    <div class="bg-arcade-panel border-2 border-arcade-border overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-neon-red/20 text-[8px] sm:text-[9px] text-neon-red border-b-2 border-neon-red/30">
            <th class="text-left py-3 px-4 lg:px-6">Ingrediente</th>
            <th class="text-right py-3 px-4 lg:px-6">Totale</th>
            <th class="text-right py-3 px-4 lg:px-6">{{ isTray ? 'Per teglia' : 'Per pallina' }}</th>
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
            <td class="py-3 px-4 lg:px-6 text-right font-bold text-[14px] sm:text-[16px] text-neon-green tabular-nums">
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
      % Panificatore: Farina 100% | Acqua {{ input.hydration }}% | Sale {{ input.salt }}%
      <span v-if="input.oil > 0"> | Olio {{ input.oil }}%</span>
      <span v-if="input.sugar > 0"> | Zucchero {{ input.sugar }}%</span>
      <span v-if="input.malt > 0"> | Malto {{ input.malt }}%</span>
    </div>
  </section>
</template>
