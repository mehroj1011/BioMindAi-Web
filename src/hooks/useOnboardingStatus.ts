import { useEffect, useState } from 'react'
import { getLocalStorageString, storageKeys } from '../utils/storage'

function readOnboarded(): boolean {
  try {
    const raw = getLocalStorageString(storageKeys.onboarding)
    if (!raw) return false
    const j = JSON.parse(raw) as { completed?: boolean }
    return Boolean(j.completed)
  } catch {
    return false
  }
}

export function useOnboardingStatus() {
  const [onboarded, setOnboarded] = useState(() => readOnboarded())

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKeys.onboarding) setOnboarded(readOnboarded())
    }
    const onCustom = () => setOnboarded(readOnboarded())
    window.addEventListener('storage', onStorage)
    window.addEventListener('biomind:onboarding', onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('biomind:onboarding', onCustom)
    }
  }, [])

  return onboarded
}

