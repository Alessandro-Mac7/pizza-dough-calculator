import type { FlourType } from '../types'

export const flourTypes: FlourType[] = [
  {
    id: '00-w170',
    name: 'Farina 00 (W170-200)',
    w: { min: 170, max: 200 },
    protein: { min: 9, max: 11 },
    pl: '0.50-0.60',
    description: 'Farina debole per pizze veloci con lievitazione breve (2-6h). Impasto morbido ed estensibile.',
    recommendedStyles: ['pane-pizza'],
  },
  {
    id: '00-w260',
    name: 'Farina 00 (W260-300)',
    w: { min: 260, max: 300 },
    protein: { min: 11.5, max: 13 },
    pl: '0.55-0.65',
    description: 'La classica farina napoletana. Buona forza per lievitazioni di 8-24h. Estensibilità equilibrata.',
    recommendedStyles: ['napoletana-stg', 'canotto', 'chicago', 'new-york'],
  },
  {
    id: '00-w300',
    name: 'Farina 00 (W300-350)',
    w: { min: 300, max: 350 },
    protein: { min: 13, max: 14.5 },
    pl: '0.55-0.70',
    description: 'Farina forte per lunghe lievitazioni (24-72h). Regge alte idratazioni. Ideale per teglia e stili contemporanei.',
    recommendedStyles: ['napoletana-contemporanea', 'romana-teglia', 'pizza-pala', 'canotto', 'focaccia', 'detroit', 'new-york'],
  },
  {
    id: 'farina-0',
    name: 'Farina 0',
    w: { min: 200, max: 280 },
    protein: { min: 10, max: 12.5 },
    pl: '0.50-0.60',
    description: 'Meno raffinata della 00, conserva più crusca. Buon sapore, texture leggermente rustica.',
    recommendedStyles: ['pane-pizza', 'focaccia'],
  },
  {
    id: 'tipo-1',
    name: 'Farina Tipo 1',
    w: { min: 180, max: 260 },
    protein: { min: 10, max: 12 },
    pl: '0.45-0.55',
    description: 'Farina semi-raffinata con buon contenuto di fibre. Sapore nocciolato, colore leggermente scuro.',
    recommendedStyles: ['pane-pizza'],
  },
  {
    id: 'tipo-2',
    name: 'Farina Tipo 2 (Semi-integrale)',
    w: { min: 150, max: 220 },
    protein: { min: 10, max: 12 },
    pl: '0.40-0.55',
    description: 'Farina semi-integrale. Sapore ricco, più fibre. Spesso miscelata con la 00 per maggiore lavorabilità.',
    recommendedStyles: ['pane-pizza'],
  },
  {
    id: 'integrale',
    name: 'Farina Integrale',
    w: { min: 120, max: 180 },
    protein: { min: 11, max: 13 },
    pl: '0.35-0.50',
    description: 'Farina integrale. Massime fibre e nutrienti. Mollica densa, sapore intenso. Meglio miscelata al 20-30% con farina bianca.',
    recommendedStyles: ['pane-pizza'],
  },
  {
    id: 'manitoba',
    name: 'Manitoba (W350-400)',
    w: { min: 350, max: 400 },
    protein: { min: 14, max: 16 },
    pl: '0.60-0.70',
    description: 'Farina fortissima canadese. Eccellente per lievitazioni lunghissime (48-72h+) e impasti ad altissima idratazione.',
    recommendedStyles: ['napoletana-contemporanea', 'romana-teglia', 'pizza-pala', 'canotto', 'focaccia'],
  },
  {
    id: 'bread-flour',
    name: 'Bread Flour',
    w: { min: 280, max: 320 },
    protein: { min: 12, max: 14 },
    pl: '0.55-0.65',
    description: 'Farina americana ad alto contenuto proteico. Lo standard per NY e Detroit. Buona masticabilità e struttura.',
    recommendedStyles: ['new-york', 'chicago', 'detroit'],
  },
  {
    id: 'mix-pinsa',
    name: 'Mix Pinsa (grano, soia, riso)',
    w: { min: 260, max: 320 },
    protein: { min: 11, max: 13 },
    pl: '0.50-0.60',
    description: 'Miscela di farine di grano, soia e riso per la Pinsa Romana autentica. Ultra-leggera e croccante.',
    recommendedStyles: ['pinsa'],
  },
]

export function getFlourById(id: string): FlourType | undefined {
  return flourTypes.find((f) => f.id === id)
}

export function getFloursForStyle(styleId: string): FlourType[] {
  if (styleId === 'custom') return flourTypes
  return flourTypes.filter((f) => f.recommendedStyles.includes(styleId))
}
