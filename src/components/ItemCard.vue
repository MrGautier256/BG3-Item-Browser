<template>
  <div
    class="group relative bg-white dark:bg-bg3-ink/40 rounded-xl border border-gray-200 dark:border-bg3-ink/60 hover:border-bg3-gold/50 dark:hover:border-bg3-gold/40 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in"
    @click="$emit('select', item)"
  >
    <!-- Rarity top accent -->
    <div class="h-1 w-full" :class="rarityGradient"></div>

    <div class="p-4">
      <!-- Top row: icon + info -->
      <div class="flex items-start gap-3">
        <!-- Icon -->
        <div
          class="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors"
          :class="rarityBorderClass"
        >
          <img
            v-if="!iconError"
            :src="iconSrc"
            :alt="name"
            class="w-full h-full object-cover bg-gray-100 dark:bg-bg3-dark"
            @error="iconError = true"
            loading="lazy"
          />
          <div v-else class="w-full h-full bg-gray-100 dark:bg-bg3-dark flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <h3 class="font-display font-semibold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-bg3-gold-dark dark:group-hover:text-bg3-gold transition-colors">
            {{ name }}
          </h3>

          <!-- Rarity Badge -->
          <span
            class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full text-white"
            :class="rarityBadgeClass"
          >
            {{ t(`rarities.${item.rarity || 'Common'}`) }}
          </span>

          <!-- Category -->
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {{ t(`categories.${item.category}`) }}
          </p>
        </div>

        <!-- Favorite button -->
        <button
          @click.stop="$emit('toggle-favorite', item.id)"
          class="flex-shrink-0 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          :title="isFavorite ? t('item.removeFavorite') : t('item.addFavorite')"
        >
          <svg
            class="w-5 h-5 transition-all duration-200"
            :class="isFavorite ? 'text-red-500 fill-current scale-110' : 'text-gray-300 dark:text-gray-600 hover:text-red-400'"
            :fill="isFavorite ? 'currentColor' : 'none'"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
      </div>

      <!-- Description preview -->
      <p v-if="description" class="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
        {{ cleanText(description) }}
      </p>

      <!-- Effects/Passives preview -->
      <div v-if="hasDetails" class="mt-2 flex flex-wrap gap-1">
        <span
          v-for="(tag, i) in previewTags.slice(0, 3)"
          :key="i"
          class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-bg3-gold/10 dark:bg-bg3-gold/20 text-bg3-gold-dark dark:text-bg3-gold"
        >
          {{ tag }}
        </span>
        <span
          v-if="previewTags.length > 3"
          class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-gray-100 dark:bg-bg3-ink/50 text-gray-500 dark:text-gray-400"
        >
          +{{ previewTags.length - 3 }}
        </span>
      </div>

      <!-- Bottom actions -->
      <div class="mt-3 pt-2 border-t border-gray-100 dark:border-bg3-ink/30 flex items-center justify-between">
        <div class="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
          <span v-if="item.unique" class="flex items-center gap-0.5">
            <svg class="w-3 h-3 text-bg3-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {{ t('item.unique') }}
          </span>
          <span v-if="item.charges">⚡ {{ item.charges }}/{{ item.max_charges || item.charges }}</span>
        </div>
        <button
          @click.stop="$emit('export-pdf', item)"
          class="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-lg bg-bg3-crimson/10 hover:bg-bg3-crimson/20 text-bg3-crimson dark:text-red-400 transition-colors"
          :title="t('item.exportPDF')"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          PDF
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const props = defineProps({
  item: { type: Object, required: true },
  isFavorite: { type: Boolean, default: false },
})

defineEmits(['select', 'toggle-favorite', 'export-pdf'])

const iconError = ref(false)

const name = computed(() => {
  const lang = locale.value
  return props.item.translations?.[lang]?.name || props.item.translations?.en?.name || props.item.title || props.item.id
})

const description = computed(() => {
  const lang = locale.value
  return props.item.translations?.[lang]?.description || props.item.translations?.en?.description || props.item.description || ''
})

const iconSrc = computed(() => {
  return props.item.icon_path || `/icons/${props.item.icon}.png`
})

const hasDetails = computed(() => {
  return (props.item.effects?.length > 0) || (props.item.passives_full?.length > 0) || (props.item.spells_full?.length > 0)
})

const previewTags = computed(() => {
  const tags = []
  const lang = locale.value
  if (props.item.display_effects) {
    props.item.display_effects.forEach(e => {
      const n = e.name?.[lang] || e.name?.en
      if (n) tags.push(n)
    })
  }
  if (props.item.passives_full) {
    props.item.passives_full.forEach(p => {
      const name = p.name?.[lang] || p.name?.en || p.id
      if (name) tags.push(name)
    })
  }
  if (props.item.spells_full) {
    props.item.spells_full.forEach(s => {
      const name = s.name?.[lang] || s.name?.en || s.id
      if (name) tags.push(name)
    })
  }
  return tags
})

function cleanText(text) {
  if (!text) return ''
  return text.replace(/<LSTag[^>]*?>(.*?)<\/LSTag>/gi, '$1').replace(/<[^>]+>/g, '')
}

const rarityBadgeClass = computed(() => {
  switch (props.item.rarity) {
    case 'Common': return 'bg-rarity-common'
    case 'Uncommon': return 'bg-rarity-uncommon'
    case 'Rare': return 'bg-rarity-rare'
    case 'VeryRare': return 'bg-rarity-veryrare'
    case 'Legendary': return 'bg-rarity-legendary'
    case 'Story': return 'bg-rarity-story'
    default: return 'bg-gray-400'
  }
})

const rarityBorderClass = computed(() => {
  switch (props.item.rarity) {
    case 'Common': return 'border-rarity-common/40'
    case 'Uncommon': return 'border-rarity-uncommon/40'
    case 'Rare': return 'border-rarity-rare/40'
    case 'VeryRare': return 'border-rarity-veryrare/40'
    case 'Legendary': return 'border-rarity-legendary/40'
    case 'Story': return 'border-rarity-story/40'
    default: return 'border-gray-300'
  }
})

const rarityGradient = computed(() => {
  switch (props.item.rarity) {
    case 'Common': return 'bg-gradient-to-r from-rarity-common/60 to-rarity-common/20'
    case 'Uncommon': return 'bg-gradient-to-r from-rarity-uncommon/60 to-rarity-uncommon/20'
    case 'Rare': return 'bg-gradient-to-r from-rarity-rare/60 to-rarity-rare/20'
    case 'VeryRare': return 'bg-gradient-to-r from-rarity-veryrare/60 to-rarity-veryrare/20'
    case 'Legendary': return 'bg-gradient-to-r from-rarity-legendary/60 to-rarity-legendary/20'
    case 'Story': return 'bg-gradient-to-r from-rarity-story/60 to-rarity-story/20'
    default: return 'bg-gradient-to-r from-gray-300/60 to-gray-300/20'
  }
})
</script>
