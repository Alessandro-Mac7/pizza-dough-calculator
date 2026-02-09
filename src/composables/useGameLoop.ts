import { ref, onUnmounted } from 'vue'

export function useGameLoop(callback: (dt: number) => void) {
  const running = ref(false)
  let rafId = 0
  let lastTime = 0

  function loop(time: number) {
    if (!running.value) return
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0
    lastTime = time
    callback(dt)
    rafId = requestAnimationFrame(loop)
  }

  function start() {
    if (running.value) return
    running.value = true
    lastTime = 0
    rafId = requestAnimationFrame(loop)
  }

  function stop() {
    running.value = false
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    lastTime = 0
  }

  function pause() {
    running.value = false
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }

  onUnmounted(stop)

  return { running, start, stop, pause }
}
