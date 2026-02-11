<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useGameLoop } from '../composables/useGameLoop'
import { t } from '../i18n'

// ----- Constants -----
const COLS = 8
const ROWS = 5
const ENEMY_SIZE = 18
const ENEMY_PAD = 8
const PLAYER_W = 24
const PLAYER_H = 16
const BULLET_W = 4
const BULLET_H = 8
const BULLET_SPEED = 280
const PLAYER_SPEED = 200
const ENEMY_DROP = 12
const BONUS_SIZE = 14
const BONUS_SPEED = 60
const BONUS_CHANCE = 0.002

// ----- Types -----
interface Vec2 { x: number; y: number }
interface Enemy { x: number; y: number; alive: boolean }
interface Bullet { x: number; y: number }
interface Bonus { x: number; y: number }

// ----- Reactive state -----
const canvas = ref<HTMLCanvasElement>()
const score = ref(0)
const lives = ref(3)
const wave = ref(1)
const gameState = ref<'idle' | 'playing' | 'gameover'>('idle')

// Game entities (not reactive — mutated in loop)
let player: Vec2 = { x: 0, y: 0 }
let bullets: Bullet[] = []
let enemies: Enemy[] = []
let bonuses: Bonus[] = []
let enemyDir = 1
let enemySpeed = 30
let enemyTimer = 0
let shootCooldown = 0
const keys: Record<string, boolean> = {}

// Touch state
let touchLeft = false
let touchRight = false
let touchShoot = false

// Canvas sizing
const canvasW = ref(320)
const canvasH = ref(427)

const containerStyle = computed(() => ({
  maxWidth: `${canvasW.value}px`,
  margin: '0 auto',
}))

// ----- Pixel drawing helpers -----
function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(Math.round(x), Math.round(y), w, h)
}

function drawTomato(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const s = size / 2
  // Body
  drawRect(ctx, cx - s, cy - s + 2, size, size - 2, '#ff2d55')
  // Stem
  drawRect(ctx, cx - 1, cy - s, 2, 3, '#39ff14')
  // Highlight
  drawRect(ctx, cx - s + 2, cy - s + 3, 3, 2, '#ff6b8a')
}

function drawMozzarella(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  drawRect(ctx, cx - BULLET_W / 2, cy - BULLET_H / 2, BULLET_W, BULLET_H, '#f0f0f0')
  drawRect(ctx, cx - BULLET_W / 2 + 1, cy - BULLET_H / 2, BULLET_W - 2, 2, '#ffffffcc')
}

function drawPizzaPlayer(ctx: CanvasRenderingContext2D, px: number, py: number) {
  // Pizza slice — triangle-ish pixel art
  drawRect(ctx, px - 2, py - PLAYER_H, 4, 2, '#ffd60a')    // tip
  drawRect(ctx, px - 5, py - PLAYER_H + 2, 10, 2, '#ffd60a')
  drawRect(ctx, px - 8, py - PLAYER_H + 4, 16, 3, '#ffd60a')
  drawRect(ctx, px - 10, py - PLAYER_H + 7, 20, 3, '#ffd60a')
  drawRect(ctx, px - PLAYER_W / 2, py - PLAYER_H + 10, PLAYER_W, 6, '#ffd60a')
  // Crust
  drawRect(ctx, px - PLAYER_W / 2, py - 3, PLAYER_W, 3, '#c49a3c')
  // Toppings (pepperoni)
  drawRect(ctx, px - 4, py - PLAYER_H + 5, 3, 3, '#ff2d55')
  drawRect(ctx, px + 3, py - PLAYER_H + 8, 3, 3, '#ff2d55')
  drawRect(ctx, px - 1, py - PLAYER_H + 10, 3, 3, '#ff2d55')
}

function drawOlive(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const s = size / 2
  drawRect(ctx, cx - s, cy - s, size, size, '#1a1a2e')
  drawRect(ctx, cx - s + 1, cy - s + 1, size - 2, size - 2, '#2a2a2a')
  drawRect(ctx, cx - 1, cy - 1, 2, 2, '#444')
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, brightness: number) {
  ctx.fillStyle = `rgba(255,255,255,${brightness})`
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1)
}

// ----- Stars background -----
let stars: { x: number; y: number; b: number; s: number }[] = []
function initStars(w: number, h: number) {
  stars = []
  for (let i = 0; i < 60; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      b: 0.2 + Math.random() * 0.6,
      s: 0.1 + Math.random() * 0.4,
    })
  }
}

// ----- Enemies grid -----
function spawnEnemies() {
  enemies = []
  const gridW = COLS * (ENEMY_SIZE + ENEMY_PAD) - ENEMY_PAD
  const offsetX = (canvasW.value - gridW) / 2
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      enemies.push({
        x: offsetX + c * (ENEMY_SIZE + ENEMY_PAD) + ENEMY_SIZE / 2,
        y: 40 + r * (ENEMY_SIZE + ENEMY_PAD) + ENEMY_SIZE / 2,
        alive: true,
      })
    }
  }
  enemyDir = 1
  enemySpeed = 30 + wave.value * 5
  enemyTimer = 0
}

// ----- Collision (AABB) -----
function aabb(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

// ----- Game actions -----
function startGame() {
  score.value = 0
  lives.value = 3
  wave.value = 1
  gameState.value = 'playing'
  bullets = []
  bonuses = []
  player = { x: canvasW.value / 2, y: canvasH.value - 20 }
  spawnEnemies()
  initStars(canvasW.value, canvasH.value)
  loop.start()
}

function gameOver() {
  gameState.value = 'gameover'
  loop.stop()
}

function nextWave() {
  wave.value++
  bullets = []
  bonuses = []
  spawnEnemies()
}

// ----- Main update -----
function update(dt: number) {
  if (gameState.value !== 'playing') return
  const cw = canvasW.value
  const ch = canvasH.value

  // Player movement
  const moveLeft = keys['ArrowLeft'] || keys['a'] || touchLeft
  const moveRight = keys['ArrowRight'] || keys['d'] || touchRight
  if (moveLeft) player.x -= PLAYER_SPEED * dt
  if (moveRight) player.x += PLAYER_SPEED * dt
  player.x = Math.max(PLAYER_W / 2, Math.min(cw - PLAYER_W / 2, player.x))

  // Shoot
  shootCooldown -= dt
  const wantShoot = keys[' '] || keys['ArrowUp'] || touchShoot
  if (wantShoot && shootCooldown <= 0) {
    bullets.push({ x: player.x, y: player.y - PLAYER_H })
    shootCooldown = 0.25
    touchShoot = false // single shot per tap
  }

  // Bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bl = bullets[i]!
    bl.y -= BULLET_SPEED * dt
    if (bl.y < -BULLET_H) bullets.splice(i, 1)
  }

  // Enemy movement
  enemyTimer += dt * enemySpeed
  if (enemyTimer >= 1) {
    enemyTimer = 0
    let hitEdge = false
    for (const e of enemies) {
      if (!e.alive) continue
      e.x += enemyDir * (ENEMY_SIZE * 0.3)
      if (e.x < ENEMY_SIZE || e.x > cw - ENEMY_SIZE) hitEdge = true
    }
    if (hitEdge) {
      enemyDir *= -1
      for (const e of enemies) {
        if (e.alive) e.y += ENEMY_DROP
      }
    }
  }

  // Bonus spawn
  if (Math.random() < BONUS_CHANCE) {
    bonuses.push({ x: Math.random() * (cw - 20) + 10, y: -BONUS_SIZE })
  }
  for (let i = bonuses.length - 1; i >= 0; i--) {
    const bn = bonuses[i]!
    bn.y += BONUS_SPEED * dt
    if (bn.y > ch + BONUS_SIZE) bonuses.splice(i, 1)
  }

  // Collision: bullets vs enemies
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    const b = bullets[bi]!
    for (const e of enemies) {
      if (!e.alive) continue
      if (
        aabb(
          b.x - BULLET_W / 2, b.y - BULLET_H / 2, BULLET_W, BULLET_H,
          e.x - ENEMY_SIZE / 2, e.y - ENEMY_SIZE / 2, ENEMY_SIZE, ENEMY_SIZE,
        )
      ) {
        e.alive = false
        bullets.splice(bi, 1)
        score.value += 10
        break
      }
    }
  }

  // Collision: bullets vs bonuses
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    const b = bullets[bi]!
    for (let oi = bonuses.length - 1; oi >= 0; oi--) {
      const o = bonuses[oi]!
      if (
        aabb(
          b.x - BULLET_W / 2, b.y - BULLET_H / 2, BULLET_W, BULLET_H,
          o.x - BONUS_SIZE / 2, o.y - BONUS_SIZE / 2, BONUS_SIZE, BONUS_SIZE,
        )
      ) {
        bonuses.splice(oi, 1)
        bullets.splice(bi, 1)
        score.value += 50
        break
      }
    }
  }

  // Collision: enemies reaching player line
  for (const e of enemies) {
    if (e.alive && e.y + ENEMY_SIZE / 2 >= player.y - PLAYER_H) {
      gameOver()
      return
    }
  }

  // All enemies dead → next wave
  if (enemies.every((e) => !e.alive)) {
    nextWave()
  }

  // Render
  render()
}

// ----- Render -----
function render() {
  const cvs = canvas.value
  if (!cvs) return
  const ctx = cvs.getContext('2d')
  if (!ctx) return
  const cw = canvasW.value
  const ch = canvasH.value

  // Clear
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, cw, ch)

  // Stars
  for (const s of stars) {
    s.y += s.s
    if (s.y > ch) { s.y = 0; s.x = Math.random() * cw }
    drawStar(ctx, s.x, s.y, s.b)
  }

  // Enemies
  for (const e of enemies) {
    if (e.alive) drawTomato(ctx, e.x, e.y, ENEMY_SIZE)
  }

  // Bonuses
  for (const b of bonuses) {
    drawOlive(ctx, b.x, b.y, BONUS_SIZE)
  }

  // Bullets
  for (const b of bullets) {
    drawMozzarella(ctx, b.x, b.y)
  }

  // Player
  drawPizzaPlayer(ctx, player.x, player.y)

  // HUD
  ctx.fillStyle = '#ffd60a'
  ctx.font = '10px "Press Start 2P", monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`SCR ${score.value}`, 8, 16)
  ctx.textAlign = 'right'
  ctx.fillText(`WAVE ${wave.value}`, cw - 8, 16)

  // Lives
  ctx.textAlign = 'center'
  for (let i = 0; i < lives.value; i++) {
    const lx = cw / 2 - (lives.value - 1) * 10 + i * 20
    drawRect(ctx, lx - 4, 6, 8, 6, '#ffd60a')
    drawRect(ctx, lx - 3, 12, 6, 2, '#c49a3c')
  }
}

// ----- Keyboard -----
function onKeyDown(e: KeyboardEvent) {
  keys[e.key] = true
  if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault()
  if (gameState.value === 'idle' || gameState.value === 'gameover') {
    if (e.key === ' ' || e.key === 'Enter') startGame()
  }
}
function onKeyUp(e: KeyboardEvent) {
  keys[e.key] = false
}

// ----- Touch -----
function onTouchStart(e: TouchEvent) {
  e.preventDefault()
  const cvs = canvas.value
  if (!cvs) return
  const rect = cvs.getBoundingClientRect()
  for (const touch of Array.from(e.changedTouches)) {
    const rx = touch.clientX - rect.left
    if (rx < rect.width / 3) touchLeft = true
    else if (rx > (rect.width * 2) / 3) touchRight = true
    else touchShoot = true
  }
}
function onTouchEnd(e: TouchEvent) {
  e.preventDefault()
  const cvs = canvas.value
  if (!cvs) return
  const rect = cvs.getBoundingClientRect()
  for (const touch of Array.from(e.changedTouches)) {
    const rx = touch.clientX - rect.left
    if (rx < rect.width / 3) touchLeft = false
    else if (rx > (rect.width * 2) / 3) touchRight = false
  }
}
function onCanvasTap() {
  if (gameState.value === 'idle' || gameState.value === 'gameover') startGame()
}

// ----- Game loop -----
const loop = useGameLoop(update)

// ----- Size on mount -----
function resize() {
  const el = canvas.value?.parentElement
  if (!el) return
  const w = Math.min(el.clientWidth, 480)
  canvasW.value = w
  canvasH.value = Math.round(w * (4 / 3))
}

onMounted(() => {
  resize()
  initStars(canvasW.value, canvasH.value)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('resize', resize)
  render()
})

onUnmounted(() => {
  loop.stop()
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <div class="py-4 px-2" :style="containerStyle">
    <div class="text-center mb-3">
      <h2 class="text-[14px] sm:text-[16px] text-neon-red arcade-title border-neon-red mb-1">{{ t('game.title') }}</h2>
      <p class="text-[7px] text-arcade-text/50">
        {{ t('game.subtitle') }}
      </p>
    </div>

    <div class="relative border-2 border-neon-red shadow-[0_0_20px_rgba(255,45,85,0.2)]">
      <canvas
        ref="canvas"
        :width="canvasW"
        :height="canvasH"
        class="block w-full"
        style="image-rendering: pixelated"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
        @click="onCanvasTap"
      />

      <!-- Idle overlay -->
      <div
        v-if="gameState === 'idle'"
        class="absolute inset-0 flex flex-col items-center justify-center bg-arcade-dark/80 cursor-pointer"
        @click="onCanvasTap"
      >
        <div class="text-[12px] text-neon-yellow glow-text mb-4 animate-blink hidden sm:block">{{ t('game.pressStart') }}</div>
        <div class="text-[12px] text-neon-yellow glow-text mb-4 animate-blink sm:hidden">{{ t('game.tapToStart') }}</div>
        <div class="text-[7px] text-arcade-text/60 mb-2 hidden sm:block">
          {{ t('game.controls') }}
        </div>
        <div class="text-[7px] text-arcade-text/40">
          {{ t('game.mobileControls') }}
        </div>
      </div>

      <!-- Game over overlay -->
      <div
        v-if="gameState === 'gameover'"
        class="absolute inset-0 flex flex-col items-center justify-center bg-arcade-dark/85 cursor-pointer"
        @click="onCanvasTap"
      >
        <div class="text-[16px] text-neon-red glow-text mb-3">{{ t('game.gameOver') }}</div>
        <div class="text-[10px] text-neon-yellow glow-text mb-4">
          {{ t('game.score', { score }) }}
        </div>
        <div class="text-[8px] text-neon-cyan animate-blink hidden sm:block">
          {{ t('game.insertCoin') }}
        </div>
        <div class="text-[8px] text-neon-cyan animate-blink sm:hidden">
          {{ t('game.tapToContinue') }}
        </div>
      </div>
    </div>

    <!-- Controls hint for mobile -->
    <div class="mt-2 grid grid-cols-3 gap-1 sm:hidden">
      <div class="text-center text-[7px] text-arcade-text/30 border border-arcade-border/30 py-2">
        {{ t('game.left') }}
      </div>
      <div class="text-center text-[7px] text-arcade-text/30 border border-arcade-border/30 py-2">
        {{ t('game.fire') }}
      </div>
      <div class="text-center text-[7px] text-arcade-text/30 border border-arcade-border/30 py-2">
        {{ t('game.right') }}
      </div>
    </div>
  </div>
</template>
