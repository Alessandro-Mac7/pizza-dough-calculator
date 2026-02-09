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
  setTimeout(() => { copied.value = false }, 2000)
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
        @click="showSaveForm = !showSaveForm"
        class="flex-1 min-w-[130px] py-3.5 px-4 rounded-xl font-semibold text-sm transition-all cursor-pointer
          active:scale-[0.95] bg-basil text-white hover:bg-basil-dark shadow-sm hover:shadow-md
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basil"
      >
        💾 Salva Ricetta
      </button>
      <button
        @click="handleShare"
        class="flex-1 min-w-[130px] py-3.5 px-4 rounded-xl font-semibold text-sm transition-all cursor-pointer
          active:scale-[0.95] bg-flour-yellow text-wood hover:bg-flour-yellow/80 shadow-sm hover:shadow-md
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flour-yellow"
      >
        {{ copied ? '✅ Copiato!' : '🔗 Condividi' }}
      </button>
      <button
        @click="handlePrint"
        class="flex-1 min-w-[130px] py-3.5 px-4 rounded-xl font-semibold text-sm transition-all cursor-pointer
          active:scale-[0.95] bg-wood text-white hover:bg-wood-light shadow-sm hover:shadow-md
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wood"
      >
        🖨️ Stampa
      </button>
    </div>

    <!-- Form salvataggio -->
    <Transition name="expand">
      <div
        v-if="showSaveForm"
        class="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm mb-4"
      >
        <div class="flex gap-2">
          <input
            v-model="recipeName"
            placeholder="Nome ricetta..."
            @keyup.enter="saveRecipe"
            class="flex-1 py-2.5 px-3 rounded-lg border border-gray-200 dark:border-dark-border
              dark:bg-dark-border text-sm text-wood dark:text-dark-text
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basil"
          />
          <button
            @click="saveRecipe"
            :disabled="!recipeName.trim()"
            class="py-2.5 px-5 rounded-lg bg-basil text-white font-semibold text-sm cursor-pointer
              disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all
              hover:bg-basil-dark"
          >
            Salva
          </button>
        </div>
      </div>
    </Transition>

    <!-- Ricette salvate -->
    <div v-if="savedRecipes.length > 0">
      <button
        @click="showSaved = !showSaved"
        class="text-sm font-semibold text-wood-light dark:text-dark-text/60 mb-2 cursor-pointer
          hover:text-wood dark:hover:text-dark-text transition-colors"
      >
        📋 Le Mie Ricette ({{ savedRecipes.length }})
        <span class="text-xs transition-transform inline-block" :class="showSaved ? 'rotate-180' : ''">▼</span>
      </button>

      <Transition name="expand">
        <div v-if="showSaved" class="space-y-2">
          <div
            v-for="recipe in savedRecipes"
            :key="recipe.id"
            class="bg-white dark:bg-dark-card rounded-lg p-3 flex items-center justify-between
              shadow-sm border border-transparent hover:border-flour-yellow/30 transition-all
              hover:shadow-md"
          >
            <button
              @click="emit('load', recipe.input)"
              class="text-left flex-1 cursor-pointer"
            >
              <div class="font-semibold text-sm text-wood dark:text-dark-text">{{ recipe.name }}</div>
              <div class="text-xs text-wood-light dark:text-dark-text/50">
                {{ recipe.input.numberOfBalls }}&times;{{ recipe.input.ballWeight }}g &bull;
                {{ recipe.input.hydration }}% idratazione &bull;
                {{ new Date(recipe.createdAt).toLocaleDateString('it-IT') }}
              </div>
            </button>
            <button
              @click="emit('delete', recipe.id)"
              class="ml-2 text-tomato/50 hover:text-tomato text-sm cursor-pointer p-2 rounded-lg
                hover:bg-tomato/10 transition-all"
              title="Elimina ricetta"
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
