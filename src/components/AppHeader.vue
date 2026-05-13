<template>
  <header class="sticky top-0 z-40 bg-white/80 dark:bg-bg3-dark/90 backdrop-blur-md border-b border-bg3-gold/30 shadow-sm">
    <div class="max-w-screen-2xl mx-auto px-4 py-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-bg3-gold to-bg3-gold-dark flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-bg3-dark" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h1 class="font-display text-lg md:text-xl font-bold text-bg3-dark dark:text-bg3-gold leading-tight">
              {{ t('app.title') }}
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{{ t('app.subtitle') }}</p>
          </div>
        </div>

        <!-- Stats & Controls -->
        <div class="flex items-center gap-2 md:gap-4 flex-wrap">
          <!-- Item counter -->
          <div class="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-bg3-ink/50 px-3 py-1.5 rounded-full">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <span class="font-semibold">{{ filteredCount }}</span>
            <span class="text-gray-400">/</span>
            <span>{{ totalCount }}</span>
            <span class="hidden sm:inline">{{ t('header.items') }}</span>
          </div>

          <!-- Favorites counter -->
          <div class="flex items-center gap-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span class="font-semibold">{{ favoritesCount }}</span>
            <span class="hidden sm:inline">{{ t('header.favorites') }}</span>
          </div>

          <!-- Language Switch -->
          <button
            @click="toggleLocale"
            class="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-bg3-gold/10 hover:bg-bg3-gold/20 dark:bg-bg3-gold/20 dark:hover:bg-bg3-gold/30 text-bg3-gold-dark dark:text-bg3-gold transition-colors font-medium"
            :title="t('header.language')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
            </svg>
            <span>{{ locale === 'fr' ? 'FR' : 'EN' }}</span>
          </button>

          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-bg3-ink/50 dark:hover:bg-bg3-ink transition-colors"
            :title="t('header.theme')"
          >
            <!-- Sun (shown in dark mode) -->
            <svg v-if="isDark" class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 7a5 5 0 100 10 5 5 0 000-10zM2 13h2a1 1 0 100-2H2a1 1 0 100 2zm18 0h2a1 1 0 100-2h-2a1 1 0 100 2zM11 2v2a1 1 0 102 0V2a1 1 0 10-2 0zm0 18v2a1 1 0 102 0v-2a1 1 0 10-2 0zM5.99 4.58a1 1 0 10-1.41 1.41l1.06 1.06a1 1 0 001.41-1.41L5.99 4.58zm12.37 12.37a1 1 0 10-1.41 1.41l1.06 1.06a1 1 0 001.41-1.41l-1.06-1.06zm1.06-10.96a1 1 0 10-1.41-1.41l-1.06 1.06a1 1 0 001.41 1.41l1.06-1.06zM7.05 18.36a1 1 0 10-1.41-1.41l-1.06 1.06a1 1 0 001.41 1.41l1.06-1.06z"/>
            </svg>
            <!-- Moon (shown in light mode) -->
            <svg v-else class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.64 13a1 1 0 00-1.05-.14 8.05 8.05 0 01-3.37.73A8.15 8.15 0 019.08 5.49a8.59 8.59 0 01.25-2 1 1 0 00-1.28-1.21A10 10 0 1021.64 13z"/>
            </svg>
            <span class="hidden sm:inline text-gray-600 dark:text-gray-300">
              {{ isDark ? t('header.light') : t('header.dark') }}
            </span>
          </button>

          <!-- Mobile filter toggle -->
          <button
            @click="$emit('toggle-filters')"
            class="md:hidden flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-bg3-gold/10 hover:bg-bg3-gold/20 text-bg3-gold-dark dark:text-bg3-gold transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            <span>{{ t('filters.title') }}</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const props = defineProps({
  filteredCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  favoritesCount: { type: Number, default: 0 },
  isDark: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-theme', 'toggle-filters'])

function toggleLocale() {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
  localStorage.setItem('bg3-locale', locale.value)
}

function toggleTheme() {
  emit('toggle-theme')
}
</script>
