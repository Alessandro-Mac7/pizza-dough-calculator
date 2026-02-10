<script setup lang="ts">
import { pizzaStyles } from '../data/styles'

defineProps<{
  selectedId: string
}>()

const emit = defineEmits<{
  select: [styleId: string]
}>()
</script>

<template>
  <section class="mb-8">
    <h2 class="text-[13px] sm:text-[14px] font-bold mb-5 text-neon-cyan arcade-title">1. SCEGLI LO STILE</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
      <button
        v-for="style in pizzaStyles"
        :key="style.id"
        class="relative p-4 text-left transition-all duration-300 border-2 cursor-pointer hover:-translate-y-0.5 active:scale-[0.97]"
        :class="[
          selectedId === style.id
            ? 'border-neon-green bg-neon-green/10 shadow-[0_0_12px_rgba(57,255,20,0.3)]'
            : 'border-arcade-border bg-arcade-panel hover:border-neon-cyan/50',
        ]"
        @click="emit('select', style.id)"
      >
        <div
          class="text-2xl mb-1 transition-transform duration-300"
          :class="selectedId === style.id ? 'scale-110' : ''"
          :style="selectedId === style.id ? 'filter: drop-shadow(0 0 6px rgba(255,214,10,0.6))' : ''"
        >
          {{ style.emoji }}
        </div>
        <div class="font-semibold text-[9px] leading-tight text-neon-yellow">
          {{ style.name }}
        </div>
        <div class="text-[7px] mt-1 text-arcade-text/60 leading-snug line-clamp-2">
          {{ style.description }}
        </div>
        <Transition name="check">
          <div
            v-if="selectedId === style.id"
            class="absolute top-2 right-2 w-5 h-5 bg-neon-green flex items-center justify-center"
          >
            <svg class="w-3 h-3 text-arcade-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </Transition>
      </button>
    </div>
  </section>
</template>

<style scoped>
.check-enter-active {
  transition: all 0.2s ease-out;
}
.check-leave-active {
  transition: all 0.15s ease-in;
}
.check-enter-from {
  opacity: 0;
  transform: scale(0);
}
.check-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>
