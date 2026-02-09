# 🍕 Calcolatore Impasto Pizza

Calcolatore professionale per impasti pizza basato sulle **percentuali del panificatore** (baker's percentages). Scegli lo stile, regola i parametri, e ottieni la ricetta perfetta con quantità precise.

**PWA installabile** — usalo direttamente dal telefono in cucina, anche offline.

[**Demo Live**](https://alessandro-mac7.github.io/pizza-dough-calculator/)

## Funzionalità

- **12 stili di pizza** — Napoletana STG, Contemporanea, Romana in teglia, Pala, Pinsa, Canotto, New York, Chicago, Detroit, Focaccia, Pane Pizza, Personalizzato
- **10 tipi di farina** — con valori W, proteine e P/L per ogni tipo
- **Calcolo automatico** — inserisci numero pizze, peso pallina e idratazione, il resto lo fa l'app
- **Calcolatore lievitazione** — programma completo basato su temperatura ambiente e tempo desiderato
- **3 metodi di lievitazione** — Diretta, Poolish, Biga
- **3 tipi di lievito** — Fresco, secco, lievito madre (con conversione automatica)
- **6 ricette veloci** — preset one-click per le ricette più comuni
- **Salva ricette** — salva le tue ricette preferite in locale
- **Condividi** — genera un link con tutti i parametri della ricetta
- **Stampa** — versione stampabile della ricetta
- **Dark mode** — segue le preferenze di sistema
- **PWA offline** — installabile su smartphone, funziona senza connessione

## Come Funziona — Baker's Percentages

La farina è sempre **100%**. Tutti gli altri ingredienti sono espressi come percentuale della farina.

```
Esempio: Napoletana classica, 4 pizze da 250g

Peso totale: 4 × 250g = 1000g
Idratazione: 65%  |  Sale: 2.8%  |  Lievito: 0.1%

Farina = 1000 / (1 + 0.65 + 0.028 + 0.001) = 596g
Acqua  = 596 × 0.65 = 387g
Sale   = 596 × 0.028 = 17g
Lievito = 596 × 0.001 = 0.6g
```

## Tech Stack

- **Vue.js 3** — Composition API + `<script setup>`
- **TypeScript** — strict mode, zero `any`
- **Tailwind CSS 4** — utility-first con tema custom
- **Vite 7** — build tool
- **PWA** — vite-plugin-pwa con workbox
- **Vitest** — 45 test sulle formule matematiche
- **Zero backend** — tutto client-side, localStorage per persistenza

## Avvio Rapido

```bash
# Clona il repository
git clone https://github.com/Alessandro-Mac7/pizza-dough-calculator.git
cd pizza-dough-calculator

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Esegui i test
npm test

# Build per produzione
npm run build
```

## Script Disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Server di sviluppo con HMR |
| `npm run build` | Type-check + build per produzione |
| `npm run preview` | Anteprima build di produzione |
| `npm test` | Esegui tutti i test |
| `npm run test:watch` | Test in modalità watch |

## Struttura del Progetto

```
src/
├── components/          # Componenti Vue
│   ├── StyleSelector    # Selezione stile pizza
│   ├── DoughCalculator  # Form input parametri
│   ├── IngredientTable  # Tabella risultati
│   ├── FermentationTimer # Programma lievitazione
│   ├── RecipePresets    # Ricette veloci
│   └── RecipeCard       # Salva/condividi/stampa
├── composables/         # Logica reattiva
│   ├── useDoughCalculation  # Calcoli baker's %
│   ├── useFermentation      # Programma lievitazione
│   ├── useRecipeStorage     # Persistenza localStorage
│   └── useYeastConversion   # Conversione lieviti
├── data/                # Dati statici
│   ├── styles.ts        # 12 stili pizza
│   ├── flours.ts        # 10 tipi farina
│   └── presets.ts       # 6 ricette preset
├── types/               # Definizioni TypeScript
└── utils/               # Funzioni matematiche pure
```

## Licenza

[MIT](LICENSE)
