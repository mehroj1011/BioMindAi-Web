import { getLocalStorageString, setLocalStorageString, storageKeys } from './storage'

export type AnatomyModel = { id: string; title: string }

type AnatomyState = {
  favorites: string[]
  recents: string[]
}

function loadState(): AnatomyState {
  const raw = getLocalStorageString(storageKeys.anatomy)
  if (raw) {
    try {
      return JSON.parse(raw) as AnatomyState
    } catch {
      // ignore
    }
  }
  return { favorites: [], recents: [] }
}

function saveState(s: AnatomyState) {
  setLocalStorageString(storageKeys.anatomy, JSON.stringify(s))
}

export function isFavorite(id: string): boolean {
  return loadState().favorites.includes(id)
}

export function toggleFavorite(id: string): AnatomyState {
  const s = loadState()
  s.favorites = s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [id, ...s.favorites].slice(0, 50)
  saveState(s)
  return s
}

export function markRecent(id: string): AnatomyState {
  const s = loadState()
  s.recents = [id, ...s.recents.filter((x) => x !== id)].slice(0, 12)
  saveState(s)
  return s
}

export function getAnatomyState(): AnatomyState {
  return loadState()
}

