<script setup lang="ts">
import { computed } from 'vue'
import type { FermentationSchedule } from '../types'

const props = defineProps<{
  schedule: FermentationSchedule
}>()

const preFermentLabel = computed(() =>
  props.schedule.method === 'poolish' ? 'Poolish' : 'Biga'
)

const preFermentHydration = computed(() =>
  props.schedule.method === 'poolish' ? '100%' : '45%'
)
</script>

<template>
  <section class="mb-8">
    <h2 class="text-2xl font-bold mb-4 text-wood dark:text-flour-yellow">
      ⏱️ Programma di Lievitazione
    </h2>

    <!-- Pre-impasto -->
    <Transition name="slide">
      <div
        v-if="schedule.preFerment"
        class="bg-basil/10 dark:bg-basil/20 border border-basil/30 rounded-2xl p-4 mb-4"
      >
        <div class="font-bold text-basil mb-2">Pre-impasto: {{ preFermentLabel }}</div>
        <div class="grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <div class="text-xs text-wood-light dark:text-dark-text/60">Farina</div>
            <div class="font-bold text-wood dark:text-dark-text">{{ schedule.preFerment.flour }}g</div>
          </div>
          <div>
            <div class="text-xs text-wood-light dark:text-dark-text/60">Acqua</div>
            <div class="font-bold text-wood dark:text-dark-text">{{ schedule.preFerment.water }}g</div>
          </div>
          <div>
            <div class="text-xs text-wood-light dark:text-dark-text/60">Lievito</div>
            <div class="font-bold text-wood dark:text-dark-text">{{ schedule.preFerment.yeast }}g</div>
          </div>
        </div>
        <div class="text-xs text-basil-dark dark:text-basil mt-2">
          Far fermentare {{ schedule.preFerment.fermentationTimeH }}h a temperatura ambiente (idratazione {{ preFermentHydration }})
        </div>
      </div>
    </Transition>

    <!-- Timeline -->
    <div class="relative pl-8" role="list" aria-label="Timeline lievitazione">
      <div class="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-flour-yellow/60 to-tomato/40 dark:from-dark-border dark:to-tomato/30" aria-hidden="true"></div>

      <TransitionGroup name="timeline">
        <div
          v-for="(step, i) in schedule.steps"
          :key="step.action + i"
          class="relative mb-4 last:mb-0"
          role="listitem"
        >
          <!-- Pallino timeline -->
          <div
            class="absolute -left-5 top-1 w-4 h-4 rounded-full border-2 border-white dark:border-dark-bg
              transition-colors duration-300"
            :class="[
              i === schedule.steps.length - 1
                ? 'bg-tomato shadow-[0_0_8px_rgba(230,57,70,0.4)]'
                : 'bg-flour-yellow'
            ]"
            aria-hidden="true"
          ></div>

          <div class="bg-white dark:bg-dark-card rounded-xl p-3 shadow-sm transition-all duration-200
            hover:shadow-md hover:-translate-y-px"
            :class="i === schedule.steps.length - 1 ? 'ring-2 ring-tomato/20' : ''"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-mono bg-cream dark:bg-dark-border rounded-md px-2 py-0.5 text-wood dark:text-dark-text font-bold">
                {{ step.time }}
              </span>
              <span class="font-bold text-sm text-wood dark:text-dark-text">
                {{ step.action }}
              </span>
            </div>
            <p class="text-xs text-wood-light dark:text-dark-text/60 leading-relaxed">
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
