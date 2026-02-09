# pizza-dough-calculator — Professional Pizza Dough Calculator

## Overview
Calcolatore professionale per impasti pizza basato su baker's percentages.
L'utente sceglie stile, configura parametri (idratazione, peso, lievito, temperatura),
e ottiene la ricetta completa con programma di lievitazione.
12 stili preimpostati + custom. PWA installabile e usabile offline in cucina.

## Tech
- **Vue.js 3** (Composition API + script setup)
- **TypeScript** (strict)
- **Tailwind CSS** per UI responsive
- **PWA** (vite-plugin-pwa) — installabile, offline-first
- **Zero backend** — tutto client-side
- **localStorage** per salvare ricette custom
- **Vite** come build tool
- **vitest** per test

## Struttura del Repo

```
pizza-dough-calculator/
├── README.md
├── LICENSE (MIT)
├── .gitignore
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── public/
│   ├── favicon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── components/
│   │   ├── StyleSelector.vue        # Grid card per scegliere lo stile
│   │   ├── DoughCalculator.vue      # Form input parametri
│   │   ├── IngredientTable.vue      # Risultati: tabella ingredienti in grammi
│   │   ├── FermentationTimer.vue    # Calculator lievitazione + programma orari
│   │   ├── RecipeCard.vue           # Ricetta finale stampabile/condivisibile
│   │   └── SavedRecipes.vue         # Lista ricette salvate in localStorage
│   ├── composables/
│   │   ├── useDoughCalculation.ts   # Logica baker's percentages (reactive)
│   │   ├── useFermentation.ts       # Logica lievitazione (temperatura → lievito → tempo)
│   │   ├── useYeastConversion.ts    # Conversione fresco ↔ secco ↔ madre
│   │   └── useRecipeStorage.ts      # CRUD ricette in localStorage
│   ├── data/
│   │   ├── styles.ts               # 12 stili pizza preimpostati + custom
│   │   └── flours.ts               # 10 tipi farina con proprietà
│   ├── types/
│   │   └── index.ts                # TypeScript types
│   └── utils/
│       └── calculations.ts          # Funzioni matematiche pure (no Vue dependency)
└── tests/
    └── calculations.test.ts         # Test su tutte le formule
```

## Design

### Palette colori
- Primary: `#E63946` (rosso pomodoro)
- Secondary: `#F4A261` (giallo farina)
- Accent: `#2A9D8F` (verde basilico)
- Dark: `#6B4226` (marrone legno)
- Background: `#FFF8F0` (bianco farina)
- Dark mode: rispetta `prefers-color-scheme`

### Principi UI
- **Mobile-first** — usato in cucina col telefono, mani sporche di farina
- Bottoni grandi e touch-friendly (min 48px tap target)
- Slider con valore numerico visibile accanto
- Risultati con numeri grandi e chiari
- Emoji per ingredienti: 🌾 farina, 💧 acqua, 🧂 sale, 🫒 olio, 🍞 lievito
- Font leggibile (system font o Inter, niente font decorativi)
- Single page scrollabile, NO routing

---

## La Matematica — Baker's Percentages

La farina è sempre 100%. Tutto il resto è espresso come percentuale della farina.

```
Esempio: Napoletana classica per 4 pizze da 250g
─────────────────────────────────────────────────
Peso totale: 4 × 250g = 1000g
Idratazione: 65%
Sale: 2.8%
Olio: 0%
Lievito fresco: 0.3%

Calcolo:
  Farina = peso_totale / (1 + idratazione% + sale% + olio% + zucchero% + malto% + lievito%)
  Farina = 1000 / (1 + 0.65 + 0.028 + 0 + 0 + 0 + 0.003)
  Farina = 1000 / 1.681 = 595g

  Acqua = farina × idratazione% = 595 × 0.65 = 387g
  Sale = farina × sale% = 595 × 0.028 = 17g
  Lievito = farina × lievito% = 595 × 0.003 = 1.8g

  Verifica: 595 + 387 + 17 + 1.8 = 1000.8g ✓
```

---

## Stili Pizza (Presets)

12 stili preimpostati + 1 custom. Ogni stile definisce range suggeriti per tutti i parametri.

| # | Stile | Idratazione | Sale | Olio | Zucchero | Peso Pallina | Lievitazione | Farina consigliata |
|---|-------|-------------|------|------|----------|--------------|-------------|-------------------|
| 1 | Napoletana STG | 60-65% | 2.5-3% | 0% | 0% | 230-280g | 8-24h | 00 W260-300 |
| 2 | Napoletana contemporanea | 65-72% | 2.5-3% | 0% | 0% | 250-300g | 24-48h | 00 W300-350 |
| 3 | Romana in teglia | 75-85% | 2.5-3% | 3-5% | 0% | per teglia | 24-72h | 00 W300-350 |
| 4 | Pizza in pala | 70-80% | 2.5-3% | 2-4% | 0% | per teglia | 24-48h | 00 W300-350 |
| 5 | Pinsa romana | 75-80% | 2.5% | 2-3% | 0% | 250-300g | 24-72h | mix (grano, soia, riso) |
| 6 | Canotto | 65-70% | 2.8% | 0% | 0% | 280-320g | 24-48h | 00 W320-380 |
| 7 | New York style | 60-65% | 2% | 2-3% | 1-3% | 260-300g | 24h | bread flour W300 |
| 8 | Chicago deep dish | 55-60% | 2% | 5-8% | 1-2% | per teglia | 4-8h | all-purpose |
| 9 | Detroit style | 70-75% | 2.5% | 3% | 1-2% | 350-400g | 12-24h | bread flour |
| 10 | Focaccia genovese | 80-90% | 2.5-3% | 5-8% | 0% | per teglia | 4-12h | 00 W260-300 |
| 11 | Pane pizza / casereccia | 65-70% | 2% | 2% | 0% | 300-400g | 4-12h | 0 o tipo 1 |
| 12 | Custom | tutto libero | — | — | — | — | — | — |

### Struttura dati stile (`data/styles.ts`):
```typescript
interface PizzaStyle {
  id: string;
  name: string;
  description: string;
  hydration: { min: number; max: number; default: number };
  salt: { min: number; max: number; default: number };
  oil: { min: number; max: number; default: number };
  sugar: { min: number; max: number; default: number };
  malt: { min: number; max: number; default: number };
  ballWeight: { min: number; max: number; default: number } | null; // null = per teglia
  fermentation: { minHours: number; maxHours: number; defaultHours: number };
  recommendedFlours: string[];  // IDs from flours.ts
  isTeglia: boolean;            // true = calcolo per dimensione teglia, non per pallina
  tegliaDefault?: { width: number; height: number }; // cm, per stili in teglia
}
```

---

## Tipi Farina (`data/flours.ts`)

```typescript
interface Flour {
  id: string;
  name: string;
  wRange: { min: number; max: number } | null; // null se non applicabile
  proteinPercent: { min: number; max: number };
  description: string;
  recommendedStyles: string[];
}
```

| # | Farina | W | Proteine | Uso |
|---|--------|---|----------|-----|
| 1 | Farina 00 (debole) | 170-200 | 9-10.5% | Pizza veloce, bassa lievitazione |
| 2 | Farina 00 (media) | 260-300 | 11-12.5% | Napoletana classica, focaccia |
| 3 | Farina 00 (forte) | 300-350 | 12.5-14% | Lunghe lievitazioni, romana, canotto |
| 4 | Farina 0 | 180-240 | 10-12% | Uso generale, pane pizza |
| 5 | Farina tipo 1 | 180-240 | 11-13% | Semi-raffinata, sapore più rustico |
| 6 | Farina tipo 2 / semi-integrale | 150-200 | 12-14% | Gusto deciso, mix con 00 |
| 7 | Farina integrale | 150-180 | 13-15% | Da miscelare con 00 (max 20-30%) |
| 8 | Manitoba | 350-400+ | 14-16% | Alte idratazioni, panettoni, mix |
| 9 | Bread flour (americana) | 280-320 | 12-14% | NY style, Detroit |
| 10 | Mix pinsa | — | 11-13% | Pinsa romana (grano, soia, riso) |

---

## Variabili del Calcolatore

Tutte le variabili che l'utente può modificare:

### Input principali
- **Numero pizze** (1-20, default 4) — oppure **dimensione teglia** (larghezza × altezza cm) per stili in teglia
- **Peso pallina** (g) — range suggerito dallo stile, step 10g
- **Idratazione %** — slider con range dallo stile, step 1%
- **Tipo farina** — dropdown, filtrato per stile consigliato (ma mostra tutte)
- **Sale %** — default dallo stile, modificabile, step 0.1%
- **Olio %** — default dallo stile (0 se non previsto), step 0.5%
- **Zucchero %** — default 0 per la maggior parte, 1-3% per NY/Detroit, step 0.5%
- **Malto %** — opzionale, 0-1%, step 0.1%

### Lievitazione
- **Tipo lievito**: fresco / secco attivo / lievito madre
- **Temperatura ambiente** (°C) — slider 15-35°C, step 1°C
- **Tempo lievitazione** (ore) — slider, range dallo stile
- **Metodo**: diretta / indiretta con poolish / indiretta con biga

### Output calcolati
- 🌾 Farina (g)
- 💧 Acqua (g)
- 🧂 Sale (g)
- 🫒 Olio (g) — solo se > 0
- 🍬 Zucchero (g) — solo se > 0
- 🍯 Malto (g) — solo se > 0
- 🍞 Lievito (g) — tipo specificato tra parentesi
- **Peso totale** (g) — verifica
- **Peso per pallina** (g)

### Per metodo indiretto (poolish/biga):
- Farina per poolish/biga (g)
- Acqua per poolish/biga (g)
- Lievito per poolish/biga (g)
- Farina rimanente per impasto finale (g)
- Acqua rimanente per impasto finale (g)
- Tempo fermentazione poolish/biga (ore)
- Tempo fermentazione impasto finale (ore)

---

## Fermentation Calculator

### Logica base (lievito di birra fresco)
```
Riferimento: 20°C, 24h → ~1g lievito per kg di farina

Fattore temperatura:
- Ogni +5°C → dimezza il lievito (o il tempo)
- Ogni -5°C → raddoppia il lievito (o il tempo)

Formula approssimativa:
  lievito_g = (farina_kg * base_lievito) * (2 ^ ((20 - temperatura) / 5)) * (24 / ore_lievitazione)

Dove base_lievito = 1g per lievito fresco

Limiti:
- Temperatura: 15-35°C (sotto i 15 la lievitazione è troppo lenta, sopra i 35 il lievito muore)
- Lievito minimo: 0.1g per kg (sotto è ingestibile)
- Lievito massimo: 25g per kg (sopra il sapore è sgradevole)
```

### Conversioni lievito
```
Fresco → Secco attivo: ÷ 3 (es: 3g fresco = 1g secco)
Fresco → Lievito madre: × 20-30 (media ×25, es: 3g fresco ≈ 75g madre)
Secco → Fresco: × 3
Madre → Fresco: ÷ 25
```

### Programma lievitazione (output)
Dato l'orario desiderato per la pizza, calcola all'indietro:
```
Esempio: pizza alle 20:00, lievitazione 24h diretta, 2h temperatura ambiente prima di infornare

Programma:
- Ieri 18:00: Impasta
- Ieri 19:00: Prima piega (stretch & fold)
- Ieri 20:00: Seconda piega
- Ieri 20:30: In frigo (coperto)
- Oggi 18:00: Tira fuori dal frigo
- Oggi 18:15: Dividi in palline (staglio)
- Oggi 18:30: Palline a temperatura ambiente (coperte)
- Oggi 20:00: Stendi e inforna! 🍕
```

### Poolish
```
Composizione: 50% della farina totale + stessa quantità di acqua (100% idratazione) + lievito
Fermentazione: 12-18h a temperatura ambiente
Poi si aggiunge il resto della farina, acqua, sale, ecc.
```

### Biga
```
Composizione: 50% della farina totale + 45% acqua (sulla farina della biga) + lievito
Fermentazione: 16-24h a 18-20°C
Poi si aggiunge il resto della farina, acqua, sale, ecc.
```

---

## Steps — Da Zero a Production

### Step 1: Scaffold progetto
```bash
npm create vite@latest pizza-dough-calculator -- --template vue-ts
cd pizza-dough-calculator
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install vite-plugin-pwa -D
```
- `vite.config.ts`: Tailwind plugin + PWA config con manifest, icons, offline
- `base: '/pizza-dough-calculator/'` per GitHub Pages

### Step 2: Implementa calcoli (logica pura, PRIMA della UI)
- `utils/calculations.ts` — tutte le formule matematiche come funzioni pure
- `composables/useDoughCalculation.ts` — wrappa calculations con Vue reactivity
- `composables/useFermentation.ts` — calcolo lievitazione
- `composables/useYeastConversion.ts` — conversioni lievito
- `tests/calculations.test.ts` — testa tutte le formule con casi noti
- **Testa i calcoli PRIMA di costruire la UI**

### Step 3: Implementa data layer
- `data/styles.ts` — 12 stili pizza con tutti i range (vedi tabella sopra)
- `data/flours.ts` — 10 tipi farina con proprietà (vedi tabella sopra)
- `types/index.ts` — tutti i tipi TypeScript

### Step 4: UI — Style selector
- `StyleSelector.vue` — grid di card, click per selezionare
- Ogni card: nome stile, emoji, descrizione breve, idratazione range
- "Custom" come ultima card con icona ⚙️
- Selezionare uno stile pre-compila tutti i parametri del calcolatore

### Step 5: UI — Calculator principale
- `DoughCalculator.vue` — form con slider e input numerici
- Tutti i parametri elencati nella sezione "Variabili" sopra
- Slider con range dinamico basato sullo stile selezionato
- Ogni slider mostra il valore numerico accanto (editabile)
- Toggle "Per teglia" che mostra width × height cm invece di numero palline
- I risultati si aggiornano in tempo reale (computed)

### Step 6: UI — Risultati
- `IngredientTable.vue` — tabella ingredienti con grammi, emoji, chiari e grandi
- Sezione separata per poolish/biga se metodo indiretto selezionato
- Peso totale e peso per pallina come verifica

### Step 7: UI — Fermentation
- `FermentationTimer.vue`:
  - Input: quando vuoi la pizza pronta (date/time picker)
  - Output: programma completo con orari (vedi esempio sopra)
  - Output: quantità lievito calcolata
  - Mostra conversioni: "1.8g fresco = 0.6g secco = 45g madre"

### Step 8: UI — Salvataggio e condivisione
- `useRecipeStorage.ts` — CRUD ricette in localStorage
- `SavedRecipes.vue` — lista ricette salvate, click per ricaricare
- `RecipeCard.vue` — versione stampabile della ricetta
- Bottone "Condividi" → genera URL con parametri query (?style=napoletana&balls=4&weight=250&hydration=65)
- Bottone "Stampa" → CSS @media print
- Bottone "Salva" → localStorage con nome custom

### Step 9: Polish e PWA
- Mobile-first responsive (testare su iPhone/Android viewport)
- Dark mode (prefers-color-scheme)
- PWA: manifest.json, service worker, icone
- Favicon SVG (pizza emoji o slice)
- Animazioni subtle sui risultati quando cambiano i valori
- Tooltip educativi opzionali ("Cosa cambia aumentando l'idratazione?")

### Step 10: Deploy
- Build: `npm run build`
- GitHub Pages con GitHub Actions

### Step 11: README
- Screenshot dell'app
- Link al live demo
- Spiegazione baker's percentages
- Lista stili supportati

## Convenzioni
- Vue 3 Composition API con `<script setup lang="ts">`
- TypeScript strict mode
- Tailwind per styling (no CSS custom se non necessario)
- Mobile-first responsive
- Formule matematiche in funzioni pure e testate
- Arrotondamento: grammi interi per farina/acqua/sale, 1 decimale per lievito
- Lingua UI: inglese
- Emoji per ingredienti nell'output
