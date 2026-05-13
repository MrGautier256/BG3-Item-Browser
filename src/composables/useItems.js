import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalStorage } from './useLocalStorage'

const RARITY_ORDER = {
  'Common': 0,
  'Uncommon': 1,
  'Rare': 2,
  'VeryRare': 3,
  'Legendary': 4,
  'Story': 5,
}

export function useItems() {
  const { locale } = useI18n()
  const allItems = ref([])
  const loading = ref(true)
  const error = ref(null)

  // Filters (persisted)
  const searchQuery = useLocalStorage('bg3-search', '')
  const selectedRarity = useLocalStorage('bg3-rarity', [])
  const selectedCategory = useLocalStorage('bg3-category', [])
  const showFavoritesOnly = useLocalStorage('bg3-favonly', false)
  const showUniqueOnly = useLocalStorage('bg3-uniqueonly', false)
  const sortBy = useLocalStorage('bg3-sort', 'name')
  const sortOrder = useLocalStorage('bg3-sort-order', 'asc')

  // Favorites
  const favorites = useLocalStorage('bg3-favorites', [])

  // Visible items count (lazy loading)
  const visibleCount = ref(60)

  async function loadItems() {
    loading.value = true
    try {
      const response = await fetch('/data/items_full.json')
      if (!response.ok) throw new Error('Failed to load items data')
      allItems.value = await response.json()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  function getItemName(item) {
    const lang = locale.value
    return item.translations?.[lang]?.name || item.translations?.en?.name || item.title || item.id
  }

  function getItemDescription(item) {
    const lang = locale.value
    return item.translations?.[lang]?.description || item.translations?.en?.description || item.description || ''
  }

  function isFavorite(itemId) {
    return favorites.value.includes(itemId)
  }

  function toggleFavorite(itemId) {
    const idx = favorites.value.indexOf(itemId)
    if (idx >= 0) {
      favorites.value.splice(idx, 1)
    } else {
      favorites.value.push(itemId)
    }
    // Trigger reactivity
    favorites.value = [...favorites.value]
  }

  const availableRarities = computed(() => {
    const set = new Set()
    allItems.value.forEach(item => {
      if (item.rarity) set.add(item.rarity)
    })
    return Array.from(set).sort((a, b) => (RARITY_ORDER[a] ?? 99) - (RARITY_ORDER[b] ?? 99))
  })

  const availableCategories = computed(() => {
    const set = new Set()
    allItems.value.forEach(item => {
      if (item.category) set.add(item.category)
    })
    return Array.from(set).sort()
  })

  const filteredItems = computed(() => {
    let items = allItems.value

    // Search
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      items = items.filter(item => {
        const name = getItemName(item).toLowerCase()
        const desc = getItemDescription(item).toLowerCase()
        const id = item.id?.toLowerCase() || ''
        return name.includes(q) || desc.includes(q) || id.includes(q)
      })
    }

    // Rarity filter
    if (selectedRarity.value.length > 0) {
      items = items.filter(item => selectedRarity.value.includes(item.rarity))
    }

    // Category filter
    if (selectedCategory.value.length > 0) {
      items = items.filter(item => selectedCategory.value.includes(item.category))
    }

    // Favorites only
    if (showFavoritesOnly.value) {
      items = items.filter(item => favorites.value.includes(item.id))
    }

    // Unique only
    if (showUniqueOnly.value) {
      items = items.filter(item => item.unique)
    }

    // Sort
    items = [...items].sort((a, b) => {
      let cmp = 0
      switch (sortBy.value) {
        case 'name':
          cmp = getItemName(a).localeCompare(getItemName(b), locale.value)
          break
        case 'rarity':
          cmp = (RARITY_ORDER[a.rarity] ?? 99) - (RARITY_ORDER[b.rarity] ?? 99)
          if (cmp === 0) cmp = getItemName(a).localeCompare(getItemName(b), locale.value)
          break
        case 'category':
          cmp = (a.category || '').localeCompare(b.category || '', locale.value)
          if (cmp === 0) cmp = getItemName(a).localeCompare(getItemName(b), locale.value)
          break
        default:
          cmp = 0
      }
      return sortOrder.value === 'desc' ? -cmp : cmp
    })

    return items
  })

  const displayedItems = computed(() => {
    return filteredItems.value.slice(0, visibleCount.value)
  })

  function loadMore() {
    visibleCount.value += 60
  }

  function resetFilters() {
    searchQuery.value = ''
    selectedRarity.value = []
    selectedCategory.value = []
    showFavoritesOnly.value = false
    showUniqueOnly.value = false
    sortBy.value = 'name'
    sortOrder.value = 'asc'
    visibleCount.value = 60
  }

  // Reset visible count when filters change
  const resetVisible = () => { visibleCount.value = 60 }

  return {
    allItems,
    loading,
    error,
    searchQuery,
    selectedRarity,
    selectedCategory,
    showFavoritesOnly,
    showUniqueOnly,
    sortBy,
    sortOrder,
    favorites,
    filteredItems,
    displayedItems,
    availableRarities,
    availableCategories,
    visibleCount,
    loadItems,
    getItemName,
    getItemDescription,
    isFavorite,
    toggleFavorite,
    loadMore,
    resetFilters,
    resetVisible,
    RARITY_ORDER,
  }
}
