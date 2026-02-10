<script setup lang="ts">
import { computed } from 'vue'
import type { DoughInput, PizzaStyle, MultiPhaseFermentation } from '../types'
import { getStyleById } from '../data/styles'
import { flourTypes, getFloursForStyle } from '../data/flours'
import { t } from '../i18n'

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

const multiPhaseEnabled = computed(() => props.input.multiPhase?.enabled ?? false)

const multiPhaseTotalH = computed(() => {
  const mp = props.input.multiPhase
  if (!mp?.enabled) return 0
  return mp.roomPhase.durationH + mp.coldPhase.durationH + mp.temperPhase.durationH
})

function updateMultiPhase(patch: Partial<MultiPhaseFermentation>) {
  const current = props.input.multiPhase ?? {
    enabled: false,
    roomPhase: { temperatureC: 22, durationH: 2 },
    coldPhase: { temperatureC: 4, durationH: 24 },
    temperPhase: { temperatureC: 22, durationH: 2 },
  }
  update('multiPhase', { ...current, ...patch })
}

function updateMultiPhaseNum(
  phase: 'roomPhase' | 'coldPhase' | 'temperPhase',
  field: 'temperatureC' | 'durationH',
  event: Event,
) {
  const val = Number((event.target as HTMLInputElement).value)
  if (!Number.isFinite(val)) return
  const mp = props.input.multiPhase!
  updateMultiPhase({ [phase]: { ...mp[phase], [field]: val } })
}
</script>

<template>
  <section class="mb-8">
    <h2 class="text-[13px] sm:text-[14px] font-bold mb-5 text-neon-cyan arcade-title">{{ t('calc.title') }}</h2>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Numero pizze -->
      <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30">
        <label class="block text-[8px] font-semibold text-neon-cyan/70 mb-2">
          {{ isTray ? t('calc.numberOfTrays') : t('calc.numberOfPizzas') }}
        </label>
        <div class="flex items-center gap-3">
          <button
            :aria-label="t('calc.decreaseQty')"
            class="w-12 h-12 border-2 border-neon-red bg-transparent text-xl font-bold flex items-center justify-center active:scale-90 transition-all cursor-pointer text-neon-red hover:bg-neon-red/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
            @click="update('numberOfBalls', Math.max(1, input.numberOfBalls - 1))"
          >
            -
          </button>
          <span
            class="text-[14px] font-bold text-neon-yellow min-w-[3ch] text-center tabular-nums transition-all tracking-[1px]"
            aria-live="polite"
          >
            {{ input.numberOfBalls }}
          </span>
          <button
            :aria-label="t('calc.increaseQty')"
            class="w-12 h-12 border-2 border-neon-green bg-transparent text-xl font-bold flex items-center justify-center active:scale-90 transition-all cursor-pointer text-neon-green hover:bg-neon-green/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
            @click="update('numberOfBalls', Math.min(20, input.numberOfBalls + 1))"
          >
            +
          </button>
        </div>
      </div>

      <!-- Peso pallina -->
      <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30">
        <label class="block text-[8px] font-semibold text-neon-cyan/70 mb-2">
          {{ isTray ? t('calc.trayWeight') : t('calc.ballWeight') }}
        </label>
        <div class="flex items-center gap-2 min-w-0">
          <input
            type="range"
            :min="style?.ballWeight.min ?? 150"
            :max="style?.ballWeight.max ?? 500"
            step="10"
            :value="input.ballWeight"
            :aria-label="isTray ? t('calc.trayWeight') : t('calc.ballWeight')"
            class="flex-1"
            @input="updateNum('ballWeight', $event)"
          />
          <input
            type="number"
            :value="input.ballWeight"
            :aria-label="t('calc.ballWeight')"
            class="w-16 shrink-0 text-center text-[11px] font-bold border-2 border-arcade-border bg-transparent py-1 text-neon-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
            @change="updateNum('ballWeight', $event)"
          />
        </div>
        <div
          v-if="style && style.id !== 'custom'"
          class="text-[7px] text-arcade-text/40 mt-1"
        >
          {{ t('calc.recommended', { min: style.ballWeight.min, max: style.ballWeight.max, unit: 'g' }) }}
        </div>
      </div>

      <!-- Idratazione -->
      <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30">
        <label class="block text-[8px] font-semibold text-neon-cyan/70 mb-2">
          {{ t('calc.hydration') }}
        </label>
        <div class="flex items-center gap-2 min-w-0">
          <input
            type="range"
            :min="style?.hydration.min ?? 50"
            :max="style?.hydration.max ?? 100"
            step="1"
            :value="input.hydration"
            :aria-label="t('calc.hydration')"
            class="flex-1"
            @input="updateNum('hydration', $event)"
          />
          <input
            type="number"
            :value="input.hydration"
            :aria-label="t('calc.hydration')"
            class="w-16 shrink-0 text-center text-[11px] font-bold border-2 border-arcade-border bg-transparent py-1 text-neon-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
            @change="updateNum('hydration', $event)"
          />
        </div>
        <div
          v-if="style && style.id !== 'custom'"
          class="text-[7px] text-arcade-text/40 mt-1"
        >
          {{ t('calc.recommended', { min: style.hydration.min, max: style.hydration.max, unit: '%' }) }}
        </div>
      </div>

      <!-- Farina -->
      <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30">
        <label class="block text-[8px] font-semibold text-neon-cyan/70 mb-2">
          {{ t('calc.flour') }}
        </label>
        <select
          :value="input.flourId"
          :aria-label="t('calc.flour')"
          class="w-full p-3 border-2 border-arcade-border bg-arcade-panel text-arcade-text text-[8px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
          @change="update('flourId', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="f in availableFlours" :key="f.id" :value="f.id">
            {{ t('flours.' + f.id + '.name') }} ({{ f.protein.min }}-{{ f.protein.max }}% {{ t('calc.protein') }})
          </option>
        </select>
      </div>

      <!-- Sale -->
      <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30">
        <label class="block text-[8px] font-semibold text-neon-cyan/70 mb-2">
          {{ t('calc.salt') }}
        </label>
        <div class="flex items-center gap-2 min-w-0">
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            :value="input.salt"
            :aria-label="t('calc.salt')"
            class="flex-1"
            @input="updateNum('salt', $event)"
          />
          <input
            type="number"
            :value="input.salt"
            step="0.1"
            :aria-label="t('calc.salt')"
            class="w-16 shrink-0 text-center text-[11px] font-bold border-2 border-arcade-border bg-transparent py-1 text-neon-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
            @change="updateNum('salt', $event)"
          />
        </div>
      </div>

      <!-- Olio -->
      <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30">
        <label class="block text-[8px] font-semibold text-neon-cyan/70 mb-2">
          {{ t('calc.oil') }}
        </label>
        <div class="flex items-center gap-2 min-w-0">
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            :value="input.oil"
            :aria-label="t('calc.oil')"
            class="flex-1"
            @input="updateNum('oil', $event)"
          />
          <input
            type="number"
            :value="input.oil"
            step="0.5"
            :aria-label="t('calc.oil')"
            class="w-16 shrink-0 text-center text-[11px] font-bold border-2 border-arcade-border bg-transparent py-1 text-neon-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
            @change="updateNum('oil', $event)"
          />
        </div>
      </div>

      <!-- Zucchero -->
      <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30">
        <label class="block text-[8px] font-semibold text-neon-cyan/70 mb-2">
          {{ t('calc.sugar') }}
        </label>
        <div class="flex items-center gap-2 min-w-0">
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            :value="input.sugar"
            :aria-label="t('calc.sugar')"
            class="flex-1"
            @input="updateNum('sugar', $event)"
          />
          <input
            type="number"
            :value="input.sugar"
            step="0.5"
            :aria-label="t('calc.sugar')"
            class="w-16 shrink-0 text-center text-[11px] font-bold border-2 border-arcade-border bg-transparent py-1 text-neon-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
            @change="updateNum('sugar', $event)"
          />
        </div>
      </div>

      <!-- Malto -->
      <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30">
        <label class="block text-[8px] font-semibold text-neon-cyan/70 mb-2">
          {{ t('calc.malt') }}
        </label>
        <div class="flex items-center gap-2 min-w-0">
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            :value="input.malt"
            :aria-label="t('calc.malt')"
            class="flex-1"
            @input="updateNum('malt', $event)"
          />
          <input
            type="number"
            :value="input.malt"
            step="0.1"
            :aria-label="t('calc.malt')"
            class="w-16 shrink-0 text-center text-[11px] font-bold border-2 border-arcade-border bg-transparent py-1 text-neon-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
            @change="updateNum('malt', $event)"
          />
        </div>
      </div>

      <!-- Tipo Lievito -->
      <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30 sm:col-span-2 lg:col-span-1">
        <label class="block text-[8px] font-semibold text-neon-cyan/70 mb-3">
          {{ t('calc.yeastType') }}
        </label>
        <div class="grid grid-cols-3 gap-2" role="radiogroup" :aria-label="t('calc.yeastType')">
          <button
            v-for="yt in ['fresh', 'dry', 'sourdough'] as const"
            :key="yt"
            :aria-pressed="input.yeastType === yt"
            role="radio"
            :aria-checked="input.yeastType === yt"
            class="py-3 px-2 text-[7px] font-semibold transition-all cursor-pointer active:scale-90 border-2 overflow-hidden text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
            :class="[
              input.yeastType === yt
                ? 'border-neon-red bg-neon-red/20 text-neon-red'
                : 'border-arcade-border bg-transparent text-arcade-text hover:border-neon-red/40',
            ]"
            @click="update('yeastType', yt)"
          >
            {{ yt === 'fresh' ? t('calc.yeastFresh') : yt === 'dry' ? t('calc.yeastDry') : t('calc.yeastSourdough') }}
          </button>
        </div>
      </div>

      <!-- Metodo Lievitazione -->
      <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30 sm:col-span-2 lg:col-span-2">
        <label class="block text-[8px] font-semibold text-neon-cyan/70 mb-3">
          {{ t('calc.fermentationMethod') }}
        </label>
        <div class="grid grid-cols-3 gap-2" role="radiogroup" :aria-label="t('calc.fermentationMethod')">
          <button
            v-for="m in ['direct', 'poolish', 'biga'] as const"
            :key="m"
            :aria-pressed="input.fermentationMethod === m"
            role="radio"
            :aria-checked="input.fermentationMethod === m"
            class="py-3 px-2 text-[7px] font-semibold transition-all cursor-pointer active:scale-90 border-2 overflow-hidden text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
            :class="[
              input.fermentationMethod === m
                ? 'border-neon-green bg-neon-green/20 text-neon-green'
                : 'border-arcade-border bg-transparent text-arcade-text hover:border-neon-green/40',
            ]"
            @click="update('fermentationMethod', m)"
          >
            {{ m === 'direct' ? t('calc.methodDirect') : m === 'poolish' ? t('calc.methodPoolish') : t('calc.methodBiga') }}
          </button>
        </div>
      </div>

      <!-- Toggle Lievitazione in Frigo -->
      <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30 sm:col-span-2 lg:col-span-3">
        <div class="flex items-center justify-between">
          <label class="text-[8px] font-semibold text-neon-cyan/70">
            {{ t('calc.coldFermentation') }}
          </label>
          <button
            type="button"
            role="switch"
            :aria-checked="multiPhaseEnabled"
            class="relative inline-flex h-7 w-12 items-center transition-colors cursor-pointer border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
            :class="multiPhaseEnabled ? 'bg-neon-green/30 border-neon-green' : 'bg-arcade-dark border-arcade-border'"
            @click="updateMultiPhase({ enabled: !multiPhaseEnabled })"
          >
            <span
              class="inline-block h-5 w-5 bg-neon-green transition-transform"
              :class="multiPhaseEnabled ? 'translate-x-6' : 'translate-x-0.5'"
            />
          </button>
        </div>
      </div>

      <!-- Single-phase: Temperatura + Tempo (shown when multi-phase OFF) -->
      <template v-if="!multiPhaseEnabled">
        <!-- Temperatura -->
        <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30">
          <label class="block text-[8px] font-semibold text-neon-cyan/70 mb-2">
            {{ t('calc.temperature') }}
          </label>
          <div class="flex items-center gap-2 min-w-0">
            <input
              type="range"
              min="15"
              max="35"
              step="1"
              :value="input.temperatureC"
              :aria-label="t('calc.temperature')"
              class="flex-1"
              @input="updateNum('temperatureC', $event)"
            />
            <input
              type="number"
              :value="input.temperatureC"
              :aria-label="t('calc.temperature')"
              class="w-16 shrink-0 text-center text-[11px] font-bold border-2 border-arcade-border bg-transparent py-1 text-neon-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
              @change="updateNum('temperatureC', $event)"
            />
          </div>
        </div>

        <!-- Tempo Lievitazione -->
        <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30">
          <label class="block text-[8px] font-semibold text-neon-cyan/70 mb-2">
            {{ t('calc.fermentationTime') }}
          </label>
          <div class="flex items-center gap-2 min-w-0">
            <input
              type="range"
              :min="style?.fermentationH.min ?? 1"
              :max="style?.fermentationH.max ?? 120"
              step="1"
              :value="input.fermentationTimeH"
              :aria-label="t('calc.fermentationTime')"
              class="flex-1"
              @input="updateNum('fermentationTimeH', $event)"
            />
            <input
              type="number"
              :value="input.fermentationTimeH"
              :aria-label="t('calc.fermentationTime')"
              class="w-16 shrink-0 text-center text-[11px] font-bold border-2 border-arcade-border bg-transparent py-1 text-neon-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
              @change="updateNum('fermentationTimeH', $event)"
            />
          </div>
          <div
            v-if="style && style.id !== 'custom'"
            class="text-[7px] text-arcade-text/40 mt-1"
          >
            {{ t('calc.recommended', { min: style.fermentationH.min, max: style.fermentationH.max, unit: 'h' }) }}
          </div>
        </div>
      </template>

      <!-- Multi-phase sliders (shown when multi-phase ON) -->
      <template v-if="multiPhaseEnabled && input.multiPhase">
        <!-- Fase 1: Ambiente -->
        <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30">
          <label class="block text-[8px] font-semibold text-neon-cyan/70 mb-2">
            {{ t('calc.phase1Room') }}
          </label>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-[7px] text-arcade-text/50 w-12">{{ t('calc.temp') }}</span>
              <input
                type="range"
                min="15"
                max="35"
                step="1"
                :value="input.multiPhase.roomPhase.temperatureC"
                :aria-label="t('calc.phase1Room') + ' ' + t('calc.temp')"
                class="flex-1"
                @input="updateMultiPhaseNum('roomPhase', 'temperatureC', $event)"
              />
              <span class="text-[11px] font-bold text-neon-yellow min-w-[3ch] text-center tabular-nums tracking-[1px]">
                {{ input.multiPhase.roomPhase.temperatureC }}&deg;
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[7px] text-arcade-text/50 w-12">{{ t('calc.hours') }}</span>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                :value="input.multiPhase.roomPhase.durationH"
                :aria-label="t('calc.phase1Room') + ' ' + t('calc.hours')"
                class="flex-1"
                @input="updateMultiPhaseNum('roomPhase', 'durationH', $event)"
              />
              <span class="text-[11px] font-bold text-neon-yellow min-w-[3ch] text-center tabular-nums tracking-[1px]">
                {{ input.multiPhase.roomPhase.durationH }}h
              </span>
            </div>
          </div>
        </div>

        <!-- Fase 2: Frigo -->
        <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30">
          <label class="block text-[8px] font-semibold text-neon-cyan/70 mb-2">
            {{ t('calc.phase2Fridge') }}
          </label>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-[7px] text-arcade-text/50 w-12">{{ t('calc.temp') }}</span>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                :value="input.multiPhase.coldPhase.temperatureC"
                :aria-label="t('calc.phase2Fridge') + ' ' + t('calc.temp')"
                class="flex-1"
                @input="updateMultiPhaseNum('coldPhase', 'temperatureC', $event)"
              />
              <span class="text-[11px] font-bold text-neon-green min-w-[3ch] text-center tabular-nums tracking-[1px]">
                {{ input.multiPhase.coldPhase.temperatureC }}&deg;
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[7px] text-arcade-text/50 w-12">{{ t('calc.hours') }}</span>
              <input
                type="range"
                min="4"
                max="96"
                step="1"
                :value="input.multiPhase.coldPhase.durationH"
                :aria-label="t('calc.phase2Fridge') + ' ' + t('calc.hours')"
                class="flex-1"
                @input="updateMultiPhaseNum('coldPhase', 'durationH', $event)"
              />
              <input
                type="number"
                :value="input.multiPhase.coldPhase.durationH"
                :aria-label="t('calc.phase2Fridge') + ' ' + t('calc.hours')"
                class="w-16 shrink-0 text-center text-[11px] font-bold border-2 border-arcade-border bg-transparent py-1 text-neon-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
                @change="updateMultiPhaseNum('coldPhase', 'durationH', $event)"
              />
            </div>
          </div>
        </div>

        <!-- Fase 3: Ripresa -->
        <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30">
          <label class="block text-[8px] font-semibold text-neon-cyan/70 mb-2">
            {{ t('calc.phase3Temper') }}
          </label>
          <div class="flex items-center gap-2">
            <span class="text-[7px] text-arcade-text/50 w-12">{{ t('calc.hours') }}</span>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              :value="input.multiPhase.temperPhase.durationH"
              :aria-label="t('calc.phase3Temper') + ' ' + t('calc.hours')"
              class="flex-1"
              @input="updateMultiPhaseNum('temperPhase', 'durationH', $event)"
            />
            <span class="text-[11px] font-bold text-neon-yellow min-w-[3ch] text-center tabular-nums tracking-[1px]">
              {{ input.multiPhase.temperPhase.durationH }}h
            </span>
          </div>
        </div>

        <!-- Tempo Totale -->
        <div class="bg-arcade-panel border-2 border-arcade-border p-4 transition-all hover:border-neon-cyan/30 flex items-center justify-center">
          <div class="text-center">
            <div class="text-[8px] font-semibold text-neon-cyan/70 mb-1">
              {{ t('calc.totalTime') }}
            </div>
            <span class="text-[14px] font-bold text-neon-yellow tabular-nums tracking-[1px]" aria-live="polite">
              {{ multiPhaseTotalH }}h
            </span>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
