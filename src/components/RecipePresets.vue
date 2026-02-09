<script setup lang="ts">
import { recipePresets } from '../data/presets'
import type { DoughInput } from '../types'

const emit = defineEmits<{
  apply: [input: Partial<DoughInput>]
}>()
</script>

<template>
  <section class="mb-8">
    <h2 class="text-[12px] font-bold mb-3 text-neon-yellow glow-text">Ricette Veloci</h2>
    <div class="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x scrollbar-hide">
      <button
        v-for="preset in recipePresets"
        :key="preset.id"
        class="flex-shrink-0 snap-start bg-arcade-panel border-2 border-arcade-border p-3 text-left transition-all duration-200 cursor-pointer hover:border-neon-yellow hover:shadow-[0_0_10px_rgba(255,214,10,0.2)] hover:-translate-y-0.5 active:scale-[0.97] min-w-[180px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-yellow"
        @click="emit('apply', preset.input)"
      >
        <div class="text-lg mb-0.5" style="filter: drop-shadow(0 0 4px rgba(255,214,10,0.4))">{{ preset.emoji }}</div>
        <div class="font-semibold text-[9px] text-neon-yellow">{{ preset.name }}</div>
        <div class="text-[7px] text-arcade-text/50 mt-0.5">
          {{ preset.description }}
        </div>
      </button>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
