<template>
  <div :class="{ dark: isDark }" class="min-h-screen">
    <div class="min-h-screen bg-gray-50 dark:bg-bg3-dark text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <!-- Header -->
      <AppHeader
        :filtered-count="filteredItems.length"
        :total-count="allItems.length"
        :favorites-count="favorites.length"
        :compare-count="compareList.length"
        :is-dark="isDark"
        :active-view="activeView"
        @toggle-theme="toggleTheme"
        @toggle-filters="showFilters = !showFilters"
        @set-view="v => activeView = v"
        @export-json="exportFilteredJSON"
        @export-favorites="exportFavoritesJSON"
        @copy-link="copyShareLink"
      />

      <!-- Main layout -->
      <div class="max-w-screen-2xl mx-auto flex">
        <!-- Sidebar -->
        <FiltersSidebar
          v-show="activeView === 'browse'"
          :is-open="showFilters"
          :search-query="searchQuery"
          :selected-rarity="selectedRarity"
          :selected-category="selectedCategory"
          :selected-damage-type="selectedDamageType"
          :selected-proficiency="selectedProficiency"
          :selected-slot="selectedSlot"
          :show-favorites-only="showFavoritesOnly"
          :show-unique-only="showUniqueOnly"
          :show-spells-only="showSpellsOnly"
          :show-passives-only="showPassivesOnly"
          :sort-by="sortBy"
          :sort-order="sortOrder"
          :available-rarities="availableRarities"
          :available-categories="availableCategories"
          :available-damage-types="availableDamageTypes"
          :available-proficiencies="availableProficiencies"
          :available-slots="availableSlots"
          :active-filter-count="activeFilterCount"
          @close="showFilters = false"
          @update:searchQuery="v => { searchQuery = v; resetVisible() }"
          @update:selectedRarity="v => { selectedRarity = v; resetVisible() }"
          @update:selectedCategory="v => { selectedCategory = v; resetVisible() }"
          @update:selectedDamageType="v => { selectedDamageType = v; resetVisible() }"
          @update:selectedProficiency="v => { selectedProficiency = v; resetVisible() }"
          @update:selectedSlot="v => { selectedSlot = v; resetVisible() }"
          @update:showFavoritesOnly="v => { showFavoritesOnly = v; resetVisible() }"
          @update:showUniqueOnly="v => { showUniqueOnly = v; resetVisible() }"
          @update:showSpellsOnly="v => { showSpellsOnly = v; resetVisible() }"
          @update:showPassivesOnly="v => { showPassivesOnly = v; resetVisible() }"
          @update:sortBy="v => { sortBy = v; resetVisible() }"
          @update:sortOrder="v => { sortOrder = v; resetVisible() }"
          @reset="resetFilters"
        />

        <!-- Content -->
        <main class="flex-1 p-4 md:p-6">
          <!-- Browse View -->
          <template v-if="activeView === 'browse'">
            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-20">
              <div class="flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-4 border-bg3-gold/30 border-t-bg3-gold rounded-full animate-spin"></div>
                <p class="text-gray-500 dark:text-gray-400 font-medium">{{ locale === 'fr' ? 'Chargement...' : 'Loading items...' }}</p>
              </div>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="flex items-center justify-center py-20">
              <p class="text-red-500 text-lg font-medium">{{ error }}</p>
            </div>

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
                  :is-in-compare="isInCompare(item.id)"
                  @select="openDetails"
                  @toggle-favorite="toggleFavorite"
                  @toggle-compare="toggleCompare"
                />
              </div>

              <!-- Load more -->
              <div v-if="displayedItems.length < filteredItems.length" class="mt-8 flex flex-col items-center gap-2">
                <p class="text-sm text-gray-400 dark:text-gray-500">
                  {{ t('pagination.showing') }} {{ displayedItems.length }} {{ t('pagination.of') }} {{ filteredItems.length }}
                </p>
                <button @click="loadMore" class="btn-primary">
                  {{ t('pagination.loadMore') }}
                </button>
              </div>
            </template>
          </template>

          <!-- Compare View -->
          <CompareView
            v-if="activeView === 'compare'"
            :items="compareItems"
            @remove="toggleCompare"
            @clear="clearCompare"
            @select="openDetails"
          />
        </main>
      </div>

      <!-- Item Details Modal -->
      <ItemDetails
        :item="selectedItem"
        :is-favorite="selectedItem ? isFavorite(selectedItem.id) : false"
        :is-in-compare="selectedItem ? isInCompare(selectedItem.id) : false"
        @close="selectedItem = null"
        @toggle-favorite="toggleFavorite"
        @toggle-compare="toggleCompare"
      />

      <!-- Toast -->
      <Transition name="fade">
        <div v-if="toastMsg" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl bg-bg3-dark dark:bg-white text-white dark:text-bg3-dark font-medium text-sm shadow-xl">
          {{ toastMsg }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useItems } from './composables/useItems'
import { useLocalStorage } from './composables/useLocalStorage'
import AppHeader from './components/AppHeader.vue'
import FiltersSidebar from './components/FiltersSidebar.vue'
import ItemCard from './components/ItemCard.vue'
import ItemDetails from './components/ItemDetails.vue'
import CompareView from './components/CompareView.vue'

const { t, locale } = useI18n()

const {
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
  loadItems, isFavorite, toggleFavorite,
  isInCompare, toggleCompare, clearCompare,
  loadMore, resetFilters, resetVisible,
  exportFilteredJSON, exportFavoritesJSON,
  generateShareLink, loadFromURL,
} = useItems()

const isDark = useLocalStorage('bg3-dark', true)
const showFilters = ref(false)
const selectedItem = ref(null)
const activeView = ref('browse')
const toastMsg = ref('')

watch(isDark, (val) => {
  document.documentElement.classList.toggle('dark', val)
}, { immediate: true })

function toggleTheme() { isDark.value = !isDark.value }

function openDetails(item) { selectedItem.value = item }

function showToast(msg) {
  toastMsg.value = msg
  setTimeout(() => { toastMsg.value = '' }, 2500)
}

async function copyShareLink() {
  const link = generateShareLink()
  try {
    await navigator.clipboard.writeText(link)
    showToast(t('header.linkCopied'))
  } catch {
    showToast(link)
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    if (selectedItem.value) selectedItem.value = null
    else if (showFilters.value) showFilters.value = false
  }
}

onMounted(() => {
  loadItems().then(() => { loadFromURL() })
  window.addEventListener('keydown', handleKeydown)
})
</script>
