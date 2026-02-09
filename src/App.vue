<script setup lang="ts">
import { onMounted } from 'vue'
import StyleSelector from './components/StyleSelector.vue'
import DoughCalculator from './components/DoughCalculator.vue'
import IngredientTable from './components/IngredientTable.vue'
import FermentationTimer from './components/FermentationTimer.vue'
import RecipePresets from './components/RecipePresets.vue'
import RecipeCard from './components/RecipeCard.vue'
import { useDoughCalculation } from './composables/useDoughCalculation'
import { useFermentation } from './composables/useFermentation'
import { useRecipeStorage } from './composables/useRecipeStorage'
import type { DoughInput } from './types'

const { input, result, applyStyle, applyPreset, loadFromUrl, toShareUrl } = useDoughCalculation()
const { schedule } = useFermentation(input, result)
const { recipes, saveRecipe, deleteRecipe } = useRecipeStorage()

function handleStyleSelect(styleId: string) {
  applyStyle(styleId)
}

function handlePresetApply(presetInput: Partial<DoughInput>) {
  applyPreset(presetInput)
}

function handleSave(name: string) {
  saveRecipe(name, input.value, result.value)
}

function handleLoad(savedInput: DoughInput) {
  input.value = { ...savedInput }
}

function handleShare() {
  navigator.clipboard.writeText(toShareUrl())
}

onMounted(() => {
  loadFromUrl()
})
</script>

<template>
  <div class="min-h-screen bg-flour-white dark:bg-dark-bg transition-colors">
    <!-- Header -->
    <header class="bg-gradient-to-br from-tomato to-tomato-dark text-white py-8 px-4 shadow-lg no-print relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute -top-4 -left-4 text-8xl animate-float-slow">🍕</div>
        <div class="absolute top-2 right-8 text-6xl animate-float-delayed">🌿</div>
        <div class="absolute bottom-1 left-1/3 text-5xl animate-float">🍅</div>
      </div>
      <div class="max-w-2xl mx-auto text-center relative z-10">
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">
          🍕 Calcolatore Impasto Pizza
        </h1>
        <p class="text-sm opacity-80 mt-2">Calcola il tuo impasto perfetto con le percentuali del panificatore</p>
      </div>
    </header>

    <!-- Print header -->
    <div class="print-only text-center py-4 border-b-2 border-black mb-4">
      <h1 class="text-2xl font-bold">Ricetta Impasto Pizza</h1>
    </div>

    <main class="max-w-2xl mx-auto px-4 py-6">
      <!-- Quick Presets -->
      <RecipePresets @apply="handlePresetApply" />

      <!-- Step 1: Style -->
      <StyleSelector
        :selected-id="input.styleId"
        @select="handleStyleSelect"
      />

      <!-- Step 2: Configure -->
      <DoughCalculator
        :input="input"
        @update:input="input = { ...$event }"
      />

      <!-- Step 3: Results -->
      <IngredientTable :result="result" :input="input" />

      <!-- Fermentation Schedule -->
      <FermentationTimer :schedule="schedule" />

      <!-- Save / Share / Print -->
      <RecipeCard
        :input="input"
        :result="result"
        :saved-recipes="recipes"
        @save="handleSave"
        @delete="deleteRecipe"
        @load="handleLoad"
        @share="handleShare"
      />
    </main>

    <!-- Footer -->
    <footer class="text-center py-6 text-xs text-wood-light/40 dark:text-dark-text/30 no-print">
      Fatto con 🍕 e ❤️ &mdash; Calcolatore Impasto Pizza
    </footer>
  </div>
</template>
