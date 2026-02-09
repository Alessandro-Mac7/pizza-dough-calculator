<script setup lang="ts">
import { ref } from 'vue'
import type { DoughInput, DoughResult, SavedRecipe } from '../types'

defineProps<{
  input: DoughInput
  result: DoughResult
  savedRecipes: SavedRecipe[]
}>()

const emit = defineEmits<{
  save: [name: string]
  delete: [id: string]
  load: [input: DoughInput]
  share: []
}>()

const recipeName = ref('')
const showSaveForm = ref(false)
const showSaved = ref(false)
const copied = ref(false)

function saveRecipe() {
  if (!recipeName.value.trim()) return
  emit('save', recipeName.value.trim())
  recipeName.value = ''
  showSaveForm.value = false
}

function handleShare() {
  emit('share')
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function handlePrint() {
  window.print()
}
</script>

<template>
  <section class="mb-8 no-print">
    <!-- Bottoni azione -->
    <div class="flex flex-wrap gap-3 mb-4">
      <button
        class="flex-1 min-w-[130px] py-3.5 px-4 font-semibold text-[9px] transition-all cursor-pointer active:scale-[0.95] border-2 border-neon-green bg-transparent text-neon-green hover:shadow-[0_0_12px_rgba(57,255,20,0.3)] hover:bg-neon-green/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-green"
        @click="showSaveForm = !showSaveForm"
      >
        💾 Salva Ricetta
      </button>
      <button
        class="flex-1 min-w-[130px] py-3.5 px-4 font-semibold text-[9px] transition-all cursor-pointer active:scale-[0.95] border-2 border-neon-yellow bg-transparent text-neon-yellow hover:shadow-[0_0_12px_rgba(255,214,10,0.3)] hover:bg-neon-yellow/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-yellow"
        @click="handleShare"
      >
        {{ copied ? '✅ Copiato!' : '🔗 Condividi' }}
      </button>
      <button
        class="flex-1 min-w-[130px] py-3.5 px-4 font-semibold text-[9px] transition-all cursor-pointer active:scale-[0.95] border-2 border-neon-cyan bg-transparent text-neon-cyan hover:shadow-[0_0_12px_rgba(0,245,255,0.3)] hover:bg-neon-cyan/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
        @click="handlePrint"
      >
        🖨️ Stampa
      </button>
    </div>

    <!-- Form salvataggio -->
    <Transition name="expand">
      <div v-if="showSaveForm" class="bg-arcade-panel border-2 border-arcade-border p-4 mb-4">
        <div class="flex gap-2">
          <input
            v-model="recipeName"
            placeholder="Nome ricetta..."
            class="flex-1 py-2.5 px-3 border-2 border-arcade-border bg-transparent text-[9px] text-arcade-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-green"
            @keyup.enter="saveRecipe"
          />
          <button
            :disabled="!recipeName.trim()"
            class="py-2.5 px-5 border-2 border-neon-green bg-neon-green/20 text-neon-green font-semibold text-[9px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all hover:bg-neon-green/30"
            @click="saveRecipe"
          >
            Salva
          </button>
        </div>
      </div>
    </Transition>

    <!-- Ricette salvate -->
    <div v-if="savedRecipes.length > 0">
      <button
        class="text-[9px] font-semibold text-arcade-text/60 mb-2 cursor-pointer hover:text-neon-cyan transition-colors"
        @click="showSaved = !showSaved"
      >
        📋 Le Mie Ricette ({{ savedRecipes.length }})
        <span
          class="text-[7px] transition-transform inline-block"
          :class="showSaved ? 'rotate-180' : ''"
          >▼</span
        >
      </button>

      <Transition name="expand">
        <div v-if="showSaved" class="space-y-2">
          <div
            v-for="recipe in savedRecipes"
            :key="recipe.id"
            class="bg-arcade-panel border-2 border-arcade-border p-3 flex items-center justify-between transition-all hover:border-neon-cyan/40 hover:shadow-[0_0_8px_rgba(0,245,255,0.1)]"
          >
            <button class="text-left flex-1 cursor-pointer" @click="emit('load', recipe.input)">
              <div class="font-semibold text-[9px] text-arcade-text">
                {{ recipe.name }}
              </div>
              <div class="text-[7px] text-arcade-text/50">
                {{ recipe.input.numberOfBalls }}&times;{{ recipe.input.ballWeight }}g &bull;
                {{ recipe.input.hydration }}% idratazione &bull;
                {{ new Date(recipe.createdAt).toLocaleDateString('it-IT') }}
              </div>
            </button>
            <button
              class="ml-2 text-neon-red/50 hover:text-neon-red text-[9px] cursor-pointer p-2 hover:bg-neon-red/10 transition-all"
              title="Elimina ricetta"
              @click="emit('delete', recipe.id)"
            >
              ✕
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.expand-enter-active {
  transition: all 0.25s ease-out;
}
.expand-leave-active {
  transition: all 0.2s ease-in;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
