<template>
  <aside
    :class="[
      'fixed md:sticky top-0 left-0 z-50 md:z-10 h-full md:h-auto md:top-[65px] md:self-start',
      'w-80 md:w-72 lg:w-80 bg-white dark:bg-bg3-dark-mid border-r border-gray-200 dark:border-bg3-ink/50',
      'transform transition-transform duration-300 md:transform-none overflow-y-auto',
      'shadow-xl md:shadow-none md:rounded-xl md:border md:m-0',
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    ]"
    style="max-height: calc(100vh - 65px)"
  >
    <!-- Mobile close button -->
    <div class="flex items-center justify-between p-4 md:hidden border-b border-gray-200 dark:border-bg3-ink/50">
      <h2 class="font-display font-semibold text-bg3-dark dark:text-bg3-gold">{{ t('filters.title') }}</h2>
      <button @click="$emit('close')" class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-bg3-ink/50">✕</button>
    </div>

    <div class="p-4 space-y-4">
      <!-- Title with filter count -->
      <div class="hidden md:flex items-center justify-between">
        <h2 class="font-display font-semibold text-bg3-dark dark:text-bg3-gold text-lg">{{ t('filters.title') }}</h2>
        <span v-if="activeFilterCount > 0" class="badge bg-bg3-gold/20 text-bg3-gold-dark dark:text-bg3-gold">
          {{ activeFilterCount }} {{ t('filters.activeFilters') }}
        </span>
      </div>

      <!-- Search -->
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          :placeholder="t('filters.searchAdvanced')"
          class="input-field pl-10 pr-8"
        />
        <button
          v-if="searchQuery"
          @click="$emit('update:searchQuery', '')"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >✕</button>
      </div>

      <!-- Rarity Filter -->
      <FilterGroup :label="t('filters.rarity')" :count="selectedRarity.length">
        <label v-for="r in availableRarities" :key="r"
          class="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-bg3-ink/50 transition-colors">
          <input type="checkbox" :checked="selectedRarity.includes(r)" @change="toggleFilter('selectedRarity', r)"
            class="w-4 h-4 rounded border-gray-300 dark:border-bg3-ink text-bg3-gold focus:ring-bg3-gold/50 bg-white dark:bg-bg3-ink cursor-pointer" />
          <span class="text-sm text-gray-700 dark:text-gray-200 flex-1">{{ t(`rarities.${r}`) }}</span>
          <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: rarityDotColor(r) }"></span>
        </label>
      </FilterGroup>

      <!-- Category Filter -->
      <FilterGroup :label="t('filters.category')" :count="selectedCategory.length">
        <label v-for="c in availableCategories" :key="c"
          class="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-bg3-ink/50 transition-colors">
          <input type="checkbox" :checked="selectedCategory.includes(c)" @change="toggleFilter('selectedCategory', c)"
            class="w-4 h-4 rounded border-gray-300 dark:border-bg3-ink text-bg3-gold focus:ring-bg3-gold/50 bg-white dark:bg-bg3-ink cursor-pointer" />
          <span class="text-sm text-gray-700 dark:text-gray-200">{{ t(`categories.${c}`) }}</span>
        </label>
      </FilterGroup>

      <!-- Slot Filter -->
      <FilterGroup :label="t('filters.slot')" :count="selectedSlot.length" v-if="availableSlots.length > 0">
        <label v-for="s in availableSlots" :key="s"
          class="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-bg3-ink/50 transition-colors">
          <input type="checkbox" :checked="selectedSlot.includes(s)" @change="toggleFilter('selectedSlot', s)"
            class="w-4 h-4 rounded border-gray-300 dark:border-bg3-ink text-bg3-gold focus:ring-bg3-gold/50 bg-white dark:bg-bg3-ink cursor-pointer" />
          <span class="text-sm text-gray-700 dark:text-gray-200">{{ translateSlot(s) }}</span>
        </label>
      </FilterGroup>

      <!-- Damage Type Filter -->
      <FilterGroup :label="t('filters.damageType')" :count="selectedDamageType.length" v-if="availableDamageTypes.length > 0">
        <label v-for="dt in availableDamageTypes" :key="dt"
          class="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-bg3-ink/50 transition-colors">
          <input type="checkbox" :checked="selectedDamageType.includes(dt)" @change="toggleFilter('selectedDamageType', dt)"
            class="w-4 h-4 rounded border-gray-300 dark:border-bg3-ink text-bg3-gold focus:ring-bg3-gold/50 bg-white dark:bg-bg3-ink cursor-pointer" />
          <span class="text-sm text-gray-700 dark:text-gray-200">{{ translateDamageType(dt) }}</span>
        </label>
      </FilterGroup>

      <!-- Proficiency Filter -->
      <FilterGroup :label="t('filters.proficiency')" :count="selectedProficiency.length" v-if="availableProficiencies.length > 0">
        <label v-for="p in availableProficiencies" :key="p"
          class="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-bg3-ink/50 transition-colors">
          <input type="checkbox" :checked="selectedProficiency.includes(p)" @change="toggleFilter('selectedProficiency', p)"
            class="w-4 h-4 rounded border-gray-300 dark:border-bg3-ink text-bg3-gold focus:ring-bg3-gold/50 bg-white dark:bg-bg3-ink cursor-pointer" />
          <span class="text-sm text-gray-700 dark:text-gray-200">{{ t(`proficiencies.${p}`, p) }}</span>
        </label>
      </FilterGroup>

      <!-- Sort -->
      <div>
        <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{{ t('filters.sort') }}</label>
        <div class="flex gap-2">
          <select :value="sortBy" @change="$emit('update:sortBy', $event.target.value)" class="input-field flex-1 appearance-none cursor-pointer">
            <option value="name">{{ t('filters.sortName') }}</option>
            <option value="rarity">{{ t('filters.sortRarity') }}</option>
            <option value="category">{{ t('filters.sortCategory') }}</option>
            <option value="weight">{{ t('filters.sortWeight') }}</option>
            <option value="value">{{ t('filters.sortValue') }}</option>
          </select>
          <button
            @click="$emit('update:sortOrder', sortOrder === 'asc' ? 'desc' : 'asc')"
            class="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-bg3-ink bg-gray-50 dark:bg-bg3-ink/30 hover:bg-gray-100 dark:hover:bg-bg3-ink/50 transition-colors text-lg"
            :title="sortOrder === 'asc' ? t('filters.ascending') : t('filters.descending')"
          >
            {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </button>
        </div>
      </div>

      <!-- Toggles -->
      <div class="space-y-2.5">
        <ToggleSwitch :modelValue="showFavoritesOnly" @update:modelValue="v => $emit('update:showFavoritesOnly', v)" :label="t('filters.favoritesOnly')" color="red" />
        <ToggleSwitch :modelValue="showUniqueOnly" @update:modelValue="v => $emit('update:showUniqueOnly', v)" :label="t('filters.unique')" color="gold" />
        <ToggleSwitch :modelValue="showSpellsOnly" @update:modelValue="v => $emit('update:showSpellsOnly', v)" :label="t('filters.hasSpells')" color="blue" />
        <ToggleSwitch :modelValue="showPassivesOnly" @update:modelValue="v => $emit('update:showPassivesOnly', v)" :label="t('filters.hasPassives')" color="purple" />
      </div>

      <!-- Reset -->
      <button @click="$emit('reset')" class="btn-secondary w-full">
        {{ t('filters.resetFilters') }}
      </button>
    </div>
  </aside>

  <!-- Overlay for mobile -->
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-40 md:hidden" @click="$emit('close')" />
  </Transition>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useHelpers } from '../composables/useHelpers'
import FilterGroup from './FilterGroup.vue'
import ToggleSwitch from './ToggleSwitch.vue'

const { t } = useI18n()
const { translateDamageType, translateSlot } = useHelpers()

const props = defineProps({
  isOpen: Boolean,
  searchQuery: { type: String, default: '' },
  selectedRarity: { type: Array, default: () => [] },
  selectedCategory: { type: Array, default: () => [] },
  selectedDamageType: { type: Array, default: () => [] },
  selectedProficiency: { type: Array, default: () => [] },
  selectedSlot: { type: Array, default: () => [] },
  showFavoritesOnly: Boolean,
  showUniqueOnly: Boolean,
  showSpellsOnly: Boolean,
  showPassivesOnly: Boolean,
  sortBy: { type: String, default: 'name' },
  sortOrder: { type: String, default: 'asc' },
  availableRarities: { type: Array, default: () => [] },
  availableCategories: { type: Array, default: () => [] },
  availableDamageTypes: { type: Array, default: () => [] },
  availableProficiencies: { type: Array, default: () => [] },
  availableSlots: { type: Array, default: () => [] },
  activeFilterCount: { type: Number, default: 0 },
})

const emit = defineEmits([
  'close', 'reset',
  'update:searchQuery', 'update:selectedRarity', 'update:selectedCategory',
  'update:selectedDamageType', 'update:selectedProficiency', 'update:selectedSlot',
  'update:showFavoritesOnly', 'update:showUniqueOnly', 'update:showSpellsOnly', 'update:showPassivesOnly',
  'update:sortBy', 'update:sortOrder',
])

const RARITY_DOT_COLORS = {
  Common: '#9ca3af', Uncommon: '#22c55e', Rare: '#3b82f6',
  VeryRare: '#a855f7', Legendary: '#f59e0b', Story: '#ec4899',
}

function rarityDotColor(r) { return RARITY_DOT_COLORS[r] || '#9ca3af' }

function toggleFilter(filterName, value) {
  const current = [...props[filterName]]
  const idx = current.indexOf(value)
  if (idx >= 0) current.splice(idx, 1)
  else current.push(value)
  emit(`update:${filterName}`, current)
}
</script>
