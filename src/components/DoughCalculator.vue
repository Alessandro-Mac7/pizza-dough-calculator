<script setup lang="ts">
import { computed } from 'vue'
import type { DoughInput, PizzaStyle } from '../types'
import { getStyleById } from '../data/styles'
import { flourTypes, getFloursForStyle } from '../data/flours'

const props = defineProps<{
  input: DoughInput
}>()

const emit = defineEmits<{
  'update:input': [input: DoughInput]
}>()

const style = computed<PizzaStyle | undefined>(() => getStyleById(props.input.styleId))

const availableFlours = computed(() => {
  if (props.input.styleId === 'custom') return flourTypes
  return getFloursForStyle(props.input.styleId)
})

function update<K extends keyof DoughInput>(key: K, value: DoughInput[K]) {
  emit('update:input', { ...props.input, [key]: value })
}

function updateNum(key: keyof DoughInput, event: Event) {
  const val = Number((event.target as HTMLInputElement).value)
  if (Number.isFinite(val)) update(key, val as DoughInput[typeof key])
}

const isTray = computed(() => style.value?.servingMode === 'tray')
</script>

<template>
  <section class="mb-8">
    <h2 class="text-2xl font-bold mb-4 text-wood dark:text-flour-yellow">
      2. Configura l'Impasto
    </h2>

    <div class="grid gap-4 sm:grid-cols-2">
      <!-- Numero pizze -->
      <div class="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md">
        <label class="block text-sm font-semibold text-wood-light dark:text-dark-text/70 mb-2">
          {{ isTray ? '🟫 Numero Teglie' : '🍕 Numero Pizze' }}
        </label>
        <div class="flex items-center gap-3">
          <button
            @click="update('numberOfBalls', Math.max(1, input.numberOfBalls - 1))"
            aria-label="Diminuisci quantità"
            class="w-12 h-12 rounded-full bg-cream dark:bg-dark-border text-xl font-bold flex items-center justify-center
              active:scale-90 transition-all cursor-pointer text-wood dark:text-dark-text
              hover:bg-flour-yellow/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato"
          >-</button>
          <span class="text-3xl font-bold text-tomato min-w-[3ch] text-center tabular-nums transition-all" aria-live="polite">
            {{ input.numberOfBalls }}
          </span>
          <button
            @click="update('numberOfBalls', Math.min(20, input.numberOfBalls + 1))"
            aria-label="Aumenta quantità"
            class="w-12 h-12 rounded-full bg-cream dark:bg-dark-border text-xl font-bold flex items-center justify-center
              active:scale-90 transition-all cursor-pointer text-wood dark:text-dark-text
              hover:bg-flour-yellow/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato"
          >+</button>
        </div>
      </div>

      <!-- Peso pallina -->
      <div class="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md">
        <label class="block text-sm font-semibold text-wood-light dark:text-dark-text/70 mb-2">
          {{ isTray ? '⚖️ Peso Teglia (g)' : '⚖️ Peso Pallina (g)' }}
        </label>
        <div class="flex items-center gap-3">
          <input
            type="range"
            :min="style?.ballWeight.min ?? 150"
            :max="style?.ballWeight.max ?? 500"
            step="10"
            :value="input.ballWeight"
            @input="updateNum('ballWeight', $event)"
            :aria-label="isTray ? 'Peso teglia' : 'Peso pallina'"
            class="flex-1"
          />
          <input
            type="number"
            :value="input.ballWeight"
            @change="updateNum('ballWeight', $event)"
            aria-label="Peso in grammi"
            class="w-20 text-center text-lg font-bold rounded-lg border border-gray-200 dark:border-dark-border
              dark:bg-dark-border py-1 text-tomato
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato"
          />
        </div>
        <div v-if="style && style.id !== 'custom'" class="text-xs text-wood-light/60 dark:text-dark-text/40 mt-1">
          Consigliato: {{ style.ballWeight.min }}-{{ style.ballWeight.max }}g
        </div>
      </div>

      <!-- Idratazione -->
      <div class="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md">
        <label class="block text-sm font-semibold text-wood-light dark:text-dark-text/70 mb-2">
          💧 Idratazione (%)
        </label>
        <div class="flex items-center gap-3">
          <input
            type="range"
            :min="style?.hydration.min ?? 50"
            :max="style?.hydration.max ?? 100"
            step="1"
            :value="input.hydration"
            @input="updateNum('hydration', $event)"
            aria-label="Percentuale idratazione"
            class="flex-1"
          />
          <input
            type="number"
            :value="input.hydration"
            @change="updateNum('hydration', $event)"
            aria-label="Percentuale idratazione"
            class="w-20 text-center text-lg font-bold rounded-lg border border-gray-200 dark:border-dark-border
              dark:bg-dark-border py-1 text-tomato
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato"
          />
        </div>
        <div v-if="style && style.id !== 'custom'" class="text-xs text-wood-light/60 dark:text-dark-text/40 mt-1">
          Consigliato: {{ style.hydration.min }}-{{ style.hydration.max }}%
        </div>
      </div>

      <!-- Farina -->
      <div class="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md">
        <label class="block text-sm font-semibold text-wood-light dark:text-dark-text/70 mb-2">
          🌾 Tipo di Farina
        </label>
        <select
          :value="input.flourId"
          @change="update('flourId', ($event.target as HTMLSelectElement).value)"
          aria-label="Tipo di farina"
          class="w-full p-3 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-border
            text-wood dark:text-dark-text text-sm cursor-pointer
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato"
        >
          <option v-for="f in availableFlours" :key="f.id" :value="f.id">
            {{ f.name }} ({{ f.protein.min }}-{{ f.protein.max }}% proteine)
          </option>
        </select>
      </div>

      <!-- Sale -->
      <div class="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md">
        <label class="block text-sm font-semibold text-wood-light dark:text-dark-text/70 mb-2">
          🧂 Sale (%)
        </label>
        <div class="flex items-center gap-3">
          <input type="range" min="0" max="5" step="0.1" :value="input.salt" @input="updateNum('salt', $event)" aria-label="Percentuale sale" class="flex-1" />
          <input type="number" :value="input.salt" step="0.1" @change="updateNum('salt', $event)" aria-label="Percentuale sale"
            class="w-20 text-center text-lg font-bold rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-border py-1 text-tomato focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato" />
        </div>
      </div>

      <!-- Olio -->
      <div class="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md">
        <label class="block text-sm font-semibold text-wood-light dark:text-dark-text/70 mb-2">
          🫒 Olio (%)
        </label>
        <div class="flex items-center gap-3">
          <input type="range" min="0" max="15" step="0.5" :value="input.oil" @input="updateNum('oil', $event)" aria-label="Percentuale olio" class="flex-1" />
          <input type="number" :value="input.oil" step="0.5" @change="updateNum('oil', $event)" aria-label="Percentuale olio"
            class="w-20 text-center text-lg font-bold rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-border py-1 text-tomato focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato" />
        </div>
      </div>

      <!-- Zucchero -->
      <div class="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md">
        <label class="block text-sm font-semibold text-wood-light dark:text-dark-text/70 mb-2">
          🍬 Zucchero (%)
        </label>
        <div class="flex items-center gap-3">
          <input type="range" min="0" max="10" step="0.5" :value="input.sugar" @input="updateNum('sugar', $event)" aria-label="Percentuale zucchero" class="flex-1" />
          <input type="number" :value="input.sugar" step="0.5" @change="updateNum('sugar', $event)" aria-label="Percentuale zucchero"
            class="w-20 text-center text-lg font-bold rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-border py-1 text-tomato focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato" />
        </div>
      </div>

      <!-- Malto -->
      <div class="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md">
        <label class="block text-sm font-semibold text-wood-light dark:text-dark-text/70 mb-2">
          🍯 Malto (%)
        </label>
        <div class="flex items-center gap-3">
          <input type="range" min="0" max="3" step="0.1" :value="input.malt" @input="updateNum('malt', $event)" aria-label="Percentuale malto" class="flex-1" />
          <input type="number" :value="input.malt" step="0.1" @change="updateNum('malt', $event)" aria-label="Percentuale malto"
            class="w-20 text-center text-lg font-bold rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-border py-1 text-tomato focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato" />
        </div>
      </div>

      <!-- Tipo Lievito -->
      <div class="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md">
        <label class="block text-sm font-semibold text-wood-light dark:text-dark-text/70 mb-2">
          🍞 Tipo di Lievito
        </label>
        <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tipo di lievito">
          <button
            v-for="yt in (['fresh', 'dry', 'sourdough'] as const)"
            :key="yt"
            @click="update('yeastType', yt)"
            :aria-pressed="input.yeastType === yt"
            role="radio"
            :aria-checked="input.yeastType === yt"
            class="py-3 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer
              active:scale-90
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato"
            :class="[
              input.yeastType === yt
                ? 'bg-tomato text-white shadow-md'
                : 'bg-cream dark:bg-dark-border text-wood dark:text-dark-text hover:bg-flour-yellow/20'
            ]"
          >
            {{ yt === 'fresh' ? '🟡 Fresco' : yt === 'dry' ? '🟤 Secco' : '🫙 Madre' }}
          </button>
        </div>
      </div>

      <!-- Metodo Lievitazione -->
      <div class="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md">
        <label class="block text-sm font-semibold text-wood-light dark:text-dark-text/70 mb-2">
          🧪 Metodo Lievitazione
        </label>
        <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Metodo di lievitazione">
          <button
            v-for="m in (['direct', 'poolish', 'biga'] as const)"
            :key="m"
            @click="update('fermentationMethod', m)"
            :aria-pressed="input.fermentationMethod === m"
            role="radio"
            :aria-checked="input.fermentationMethod === m"
            class="py-3 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer
              active:scale-90
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato"
            :class="[
              input.fermentationMethod === m
                ? 'bg-basil text-white shadow-md'
                : 'bg-cream dark:bg-dark-border text-wood dark:text-dark-text hover:bg-basil/10'
            ]"
          >
            {{ m === 'direct' ? 'Diretta' : m === 'poolish' ? 'Poolish' : 'Biga' }}
          </button>
        </div>
      </div>

      <!-- Temperatura -->
      <div class="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md">
        <label class="block text-sm font-semibold text-wood-light dark:text-dark-text/70 mb-2">
          🌡️ Temperatura (°C)
        </label>
        <div class="flex items-center gap-3">
          <input type="range" min="15" max="35" step="1" :value="input.temperatureC" @input="updateNum('temperatureC', $event)" aria-label="Temperatura ambiente" class="flex-1" />
          <span class="text-2xl font-bold text-tomato min-w-[3ch] text-center tabular-nums" aria-live="polite">
            {{ input.temperatureC }}°
          </span>
        </div>
      </div>

      <!-- Tempo Lievitazione -->
      <div class="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md">
        <label class="block text-sm font-semibold text-wood-light dark:text-dark-text/70 mb-2">
          ⏱️ Tempo Lievitazione (ore)
        </label>
        <div class="flex items-center gap-3">
          <input
            type="range"
            :min="style?.fermentationH.min ?? 1"
            :max="style?.fermentationH.max ?? 120"
            step="1"
            :value="input.fermentationTimeH"
            @input="updateNum('fermentationTimeH', $event)"
            aria-label="Tempo di lievitazione in ore"
            class="flex-1"
          />
          <input
            type="number"
            :value="input.fermentationTimeH"
            @change="updateNum('fermentationTimeH', $event)"
            aria-label="Tempo di lievitazione in ore"
            class="w-20 text-center text-lg font-bold rounded-lg border border-gray-200 dark:border-dark-border
              dark:bg-dark-border py-1 text-tomato
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato"
          />
        </div>
        <div v-if="style && style.id !== 'custom'" class="text-xs text-wood-light/60 dark:text-dark-text/40 mt-1">
          Consigliato: {{ style.fermentationH.min }}-{{ style.fermentationH.max }}h
        </div>
      </div>
    </div>
  </section>
</template>
