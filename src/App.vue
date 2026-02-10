<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StyleSelector from './components/StyleSelector.vue'
import DoughCalculator from './components/DoughCalculator.vue'
import IngredientTable from './components/IngredientTable.vue'
import FermentationTimer from './components/FermentationTimer.vue'
import RecipeCard from './components/RecipeCard.vue'
import PizzaInvaders from './components/PizzaInvaders.vue'
import { useDoughCalculation } from './composables/useDoughCalculation'
import { useFermentation } from './composables/useFermentation'
import { useRecipeStorage } from './composables/useRecipeStorage'
import type { DoughInput } from './types'

const { input, result, applyStyle, loadFromUrl, toShareUrl } = useDoughCalculation()
const { schedule } = useFermentation(input, result)
const { recipes, saveRecipe, deleteRecipe } = useRecipeStorage()

const showGame = ref(false)

function handleStyleSelect(styleId: string) {
  applyStyle(styleId)
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
  <div class="min-h-screen bg-arcade-dark transition-colors">
    <!-- Header -->
    <header
      class="bg-arcade-dark border-b-2 border-neon-red text-pixel-white py-8 px-4 no-print relative overflow-hidden"
    >
      <div class="absolute inset-0 opacity-15" aria-hidden="true">
        <div class="absolute -top-4 -left-4 text-8xl animate-float-slow" style="filter: drop-shadow(0 0 8px rgba(255,214,10,0.4))">🍕</div>
        <div class="absolute top-2 right-8 text-6xl animate-float-delayed" style="filter: drop-shadow(0 0 8px rgba(57,255,20,0.4))">🌿</div>
        <div class="absolute bottom-1 left-1/3 text-5xl animate-float" style="filter: drop-shadow(0 0 8px rgba(255,45,85,0.4))">🍅</div>
      </div>
      <div class="max-w-4xl mx-auto text-center relative z-10">
        <h1 class="text-[16px] sm:text-[20px] lg:text-[24px] font-bold tracking-[3px] text-neon-yellow uppercase">
          🍕 PIZZA DOUGH CALCULATOR
        </h1>
        <p class="text-[8px] sm:text-[9px] text-neon-cyan/60 mt-3 tracking-[1px]">
          Calcola il tuo impasto perfetto con le percentuali del panificatore
        </p>
        <button
          class="mt-4 arcade-btn animate-blink"
          :class="showGame ? 'border-neon-red text-neon-red' : 'border-neon-cyan text-neon-cyan'"
          @click="showGame = !showGame"
        >
          {{ showGame ? 'BACK TO KITCHEN' : 'INSERT COIN' }}
        </button>
      </div>
    </header>

    <!-- Print header -->
    <div class="print-only text-center py-4 border-b-2 border-black mb-4">
      <h1 class="text-2xl font-bold">Ricetta Impasto Pizza</h1>
    </div>

    <!-- Game section -->
    <Transition name="arcade-slide">
      <div v-if="showGame" class="border-b-2 border-arcade-border overflow-hidden">
        <PizzaInvaders />
      </div>
    </Transition>

    <main class="max-w-4xl mx-auto px-4 py-6 lg:px-8">
      <!-- Step 1: Style -->
      <div class="no-print">
        <StyleSelector :selected-id="input.styleId" @select="handleStyleSelect" />
      </div>

      <!-- Step 2: Configure -->
      <div class="no-print">
        <DoughCalculator :input="input" @update:input="input = { ...$event }" />
      </div>

      <!-- Step 3: Results -->
      <IngredientTable :result="result" :input="input" />

      <!-- Fermentation Schedule -->
      <div class="no-print">
        <FermentationTimer :schedule="schedule" />
      </div>

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
    <footer class="text-center py-6 text-[7px] text-arcade-text/30 no-print">
      Fatto con 🍕 e ❤️ &mdash; PIZZA DOUGH CALCULATOR — ARCADE EDITION
    </footer>
  </div>
</template>
