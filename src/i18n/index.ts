import { ref, type Ref } from 'vue'
import { it } from './it'
import { en } from './en'

export type Locale = 'it' | 'en'

type Dictionary = Record<string, string>

const dictionaries: Record<Locale, Dictionary> = { it, en }

const stored = (typeof localStorage !== 'undefined' && localStorage.getItem('locale')) as Locale | null
export const locale: Ref<Locale> = ref<Locale>(stored === 'en' ? 'en' : 'it')

export function setLocale(l: Locale) {
  locale.value = l
  localStorage.setItem('locale', l)
}

export function toggleLocale() {
  setLocale(locale.value === 'it' ? 'en' : 'it')
}

export function t(key: string, params?: Record<string, string | number>): string {
  const dict = dictionaries[locale.value]
  let str = dict[key] ?? dictionaries.it[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.split(`{${k}}`).join(String(v))
    }
  }
  return str
}
