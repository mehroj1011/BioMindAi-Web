export const storageKeys = {
  biodigitalDk: 'biomind.biodigital.dk',
  tutorDraft: 'biomind.tutor.draft',
  progress: 'biomind.progress.v1',
  lessons: 'biomind.lessons.v1',
  lab: 'biomind.lab.v1',
  anatomy: 'biomind.anatomy.v1',
  profile: 'biomind.profile.v1',
  onboarding: 'biomind.onboarding.v1',
} as const

export function getLocalStorageString(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function setLocalStorageString(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

export function removeLocalStorage(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

