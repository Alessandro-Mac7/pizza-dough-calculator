<script setup lang="ts">
import { recipePresets } from '../data/presets'
import type { DoughInput } from '../types'

const emit = defineEmits<{
  apply: [input: Partial<DoughInput>]
}>()
</script>

<template>
  <section class="mb-8">
    <h2 class="text-xl font-bold mb-3 text-wood dark:text-flour-yellow">
      Ricette Veloci
    </h2>
    <div class="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x scrollbar-hide">
      <button
        v-for="preset in recipePresets"
        :key="preset.id"
        @click="emit('apply', preset.input)"
        class="flex-shrink-0 snap-start bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border
          rounded-xl p-3 text-left transition-all duration-200 cursor-pointer
          hover:border-flour-yellow hover:shadow-md hover:-translate-y-0.5
          active:scale-[0.97] min-w-[180px]
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato"
      >
        <div class="text-lg mb-0.5">{{ preset.emoji }}</div>
        <div class="font-semibold text-sm text-wood dark:text-dark-text">{{ preset.name }}</div>
        <div class="text-xs text-wood-light dark:text-dark-text/50 mt-0.5">{{ preset.description }}</div>
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
