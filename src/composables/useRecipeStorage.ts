import { ref } from 'vue'
import type { SavedRecipe, DoughInput, DoughResult } from '../types'

const STORAGE_KEY = 'pizza-dough-recipes'

export function useRecipeStorage() {
  const recipes = ref<SavedRecipe[]>(loadRecipes())

  function loadRecipes(): SavedRecipe[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes.value))
  }

  function saveRecipe(name: string, input: DoughInput, result: DoughResult): SavedRecipe {
    const recipe: SavedRecipe = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      createdAt: new Date().toISOString(),
      input: { ...input },
      result: { ...result, perBall: { ...result.perBall } },
    }
    recipes.value.unshift(recipe)
    persist()
    return recipe
  }

  function deleteRecipe(id: string) {
    recipes.value = recipes.value.filter((r) => r.id !== id)
    persist()
  }

  function clearAll() {
    recipes.value = []
    persist()
  }

  return { recipes, saveRecipe, deleteRecipe, clearAll }
}
