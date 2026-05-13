<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="item"
        class="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 md:p-8 overflow-y-auto"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>

        <!-- Modal -->
        <div class="relative w-full max-w-2xl bg-white dark:bg-bg3-dark-mid rounded-2xl shadow-2xl overflow-hidden animate-scale-in my-4">
          <!-- Rarity header accent -->
          <div class="h-2 w-full" :class="rarityGradient"></div>

          <!-- Close button -->
          <button
            @click="$emit('close')"
            class="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-bg3-ink/80 hover:bg-white dark:hover:bg-bg3-ink shadow-md transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <div class="p-6 md:p-8">
            <!-- Header: Icon + Name + Rarity -->
            <div class="flex items-start gap-4 mb-6">
              <div class="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 shadow-lg" :class="rarityBorderClass">
                <img
                  v-if="!iconError"
                  :src="iconSrc"
                  :alt="name"
                  class="w-full h-full object-cover bg-gray-100 dark:bg-bg3-dark"
                  @error="iconError = true"
                />
                <div v-else class="w-full h-full bg-gray-100 dark:bg-bg3-dark flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <h2 class="font-display text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {{ name }}
                </h2>
                <div class="flex flex-wrap items-center gap-2 mt-2">
                  <span class="inline-block px-3 py-1 text-xs font-bold rounded-full text-white" :class="rarityBadgeClass">
                    {{ t(`rarities.${item.rarity || 'Common'}`) }}
                  </span>
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                    {{ t(`categories.${item.category}`) }}
                  </span>
                  <span v-if="item.unique" class="flex items-center gap-1 text-xs text-bg3-gold font-medium">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {{ t('item.unique') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div v-if="description" class="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-bg3-ink/30 border border-gray-100 dark:border-bg3-ink/50">
              <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {{ t('item.description') }}
              </h4>
              <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                {{ cleanText(description) }}
              </p>
            </div>

            <!-- Stats Grid -->
            <div v-if="hasStats" class="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div v-if="item.weight" class="p-3 rounded-xl bg-gray-50 dark:bg-bg3-ink/30 text-center">
                <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">{{ t('item.weight') }}</p>
                <p class="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{{ item.weight }}</p>
              </div>
              <div v-if="item.value" class="p-3 rounded-xl bg-gray-50 dark:bg-bg3-ink/30 text-center">
                <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">{{ t('item.value') }}</p>
                <p class="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{{ item.value }}</p>
              </div>
              <div v-if="item.charges" class="p-3 rounded-xl bg-gray-50 dark:bg-bg3-ink/30 text-center">
                <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">{{ t('item.charges') }}</p>
                <p class="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{{ item.charges }} / {{ item.max_charges || item.charges }}</p>
              </div>
              <div v-if="item.proficiency_group" class="p-3 rounded-xl bg-gray-50 dark:bg-bg3-ink/30 text-center">
                <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">{{ t('item.proficiency') }}</p>
                <p class="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{{ item.proficiency_group }}</p>
              </div>
            </div>

            <!-- Passives -->
            <DetailSection
              v-if="item.passives_full && item.passives_full.length > 0"
              :title="t('item.passives')"
              icon-color="text-blue-500 dark:text-blue-400"
            >
              <div class="space-y-3">
                <div v-for="(passive, i) in item.passives_full" :key="i" class="pl-3 border-l-2 border-blue-400/30">
                  <p class="font-medium text-sm text-gray-800 dark:text-gray-200">
                    {{ passive.name?.[locale] || passive.name?.en || passive.id }}
                  </p>
                  <p v-if="getPassiveDesc(passive)" class="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                    {{ getPassiveDesc(passive) }}
                  </p>
                  <p v-if="getPassiveExtra(passive)" class="text-xs text-gray-500 dark:text-gray-500 mt-0.5 italic">
                    {{ getPassiveExtra(passive) }}
                  </p>
                </div>
              </div>
            </DetailSection>

            <!-- Spells -->
            <DetailSection
              v-if="item.spells_full && item.spells_full.length > 0"
              :title="t('item.spells')"
              icon-color="text-purple-500 dark:text-purple-400"
            >
              <div class="space-y-3">
                <div v-for="(spell, i) in item.spells_full" :key="i" class="pl-3 border-l-2 border-purple-400/30">
                  <p class="font-medium text-sm text-gray-800 dark:text-gray-200">
                    {{ spell.name?.[locale] || spell.name?.en || spell.id }}
                  </p>
                  <p v-if="getSpellDesc(spell)" class="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                    {{ getSpellDesc(spell) }}
                  </p>
                  <div v-if="spell.spell_school || spell.level || spell.spell_type" class="flex flex-wrap gap-2 mt-1">
                    <span v-if="spell.spell_school" class="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                      {{ spell.spell_school }}
                    </span>
                    <span v-if="spell.level" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-bg3-ink/50 text-gray-600 dark:text-gray-400">
                      Lvl {{ spell.level }}
                    </span>
                    <span v-if="spell.spell_type" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-bg3-ink/50 text-gray-600 dark:text-gray-400">
                      {{ spell.spell_type }}
                    </span>
                  </div>
                  <!-- Spell tooltip damage -->
                  <div v-if="spell.tooltip?.damage_list?.length" class="mt-1 flex flex-wrap gap-1">
                    <span v-for="(dmg, di) in spell.tooltip.damage_list" :key="di" class="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      {{ dmg.dice || '' }} {{ dmg.type || '' }}
                    </span>
                  </div>
                </div>
              </div>
            </DetailSection>

            <!-- Statuses on Equip -->
            <DetailSection
              v-if="item.status_full && item.status_full.length > 0"
              :title="t('item.statuses')"
              icon-color="text-amber-500 dark:text-amber-400"
            >
              <div class="space-y-3">
                <div v-for="(status, i) in item.status_full" :key="i" class="pl-3 border-l-2 border-amber-400/30">
                  <p class="font-medium text-sm text-gray-800 dark:text-gray-200">
                    {{ status.name?.[locale] || status.name?.en || status.id }}
                  </p>
                  <p v-if="getStatusDesc(status)" class="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                    {{ getStatusDesc(status) }}
                  </p>
                </div>
              </div>
            </DetailSection>

            <!-- Actions -->
            <div class="mt-6 pt-4 border-t border-gray-200 dark:border-bg3-ink/50 flex flex-wrap items-center gap-3">
              <button
                @click="$emit('toggle-favorite', item.id)"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                :class="isFavorite
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                  : 'bg-gray-100 dark:bg-bg3-ink/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-bg3-ink'"
              >
                <svg
                  class="w-4 h-4"
                  :fill="isFavorite ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                {{ isFavorite ? t('item.removeFavorite') : t('item.addFavorite') }}
              </button>

              <button
                @click="$emit('export-pdf', item)"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-bg3-crimson/10 hover:bg-bg3-crimson/20 text-bg3-crimson dark:text-red-400 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                {{ t('item.exportPDF') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailSection from './DetailSection.vue'

const { t, locale } = useI18n()

const props = defineProps({
  item: { type: Object, default: null },
  isFavorite: { type: Boolean, default: false },
})

defineEmits(['close', 'toggle-favorite', 'export-pdf'])

const iconError = ref(false)

const name = computed(() => {
  if (!props.item) return ''
  const lang = locale.value
  return props.item.translations?.[lang]?.name || props.item.translations?.en?.name || props.item.title || props.item.id
})

const description = computed(() => {
  if (!props.item) return ''
  const lang = locale.value
  return props.item.translations?.[lang]?.description || props.item.translations?.en?.description || props.item.description || ''
})

const iconSrc = computed(() => {
  if (!props.item) return ''
  return props.item.icon_path || `/icons/${props.item.icon}.png`
})

const hasStats = computed(() => {
  if (!props.item) return false
  return props.item.weight || props.item.value || props.item.charges || props.item.proficiency_group
})

function cleanText(text) {
  if (!text) return ''
  return text.replace(/<LSTag[^>]*?>(.*?)<\/LSTag>/gi, '$1').replace(/<[^>]+>/g, '')
}

function fillParams(text, params) {
  if (!text || !params || params.length === 0) return text
  let result = text
  params.forEach((p, i) => {
    result = result.replace(`[${i + 1}]`, p)
  })
  return result
}

function getPassiveDesc(passive) {
  const lang = locale.value
  let desc = passive.description?.[lang] || passive.description?.en || ''
  desc = fillParams(desc, passive.description_params)
  return cleanText(desc)
}

function getPassiveExtra(passive) {
  const lang = locale.value
  let desc = passive.extra_description?.[lang] || passive.extra_description?.en || ''
  desc = fillParams(desc, passive.extra_description_params)
  return cleanText(desc)
}

function getSpellDesc(spell) {
  const lang = locale.value
  let desc = spell.description?.[lang] || spell.description?.en || ''
  desc = fillParams(desc, spell.description_params)
  return cleanText(desc)
}

function getStatusDesc(status) {
  const lang = locale.value
  let desc = status.description?.[lang] || status.description?.en || ''
  desc = fillParams(desc, status.description_params)
  return cleanText(desc)
}

const rarityBadgeClass = computed(() => {
  if (!props.item) return 'bg-gray-400'
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
  if (!props.item) return 'border-gray-300'
  switch (props.item.rarity) {
    case 'Common': return 'border-rarity-common'
    case 'Uncommon': return 'border-rarity-uncommon'
    case 'Rare': return 'border-rarity-rare'
    case 'VeryRare': return 'border-rarity-veryrare'
    case 'Legendary': return 'border-rarity-legendary'
    case 'Story': return 'border-rarity-story'
    default: return 'border-gray-300'
  }
})

const rarityGradient = computed(() => {
  if (!props.item) return 'bg-gray-300'
  switch (props.item.rarity) {
    case 'Common': return 'bg-gradient-to-r from-rarity-common to-rarity-common/30'
    case 'Uncommon': return 'bg-gradient-to-r from-rarity-uncommon to-rarity-uncommon/30'
    case 'Rare': return 'bg-gradient-to-r from-rarity-rare to-rarity-rare/30'
    case 'VeryRare': return 'bg-gradient-to-r from-rarity-veryrare to-rarity-veryrare/30'
    case 'Legendary': return 'bg-gradient-to-r from-rarity-legendary to-rarity-legendary/30'
    case 'Story': return 'bg-gradient-to-r from-rarity-story to-rarity-story/30'
    default: return 'bg-gray-300'
  }
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>
