<template>
  <aside
    :class="[
      'fixed md:sticky top-0 left-0 z-50 md:z-10 h-full md:h-auto md:top-[65px] md:self-start',
      'w-72 md:w-64 lg:w-72 bg-white dark:bg-bg3-dark-mid border-r border-gray-200 dark:border-bg3-ink/50',
      'transform transition-transform duration-300 md:transform-none overflow-y-auto',
      'shadow-xl md:shadow-none md:rounded-xl md:border md:m-0',
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    ]"
  >
    <!-- Mobile close button -->
    <div class="flex items-center justify-between p-4 md:hidden border-b border-gray-200 dark:border-bg3-ink/50">
      <h2 class="font-display font-semibold text-bg3-dark dark:text-bg3-gold">{{ t('filters.title') }}</h2>
      <button @click="$emit('close')" class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-bg3-ink/50">
        <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <div class="p-4 space-y-5">
      <!-- Title (desktop) -->
      <h2 class="hidden md:block font-display font-semibold text-bg3-dark dark:text-bg3-gold text-lg">
        {{ t('filters.title') }}
      </h2>

      <!-- Search -->
      <div>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            :placeholder="t('filters.search')"
            class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-bg3-ink bg-gray-50 dark:bg-bg3-ink/30 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-bg3-gold/50 focus:border-bg3-gold outline-none transition-all"
          />
          <button
            v-if="searchQuery"
            @click="$emit('update:searchQuery', '')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Rarity Filter -->
      <div>
        <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          {{ t('filters.rarity') }}
        </label>
        <select
          :value="selectedRarity"
          @change="$emit('update:selectedRarity', $event.target.value)"
          class="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-bg3-ink bg-gray-50 dark:bg-bg3-ink/30 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-bg3-gold/50 focus:border-bg3-gold outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="">{{ t('filters.allRarities') }}</option>
          <option v-for="r in availableRarities" :key="r" :value="r">
            {{ t(`rarities.${r}`) }}
          </option>
        </select>
      </div>

      <!-- Category Filter -->
      <div>
        <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          {{ t('filters.category') }}
        </label>
        <select
          :value="selectedCategory"
          @change="$emit('update:selectedCategory', $event.target.value)"
          class="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-bg3-ink bg-gray-50 dark:bg-bg3-ink/30 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-bg3-gold/50 focus:border-bg3-gold outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="">{{ t('filters.allCategories') }}</option>
          <option v-for="c in availableCategories" :key="c" :value="c">
            {{ t(`categories.${c}`) }}
          </option>
        </select>
      </div>

      <!-- Sort -->
      <div>
        <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          {{ t('filters.sort') }}
        </label>
        <div class="flex gap-2">
          <select
            :value="sortBy"
            @change="$emit('update:sortBy', $event.target.value)"
            class="flex-1 px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-bg3-ink bg-gray-50 dark:bg-bg3-ink/30 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-bg3-gold/50 focus:border-bg3-gold outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="name">{{ t('filters.sortName') }}</option>
            <option value="rarity">{{ t('filters.sortRarity') }}</option>
            <option value="category">{{ t('filters.sortCategory') }}</option>
          </select>
          <button
            @click="$emit('update:sortOrder', sortOrder === 'asc' ? 'desc' : 'asc')"
            class="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-bg3-ink bg-gray-50 dark:bg-bg3-ink/30 hover:bg-gray-100 dark:hover:bg-bg3-ink/50 transition-colors"
            :title="sortOrder === 'asc' ? t('filters.ascending') : t('filters.descending')"
          >
            <svg class="w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform" :class="sortOrder === 'desc' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Toggles -->
      <div class="space-y-3">
        <!-- Favorites Only -->
        <label class="flex items-center gap-3 cursor-pointer group">
          <div class="relative">
            <input
              type="checkbox"
              :checked="showFavoritesOnly"
              @change="$emit('update:showFavoritesOnly', $event.target.checked)"
              class="sr-only peer"
            />
            <div class="w-10 h-5 bg-gray-200 dark:bg-bg3-ink rounded-full peer-checked:bg-red-500 transition-colors"></div>
            <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform"></div>
          </div>
          <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
            {{ t('filters.favoritesOnly') }}
          </span>
        </label>

        <!-- Unique Only -->
        <label class="flex items-center gap-3 cursor-pointer group">
          <div class="relative">
            <input
              type="checkbox"
              :checked="showUniqueOnly"
              @change="$emit('update:showUniqueOnly', $event.target.checked)"
              class="sr-only peer"
            />
            <div class="w-10 h-5 bg-gray-200 dark:bg-bg3-ink rounded-full peer-checked:bg-bg3-gold transition-colors"></div>
            <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform"></div>
          </div>
          <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
            {{ t('filters.unique') }}
          </span>
        </label>
      </div>

      <!-- Reset -->
      <button
        @click="$emit('reset')"
        class="w-full py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-bg3-ink text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-bg3-ink/30 hover:text-gray-900 dark:hover:text-gray-200 transition-all"
      >
        {{ t('filters.resetFilters') }}
      </button>
    </div>
  </aside>

  <!-- Overlay for mobile -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="$emit('close')"
    />
  </Transition>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  isOpen: { type: Boolean, default: false },
  searchQuery: { type: String, default: '' },
  selectedRarity: { type: String, default: '' },
  selectedCategory: { type: String, default: '' },
  showFavoritesOnly: { type: Boolean, default: false },
  showUniqueOnly: { type: Boolean, default: false },
  sortBy: { type: String, default: 'name' },
  sortOrder: { type: String, default: 'asc' },
  availableRarities: { type: Array, default: () => [] },
  availableCategories: { type: Array, default: () => [] },
})

defineEmits([
  'close',
  'update:searchQuery',
  'update:selectedRarity',
  'update:selectedCategory',
  'update:showFavoritesOnly',
  'update:showUniqueOnly',
  'update:sortBy',
  'update:sortOrder',
  'reset',
])
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
