<template>
  <div
    class="group relative card hover:border-bg3-gold/50 dark:hover:border-bg3-gold/40 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in"
    @click="$emit('select', item)"
  >
    <!-- Rarity top accent -->
    <div class="h-1 w-full bg-gradient-to-r" :class="rarityGradient"></div>

    <div class="p-4">
      <!-- Top row: icon + info -->
      <div class="flex items-start gap-3">
        <!-- Icon -->
        <div class="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors" :class="rarityBorder">
          <img
            v-if="!iconError"
            :src="iconSrc"
            :alt="name"
            class="w-full h-full object-cover bg-gray-100 dark:bg-bg3-dark"
            @error="iconError = true"
            loading="lazy"
          />
          <div v-else class="w-full h-full bg-gray-100 dark:bg-bg3-dark flex items-center justify-center text-2xl">
            {{ item.category === 'Weapon' ? '⚔️' : item.category === 'Armor' ? '🛡️' : '📦' }}
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <h3 class="font-display font-semibold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-bg3-gold-dark dark:group-hover:text-bg3-gold transition-colors">
            {{ name }}
          </h3>
          <span class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full text-white" :class="rarityBg">
            {{ t(`rarities.${item.rarity || 'Common'}`) }}
          </span>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {{ t(`categories.${item.category}`) }}
            <span v-if="slot"> · {{ translateSlot(slot) }}</span>
          </p>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-col gap-1 flex-shrink-0">
          <button
            @click.stop="$emit('toggle-favorite', item.id)"
            class="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            :title="isFavorite ? t('item.removeFavorite') : t('item.addFavorite')"
          >
            <span :class="isFavorite ? 'opacity-100' : 'opacity-30 group-hover:opacity-60'" class="text-lg transition-opacity">❤️</span>
          </button>
          <button
            @click.stop="$emit('toggle-compare', item.id)"
            class="p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            :title="isInCompare ? t('item.removeCompare') : t('item.addCompare')"
          >
            <span :class="isInCompare ? 'opacity-100' : 'opacity-30 group-hover:opacity-60'" class="text-lg transition-opacity">⚖️</span>
          </button>
        </div>
      </div>

      <!-- Weapon damage -->
      <div v-if="item.weapon_damage && item.weapon_damage.length > 0" class="mt-2 flex flex-wrap gap-1">
        <span v-for="(wd, i) in item.weapon_damage" :key="i"
          class="badge bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
          🗡️ {{ wd.damage }} {{ translateDamageType(wd.damage_type) }}
        </span>
      </div>

      <!-- Description preview -->
      <p v-if="description" class="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
        {{ cleanText(description) }}
      </p>

      <!-- Tags preview -->
      <div v-if="previewTags.length > 0" class="mt-2 flex flex-wrap gap-1">
        <span v-for="(tag, i) in previewTags.slice(0, 3)" :key="i"
          class="badge bg-bg3-gold/10 dark:bg-bg3-gold/20 text-bg3-gold-dark dark:text-bg3-gold">
          {{ tag }}
        </span>
        <span v-if="previewTags.length > 3"
          class="badge bg-gray-100 dark:bg-bg3-ink/50 text-gray-500 dark:text-gray-400">
          +{{ previewTags.length - 3 }}
        </span>
      </div>

      <!-- Bottom info -->
      <div class="mt-3 pt-2 border-t border-gray-100 dark:border-bg3-ink/30 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
        <div class="flex items-center gap-2">
          <span v-if="item.unique" class="flex items-center gap-0.5 text-bg3-gold">⭐ {{ t('item.unique') }}</span>
          <span v-if="item.weight">⚖️ {{ item.weight }}</span>
          <span v-if="item.charges">⚡ {{ item.charges }}/{{ item.max_charges || item.charges }}</span>
        </div>
        <span v-if="proficiencyLabel" class="text-right truncate max-w-[120px]">{{ proficiencyLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHelpers } from '../composables/useHelpers'

const { t, locale } = useI18n()
const { cleanText, translateProficiency, translateDamageType, translateSlot, getLocalizedName, getRarityStyle } = useHelpers()

const props = defineProps({
  item: { type: Object, required: true },
  isFavorite: Boolean,
  isInCompare: Boolean,
})

defineEmits(['select', 'toggle-favorite', 'toggle-compare'])

const iconError = ref(false)

const name = computed(() => props.item.translations?.[locale.value]?.name || props.item.translations?.en?.name || props.item.title || props.item.id)
const description = computed(() => props.item.translations?.[locale.value]?.description || props.item.translations?.en?.description || props.item.description || '')
const iconSrc = computed(() => props.item.icon_path || `./icons/${props.item.icon}.png`)
const slot = computed(() => props.item.raw_stats?.Slot || null)

const proficiencyLabel = computed(() => {
  if (!props.item.proficiency_group) return ''
  return translateProficiency(props.item.proficiency_group)
})

const rarityStyle = computed(() => getRarityStyle(props.item.rarity))
const rarityBg = computed(() => rarityStyle.value.bg)
const rarityBorder = computed(() => `${rarityStyle.value.border}/40`)
const rarityGradient = computed(() => rarityStyle.value.gradient)

const previewTags = computed(() => {
  const tags = []
  const lang = locale.value
  if (props.item.passives_full) {
    props.item.passives_full.forEach(p => {
      const n = p.name?.[lang] || p.name?.en || p.id
      if (n) tags.push(n)
    })
  }
  if (props.item.spells_full) {
    props.item.spells_full.forEach(s => {
      const n = s.name?.[lang] || s.name?.en || s.id
      if (n) tags.push('✨ ' + n)
    })
  }
  if (props.item.effects) {
    props.item.effects.forEach(e => {
      if (e.label) tags.push(e.label)
    })
  }
  return tags
})
</script>
