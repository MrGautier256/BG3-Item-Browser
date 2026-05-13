<template>
  <div :class="{ dark: isDark }" class="min-h-screen">
    <div class="min-h-screen bg-gray-50 dark:bg-bg3-dark text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <!-- Header -->
      <AppHeader
        :filtered-count="filteredItems.length"
        :total-count="allItems.length"
        :favorites-count="favorites.length"
        :is-dark="isDark"
        @toggle-theme="toggleTheme"
        @toggle-filters="showFilters = !showFilters"
      />

      <!-- Main layout -->
      <div class="max-w-screen-2xl mx-auto flex">
        <!-- Sidebar -->
        <FiltersSidebar
          :is-open="showFilters"
          :search-query="searchQuery"
          :selected-rarity="selectedRarity"
          :selected-category="selectedCategory"
          :show-favorites-only="showFavoritesOnly"
          :show-unique-only="showUniqueOnly"
          :sort-by="sortBy"
          :sort-order="sortOrder"
          :available-rarities="availableRarities"
          :available-categories="availableCategories"
          @close="showFilters = false"
          @update:searchQuery="v => { searchQuery = v; resetVisible() }"
          @update:selectedRarity="v => { selectedRarity = v; resetVisible() }"
          @update:selectedCategory="v => { selectedCategory = v; resetVisible() }"
          @update:showFavoritesOnly="v => { showFavoritesOnly = v; resetVisible() }"
          @update:showUniqueOnly="v => { showUniqueOnly = v; resetVisible() }"
          @update:sortBy="v => { sortBy = v; resetVisible() }"
          @update:sortOrder="v => { sortOrder = v; resetVisible() }"
          @reset="resetFilters"
        />

        <!-- Content -->
        <main class="flex-1 p-4 md:p-6">
          <!-- Loading -->
          <div v-if="loading" class="flex items-center justify-center py-20">
            <div class="flex flex-col items-center gap-4">
              <div class="w-12 h-12 border-4 border-bg3-gold/30 border-t-bg3-gold rounded-full animate-spin"></div>
              <p class="text-gray-500 dark:text-gray-400 font-medium">Loading items...</p>
            </div>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="flex items-center justify-center py-20">
            <div class="text-center">
              <p class="text-red-500 text-lg font-medium">{{ error }}</p>
            </div>
          </div>

          <!-- Items Grid -->
          <template v-else>
            <!-- No results -->
            <div v-if="filteredItems.length === 0" class="flex flex-col items-center justify-center py-20 gap-4">
              <svg class="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <p class="text-gray-500 dark:text-gray-400 font-medium text-lg">{{ t('pagination.noResults') }}</p>
              <p class="text-gray-400 dark:text-gray-500 text-sm">{{ t('pagination.noResultsHint') }}</p>
            </div>

            <!-- Grid -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <ItemCard
                v-for="item in displayedItems"
                :key="item.id"
                :item="item"
                :is-favorite="isFavorite(item.id)"
                @select="openDetails"
                @toggle-favorite="toggleFavorite"
                @export-pdf="handleExportPDF"
              />
            </div>

            <!-- Load more -->
            <div v-if="displayedItems.length < filteredItems.length" class="mt-8 flex flex-col items-center gap-2">
              <p class="text-sm text-gray-400 dark:text-gray-500">
                {{ t('pagination.showing') }} {{ displayedItems.length }} {{ t('pagination.of') }} {{ filteredItems.length }}
              </p>
              <button
                @click="loadMore"
                class="px-6 py-2.5 rounded-xl bg-bg3-gold/10 hover:bg-bg3-gold/20 dark:bg-bg3-gold/20 dark:hover:bg-bg3-gold/30 text-bg3-gold-dark dark:text-bg3-gold font-medium text-sm transition-colors"
              >
                {{ t('pagination.loadMore') }}
              </button>
            </div>
          </template>
        </main>
      </div>

      <!-- Item Details Modal -->
      <ItemDetails
        :item="selectedItem"
        :is-favorite="selectedItem ? isFavorite(selectedItem.id) : false"
        @close="selectedItem = null"
        @toggle-favorite="toggleFavorite"
        @export-pdf="handleExportPDF"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useItems } from './composables/useItems'
import { usePDF } from './composables/usePDF'
import { useLocalStorage } from './composables/useLocalStorage'
import AppHeader from './components/AppHeader.vue'
import FiltersSidebar from './components/FiltersSidebar.vue'
import ItemCard from './components/ItemCard.vue'
import ItemDetails from './components/ItemDetails.vue'

const { t, locale } = useI18n()

const {
  allItems, loading, error,
  searchQuery, selectedRarity, selectedCategory,
  showFavoritesOnly, showUniqueOnly, sortBy, sortOrder,
  favorites, filteredItems, displayedItems,
  availableRarities, availableCategories,
  loadItems, isFavorite, toggleFavorite,
  loadMore, resetFilters, resetVisible,
} = useItems()

const { exportItemPDF } = usePDF()

const isDark = useLocalStorage('bg3-dark', true)
const showFilters = ref(false)
const selectedItem = ref(null)

// Apply dark class to html
watch(isDark, (val) => {
  document.documentElement.classList.toggle('dark', val)
}, { immediate: true })

function toggleTheme() {
  isDark.value = !isDark.value
}

function openDetails(item) {
  selectedItem.value = item
}

function handleExportPDF(item) {
  exportItemPDF(item, locale.value)
}

// Close modal on Escape
function handleKeydown(e) {
  if (e.key === 'Escape') {
    if (selectedItem.value) {
      selectedItem.value = null
    } else if (showFilters.value) {
      showFilters.value = false
    }
  }
}

onMounted(() => {
  loadItems()
  window.addEventListener('keydown', handleKeydown)
})
</script>
