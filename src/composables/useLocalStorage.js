import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue) {
  const stored = localStorage.getItem(key)
  let initial = defaultValue

  if (stored !== null) {
    try {
      initial = JSON.parse(stored)
    } catch {
      initial = stored
    }
  }

  const data = ref(initial)

  watch(data, (val) => {
    if (val === null || val === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(val))
    }
  }, { deep: true })

  return data
}
