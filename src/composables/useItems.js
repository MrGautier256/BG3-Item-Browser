import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalStorage } from './useLocalStorage'

const RARITY_ORDER = {
  Common: 0,
  Uncommon: 1,
  Rare: 2,
  VeryRare: 3,
  Legendary: 4,
  Story: 5,
}

export function useItems() {
  const { locale, t } = useI18n()
  const allItems = ref([])
  const loading = ref(true)
  const error = ref(null)

  // Filters (persisted)
  const searchQuery = useLocalStorage('bg3-search', '')
  const selectedRarity = useLocalStorage('bg3-rarity', [])
  const selectedCategory = useLocalStorage('bg3-category', [])
  const selectedDamageType = useLocalStorage('bg3-dmgtype', [])
  const selectedProficiency = useLocalStorage('bg3-prof', [])
  const selectedSlot = useLocalStorage('bg3-slot', [])
  const showFavoritesOnly = useLocalStorage('bg3-favonly', false)
  const showUniqueOnly = useLocalStorage('bg3-uniqueonly', false)
  const showSpellsOnly = useLocalStorage('bg3-spellsonly', false)
  const showPassivesOnly = useLocalStorage('bg3-passivesonly', false)
  const sortBy = useLocalStorage('bg3-sort', 'name')
  const sortOrder = useLocalStorage('bg3-sort-order', 'asc')

  // Favorites & Compare
  const favorites = useLocalStorage('bg3-favorites', [])
  const compareList = useLocalStorage('bg3-compare', [])

  // Visible items count (lazy loading)
  const visibleCount = ref(60)

  async function loadItems() {
    loading.value = true
    try {
      const response = await fetch('./data/items_full.json')
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
    favorites.value = [...favorites.value]
  }

  function isInCompare(itemId) {
    return compareList.value.includes(itemId)
  }

  function toggleCompare(itemId) {
    const idx = compareList.value.indexOf(itemId)
    if (idx >= 0) {
      compareList.value.splice(idx, 1)
    } else {
      if (compareList.value.length < 4) {
        compareList.value.push(itemId)
      }
    }
    compareList.value = [...compareList.value]
  }

  function clearCompare() {
    compareList.value = []
  }

  const compareItems = computed(() => {
    return compareList.value
      .map(id => allItems.value.find(item => item.id === id))
      .filter(Boolean)
  })

  function getItemSlot(item) {
    return item.raw_stats?.Slot || null
  }

  // Extract damage types from weapon_damage and effects
  function getItemDamageTypes(item) {
    const types = new Set()
    if (item.weapon_damage) {
      item.weapon_damage.forEach(wd => {
        if (wd.damage_type) types.add(wd.damage_type)
      })
    }
    if (item.effects) {
      item.effects.forEach(e => {
        if (e.raw) {
          const m = e.raw.match(/(?:DealDamage|WeaponDamage)\([^,]+,\s*(\w+)/i)
          if (m) types.add(m[1])
        }
      })
    }
    return Array.from(types)
  }

  function getItemProficiencies(item) {
    if (!item.proficiency_group) return []
    return item.proficiency_group.split(';').filter(Boolean)
  }

  const availableRarities = computed(() => {
    const set = new Set()
    allItems.value.forEach(item => { if (item.rarity) set.add(item.rarity) })
    return Array.from(set).sort((a, b) => (RARITY_ORDER[a] ?? 99) - (RARITY_ORDER[b] ?? 99))
  })

  const availableCategories = computed(() => {
    const set = new Set()
    allItems.value.forEach(item => { if (item.category) set.add(item.category) })
    return Array.from(set).sort()
  })

  const availableDamageTypes = computed(() => {
    const set = new Set()
    allItems.value.forEach(item => {
      getItemDamageTypes(item).forEach(dt => set.add(dt))
    })
    return Array.from(set).sort()
  })

  const availableProficiencies = computed(() => {
    const set = new Set()
    allItems.value.forEach(item => {
      getItemProficiencies(item).forEach(p => set.add(p))
    })
    return Array.from(set).sort()
  })

  const availableSlots = computed(() => {
    const set = new Set()
    allItems.value.forEach(item => {
      const s = getItemSlot(item)
      if (s) set.add(s)
    })
    return Array.from(set).sort()
  })

  const activeFilterCount = computed(() => {
    let count = 0
    if (searchQuery.value) count++
    if (selectedRarity.value.length) count++
    if (selectedCategory.value.length) count++
    if (selectedDamageType.value.length) count++
    if (selectedProficiency.value.length) count++
    if (selectedSlot.value.length) count++
    if (showFavoritesOnly.value) count++
    if (showUniqueOnly.value) count++
    if (showSpellsOnly.value) count++
    if (showPassivesOnly.value) count++
    return count
  })

  const filteredItems = computed(() => {
    let items = allItems.value

    // Search (deep: name, description, effects, passives, spells)
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      items = items.filter(item => {
        const name = getItemName(item).toLowerCase()
        const desc = getItemDescription(item).toLowerCase()
        const id = item.id?.toLowerCase() || ''
        if (name.includes(q) || desc.includes(q) || id.includes(q)) return true
        // Deep search in passives
        if (item.passives_full?.some(p => {
          const pn = (p.name?.[locale.value] || p.name?.en || '').toLowerCase()
          const pd = (p.description?.[locale.value] || p.description?.en || '').toLowerCase()
          return pn.includes(q) || pd.includes(q)
        })) return true
        // Deep search in spells
        if (item.spells_full?.some(s => {
          const sn = (s.name?.[locale.value] || s.name?.en || '').toLowerCase()
          const sd = (s.description?.[locale.value] || s.description?.en || '').toLowerCase()
          return sn.includes(q) || sd.includes(q)
        })) return true
        // Search in effects
        if (item.effects?.some(e => (e.label || '').toLowerCase().includes(q))) return true
        // Search in proficiency
        if (item.proficiency_group?.toLowerCase().includes(q)) return true
        return false
      })
    }

    if (selectedRarity.value.length > 0) {
      items = items.filter(item => selectedRarity.value.includes(item.rarity))
    }
    if (selectedCategory.value.length > 0) {
      items = items.filter(item => selectedCategory.value.includes(item.category))
    }
    if (selectedDamageType.value.length > 0) {
      items = items.filter(item => {
        const dt = getItemDamageTypes(item)
        return selectedDamageType.value.some(d => dt.includes(d))
      })
    }
    if (selectedProficiency.value.length > 0) {
      items = items.filter(item => {
        const profs = getItemProficiencies(item)
        return selectedProficiency.value.some(p => profs.includes(p))
      })
    }
    if (selectedSlot.value.length > 0) {
      items = items.filter(item => {
        const s = getItemSlot(item)
        return s && selectedSlot.value.includes(s)
      })
    }
    if (showFavoritesOnly.value) {
      items = items.filter(item => favorites.value.includes(item.id))
    }
    if (showUniqueOnly.value) {
      items = items.filter(item => item.unique)
    }
    if (showSpellsOnly.value) {
      items = items.filter(item => item.spells_full?.length > 0)
    }
    if (showPassivesOnly.value) {
      items = items.filter(item => item.passives_full?.length > 0)
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
        case 'weight':
          cmp = (parseFloat(a.weight) || 0) - (parseFloat(b.weight) || 0)
          break
        case 'value':
          cmp = (parseInt(a.value) || 0) - (parseInt(b.value) || 0)
          break
        default:
          cmp = 0
      }
      return sortOrder.value === 'desc' ? -cmp : cmp
    })

    return items
  })

  const displayedItems = computed(() => filteredItems.value.slice(0, visibleCount.value))

  function loadMore() { visibleCount.value += 60 }

  function resetFilters() {
    searchQuery.value = ''
    selectedRarity.value = []
    selectedCategory.value = []
    selectedDamageType.value = []
    selectedProficiency.value = []
    selectedSlot.value = []
    showFavoritesOnly.value = false
    showUniqueOnly.value = false
    showSpellsOnly.value = false
    showPassivesOnly.value = false
    sortBy.value = 'name'
    sortOrder.value = 'asc'
    visibleCount.value = 60
  }

  const resetVisible = () => { visibleCount.value = 60 }

  // Export functions
  function exportFilteredJSON() {
    const data = filteredItems.value.map(item => ({
      id: item.id,
      name: getItemName(item),
      rarity: item.rarity,
      category: item.category,
      description: getItemDescription(item),
      weight: item.weight,
      value: item.value,
      unique: item.unique,
      proficiency_group: item.proficiency_group,
      weapon_damage: item.weapon_damage,
      effects: item.effects,
      passives_full: item.passives_full,
      spells_full: item.spells_full,
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bg3_items_export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportFavoritesJSON() {
    const data = allItems.value
      .filter(item => favorites.value.includes(item.id))
      .map(item => ({
        id: item.id,
        name: getItemName(item),
        rarity: item.rarity,
        category: item.category,
        description: getItemDescription(item),
      }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bg3_favorites_export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function generateShareLink() {
    const ids = favorites.value.join(',')
    const base = window.location.href.split('?')[0].split('#')[0]
    return `${base}?favorites=${encodeURIComponent(ids)}`
  }

  function loadFromURL() {
    const params = new URLSearchParams(window.location.search)
    const shared = params.get('favorites')
    if (shared) {
      const ids = shared.split(',').filter(Boolean)
      if (ids.length > 0) {
        favorites.value = ids
        showFavoritesOnly.value = true
      }
    }
  }

  return {
    allItems, loading, error,
    searchQuery, selectedRarity, selectedCategory,
    selectedDamageType, selectedProficiency, selectedSlot,
    showFavoritesOnly, showUniqueOnly, showSpellsOnly, showPassivesOnly,
    sortBy, sortOrder,
    favorites, compareList, compareItems,
    filteredItems, displayedItems,
    availableRarities, availableCategories,
    availableDamageTypes, availableProficiencies, availableSlots,
    activeFilterCount,
    loadItems, getItemName, getItemDescription,
    getItemDamageTypes, getItemProficiencies, getItemSlot,
    isFavorite, toggleFavorite,
    isInCompare, toggleCompare, clearCompare,
    loadMore, resetFilters, resetVisible,
    exportFilteredJSON, exportFavoritesJSON,
    generateShareLink, loadFromURL,
    RARITY_ORDER,
  }
}
