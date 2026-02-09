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
    <h2 class="text-2xl font-bold mb-4 text-wood dark:text-flour-yellow">
      1. Scegli lo Stile
    </h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <button
        v-for="style in pizzaStyles"
        :key="style.id"
        @click="emit('select', style.id)"
        class="relative p-4 rounded-xl text-left transition-all duration-300 border-2 cursor-pointer
          hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97]"
        :class="[
          selectedId === style.id
            ? 'border-tomato bg-tomato/10 dark:bg-tomato/20 shadow-md ring-2 ring-tomato/20'
            : 'border-transparent bg-white dark:bg-dark-card hover:border-flour-yellow/50'
        ]"
      >
        <div class="text-2xl mb-1 transition-transform duration-300"
          :class="selectedId === style.id ? 'scale-110' : ''">
          {{ style.emoji }}
        </div>
        <div class="font-semibold text-sm leading-tight text-wood dark:text-dark-text">
          {{ style.name }}
        </div>
        <div class="text-xs mt-1 text-wood-light dark:text-dark-text/60 leading-snug line-clamp-2">
          {{ style.description }}
        </div>
        <Transition name="check">
          <div
            v-if="selectedId === style.id"
            class="absolute top-2 right-2 w-5 h-5 bg-tomato rounded-full flex items-center justify-center"
          >
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
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
