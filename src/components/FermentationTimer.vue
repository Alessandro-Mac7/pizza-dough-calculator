<script setup lang="ts">
import { computed } from 'vue'
import type { FermentationSchedule } from '../types'

const props = defineProps<{
  schedule: FermentationSchedule
}>()

const preFermentLabel = computed(() => (props.schedule.method === 'poolish' ? 'Poolish' : 'Biga'))

const preFermentHydration = computed(() => (props.schedule.method === 'poolish' ? '100%' : '45%'))
</script>

<template>
  <section class="mb-8">
    <h2 class="text-[13px] sm:text-[14px] font-bold mb-5 text-neon-cyan arcade-title">
      ⏱️ PROGRAMMA DI LIEVITAZIONE
    </h2>

    <!-- Pre-impasto -->
    <Transition name="slide">
      <div
        v-if="schedule.preFerment"
        class="bg-neon-green/10 border-2 border-neon-green/30 p-4 mb-4"
      >
        <div class="font-bold text-neon-green text-[10px] mb-2 uppercase tracking-[1px]">Pre-impasto: {{ preFermentLabel }}</div>
        <div class="grid grid-cols-3 gap-3 text-center text-[9px]">
          <div>
            <div class="text-[7px] text-arcade-text/60">Farina</div>
            <div class="font-bold text-arcade-text">
              {{ schedule.preFerment.flour }}g
            </div>
          </div>
          <div>
            <div class="text-[7px] text-arcade-text/60">Acqua</div>
            <div class="font-bold text-arcade-text">
              {{ schedule.preFerment.water }}g
            </div>
          </div>
          <div>
            <div class="text-[7px] text-arcade-text/60">Lievito</div>
            <div class="font-bold text-arcade-text">
              {{ schedule.preFerment.yeast }}g
            </div>
          </div>
        </div>
        <div class="text-[7px] text-neon-green/70 mt-2">
          Far fermentare {{ schedule.preFerment.fermentationTimeH }}h a temperatura ambiente
          (idratazione {{ preFermentHydration }})
        </div>
      </div>
    </Transition>

    <!-- Timeline -->
    <div class="relative pl-8" role="list" aria-label="Timeline lievitazione">
      <div
        class="absolute left-3 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-neon-yellow/40"
        aria-hidden="true"
      ></div>

      <TransitionGroup name="timeline">
        <div
          v-for="(step, i) in schedule.steps"
          :key="step.action + i"
          class="relative mb-4 last:mb-0"
          role="listitem"
        >
          <!-- Pallino timeline — square for arcade -->
          <div
            class="absolute -left-5 top-1 w-4 h-4 border-2 border-arcade-dark transition-colors duration-300"
            :class="[
              i === schedule.steps.length - 1
                ? 'bg-neon-red shadow-[0_0_8px_rgba(255,45,85,0.5)]'
                : 'bg-neon-green',
            ]"
            aria-hidden="true"
          ></div>

          <div
            class="bg-arcade-panel border-2 border-arcade-border p-3 transition-all duration-200 hover:border-neon-cyan/30 hover:-translate-y-px"
            :class="i === schedule.steps.length - 1 ? 'border-neon-red/40 shadow-[0_0_10px_rgba(255,45,85,0.15)]' : ''"
          >
            <div class="flex items-center gap-2 mb-1">
              <span
                class="text-[8px] font-mono bg-arcade-dark border border-arcade-border px-2 py-0.5 text-neon-yellow font-bold"
              >
                {{ step.time }}
              </span>
              <span class="font-bold text-[9px] text-arcade-text">
                {{ step.action }}
              </span>
            </div>
            <p class="text-[7px] text-arcade-text/60 leading-relaxed">
              {{ step.description }}
            </p>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </section>
</template>

<style scoped>
.slide-enter-active {
  transition: all 0.3s ease-out;
}
.slide-leave-active {
  transition: all 0.2s ease-in;
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.timeline-enter-active {
  transition: all 0.4s ease-out;
}
.timeline-leave-active {
  transition: all 0.2s ease-in;
}
.timeline-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}
.timeline-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
.timeline-move {
  transition: transform 0.3s ease;
}
</style>
