<template>
  <header class="sticky top-0 z-40 bg-white/80 dark:bg-bg3-dark/90 backdrop-blur-md border-b border-bg3-gold/30 shadow-sm">
    <div class="max-w-screen-2xl mx-auto px-4 py-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3 cursor-pointer" @click="$emit('set-view', 'browse')">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-bg3-gold to-bg3-gold-dark flex items-center justify-center shadow-lg">
            <span class="text-xl">⚔️</span>
          </div>
          <div>
            <h1 class="font-display text-lg md:text-xl font-bold text-bg3-dark dark:text-bg3-gold leading-tight">
              {{ t('app.title') }}
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{{ t('app.subtitle') }}</p>
          </div>
        </div>

        <!-- Stats & Controls -->
        <div class="flex items-center gap-2 md:gap-3 flex-wrap">
          <!-- Item counter -->
          <div class="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-bg3-ink/50 px-3 py-1.5 rounded-full">
            <span class="font-semibold">{{ filteredCount }}</span>
            <span class="text-gray-400">/</span>
            <span>{{ totalCount }}</span>
            <span class="hidden sm:inline">{{ t('header.items') }}</span>
          </div>

          <!-- Favorites counter -->
          <button
            @click="$emit('set-view', 'browse')"
            class="flex items-center gap-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <span>❤️</span>
            <span class="font-semibold">{{ favoritesCount }}</span>
          </button>

          <!-- Compare button -->
          <button
            @click="$emit('set-view', 'compare')"
            class="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-colors"
            :class="activeView === 'compare'
              ? 'bg-bg3-gold text-white'
              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'"
          >
            <span>⚖️</span>
            <span class="font-semibold">{{ compareCount }}</span>
            <span class="hidden sm:inline">{{ t('header.compare') }}</span>
          </button>

          <!-- Export dropdown -->
          <div class="relative" ref="exportDropdown">
            <button
              @click="showExport = !showExport"
              class="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <span>📤</span>
              <span class="hidden sm:inline">{{ t('header.export') }}</span>
            </button>
            <Transition name="fade">
              <div v-if="showExport" class="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-bg3-dark-mid rounded-xl border border-gray-200 dark:border-bg3-ink shadow-xl z-50 py-1">
                <button @click="$emit('export-json'); showExport = false" class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-bg3-ink/50 transition-colors">
                  📄 {{ t('header.exportJSON') }}
                </button>
                <button @click="$emit('export-favorites'); showExport = false" class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-bg3-ink/50 transition-colors">
                  ❤️ {{ t('export.favoritesOnly') }}
                </button>
                <button @click="$emit('copy-link'); showExport = false" class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-bg3-ink/50 transition-colors">
                  🔗 {{ t('header.exportLink') }}
                </button>
              </div>
            </Transition>
          </div>

          <!-- Language Switch -->
          <button
            @click="toggleLocale"
            class="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-bg3-gold/10 hover:bg-bg3-gold/20 dark:bg-bg3-gold/20 dark:hover:bg-bg3-gold/30 text-bg3-gold-dark dark:text-bg3-gold transition-colors font-medium"
            :title="t('header.language')"
          >
            🌐 {{ locale === 'fr' ? 'FR' : 'EN' }}
          </button>

          <!-- Theme Toggle -->
          <button
            @click="$emit('toggle-theme')"
            class="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-bg3-ink/50 dark:hover:bg-bg3-ink transition-colors"
            :title="t('header.theme')"
          >
            {{ isDark ? '☀️' : '🌙' }}
            <span class="hidden sm:inline text-gray-600 dark:text-gray-300">
              {{ isDark ? t('header.light') : t('header.dark') }}
            </span>
          </button>

          <!-- Mobile filter toggle -->
          <button
            @click="$emit('toggle-filters')"
            class="md:hidden flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-bg3-gold/10 hover:bg-bg3-gold/20 text-bg3-gold-dark dark:text-bg3-gold transition-colors"
          >
            🔍 {{ t('filters.title') }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const props = defineProps({
  filteredCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  favoritesCount: { type: Number, default: 0 },
  compareCount: { type: Number, default: 0 },
  isDark: { type: Boolean, default: false },
  activeView: { type: String, default: 'browse' },
})

const emit = defineEmits(['toggle-theme', 'toggle-filters', 'set-view', 'export-json', 'export-favorites', 'copy-link'])

const showExport = ref(false)
const exportDropdown = ref(null)

function toggleLocale() {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
  localStorage.setItem('bg3-locale', locale.value)
}

function handleClickOutside(e) {
  if (exportDropdown.value && !exportDropdown.value.contains(e.target)) {
    showExport.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>
