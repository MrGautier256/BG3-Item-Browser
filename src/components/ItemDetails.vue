<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="item" class="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>

        <!-- Modal -->
        <div class="relative w-full max-w-3xl bg-white dark:bg-bg3-dark-mid rounded-2xl shadow-2xl overflow-hidden animate-scale-in my-4">
          <!-- Rarity header -->
          <div class="h-2 w-full bg-gradient-to-r" :class="rarityGradient"></div>

          <!-- Close -->
          <button @click="$emit('close')" class="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-bg3-ink/80 hover:bg-white dark:hover:bg-bg3-ink shadow-md transition-colors text-lg">✕</button>

          <div class="p-6 md:p-8">
            <!-- Header -->
            <div class="flex items-start gap-4 mb-6">
              <div class="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 shadow-lg" :class="rarityBorder">
                <img v-if="!iconError" :src="iconSrc" :alt="name" class="w-full h-full object-cover bg-gray-100 dark:bg-bg3-dark" @error="iconError = true" />
                <div v-else class="w-full h-full bg-gray-100 dark:bg-bg3-dark flex items-center justify-center text-3xl">
                  {{ item.category === 'Weapon' ? '⚔️' : item.category === 'Armor' ? '🛡️' : '📦' }}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="font-display text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{{ name }}</h2>
                <div class="flex flex-wrap items-center gap-2 mt-2">
                  <span class="badge text-white" :class="rarityBg">{{ t(`rarities.${item.rarity || 'Common'}`) }}</span>
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{ t(`categories.${item.category}`) }}</span>
                  <span v-if="item.unique" class="badge bg-bg3-gold/20 text-bg3-gold-dark dark:text-bg3-gold">⭐ {{ t('item.unique') }}</span>
                </div>
                <!-- Action buttons -->
                <div class="flex gap-2 mt-3">
                  <button @click="$emit('toggle-favorite', item.id)" class="btn-ghost" :class="isFavorite ? 'text-red-500' : ''">
                    {{ isFavorite ? '❤️' : '🤍' }} {{ isFavorite ? t('item.removeFavorite') : t('item.addFavorite') }}
                  </button>
                  <button @click="$emit('toggle-compare', item.id)" class="btn-ghost" :class="isInCompare ? 'text-blue-500' : ''">
                    ⚖️ {{ isInCompare ? t('item.removeCompare') : t('item.addCompare') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div v-if="description" class="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-bg3-ink/30 border border-gray-100 dark:border-bg3-ink/50">
              <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{{ t('item.description') }}</h4>
              <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">{{ cleanText(description) }}</p>
            </div>

            <!-- Stats Grid -->
            <div class="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox v-if="item.weight" :label="t('item.weight')" :value="item.weight" icon="⚖️" />
              <StatBox v-if="item.value" :label="t('item.value')" :value="String(item.value)" icon="💰" />
              <StatBox v-if="item.charges" :label="t('item.charges')" :value="`${item.charges}/${item.max_charges || item.charges}`" icon="⚡" />
              <StatBox v-if="item.raw_stats?.ArmorClass" :label="t('item.armorClass')" :value="item.raw_stats.ArmorClass" icon="🛡️" />
              <StatBox v-if="item.raw_stats?.Slot" :label="t('item.slot')" :value="translateSlot(item.raw_stats.Slot)" icon="📍" />
              <StatBox v-if="item.proficiency_group" :label="t('item.proficiency')" :value="translateProficiency(item.proficiency_group)" icon="🎯" />
            </div>

            <!-- Weapon Damage -->
            <DetailSection v-if="weaponDamageEntries.length > 0" :title="t('item.weaponDamage')" icon="🗡️">
              <div class="space-y-2">
                <div v-for="(wd, i) in weaponDamageEntries" :key="i" class="flex items-center gap-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <span class="font-mono font-bold text-red-700 dark:text-red-300">{{ wd.bonus ? '+' : '' }}{{ wd.dice }}</span>
                  <span class="badge bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">{{ translateDamageType(wd.type) }}</span>
                  <span v-if="wd.qualifier" class="text-xs text-gray-500 dark:text-gray-400">({{ wd.qualifier }})</span>
                  <span v-if="wd.bonus" class="text-xs text-gray-500 dark:text-gray-400 italic">{{ locale === 'fr' ? "dégâts bonus propres à l'arme" : 'bonus weapon damage' }}</span>
                </div>
              </div>
            </DetailSection>

            <!-- Effects -->
            <DetailSection v-if="visibleEffects.length > 0" :title="t('item.effects')" icon="✨">
              <div class="space-y-2">
                <div v-for="(e, i) in visibleEffects" :key="i" class="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                  <p class="text-sm font-medium text-amber-800 dark:text-amber-300">{{ e }}</p>
                </div>
              </div>
            </DetailSection>

            <!-- Passives -->
            <DetailSection v-if="visiblePassives.length > 0" :title="t('item.passives')" icon="🔮">
              <div class="space-y-3">
                <div v-for="(p, i) in visiblePassives" :key="i" class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                  <div class="flex items-center gap-2 mb-1">
                    <img v-if="p.icon" :src="`./icons/${p.icon}.png`" class="w-6 h-6 rounded" @error="(e) => e.target.style.display='none'" />
                    <h5 class="font-semibold text-sm text-blue-800 dark:text-blue-300">{{ getLocalizedName(p.name) }}</h5>
                  </div>
                  <p class="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">{{ resolveParams(getLocalizedDesc(p.description), p.description_params, weaponContext) }}</p>
                  <p v-if="getLocalizedDesc(p.extra_description)" class="text-xs text-blue-600 dark:text-blue-300 mt-1 italic">{{ resolveParams(getLocalizedDesc(p.extra_description), p.extra_description_params, weaponContext) }}</p>
                  <!-- Boosts traduits -->
                  <div v-if="translatedBoosts(p.boosts).length > 0" class="mt-2 flex flex-wrap gap-1">
                    <span v-for="(b, bi) in translatedBoosts(p.boosts)" :key="bi" class="badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{{ b }}</span>
                  </div>
                </div>
              </div>
            </DetailSection>

            <!-- Spells -->
            <DetailSection v-if="item.spells_full && item.spells_full.length > 0" :title="t('item.spells')" icon="⚡">
              <div class="space-y-3">
                <div v-for="(s, i) in item.spells_full" :key="i" class="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                  <div class="flex items-center gap-2 mb-1">
                    <img v-if="s.icon" :src="`./icons/${s.icon}.png`" class="w-6 h-6 rounded" @error="(e) => e.target.style.display='none'" />
                    <h5 class="font-semibold text-sm text-purple-800 dark:text-purple-300">{{ getLocalizedName(s.name) }}</h5>
                    <span v-if="s.level" class="badge bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200">Nv. {{ s.level }}</span>
                    <span v-if="translateSpellSchool(s.spell_school)" class="badge bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">{{ translateSpellSchool(s.spell_school) }}</span>
                    <span v-if="s.cooldown" class="badge bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">{{ translateCooldown(s.cooldown) }}</span>
                  </div>
                  <p class="text-sm text-purple-700 dark:text-purple-200 leading-relaxed">{{ resolveParams(getLocalizedDesc(s.description), s.description_params, weaponContext) }}</p>
                  <p v-if="getLocalizedDesc(s.extra_description)" class="text-xs text-purple-600 dark:text-purple-300 mt-1 italic">{{ resolveParams(getLocalizedDesc(s.extra_description), s.extra_description_params, weaponContext) }}</p>
                  <!-- Damage from tooltip -->
                  <div v-if="s.tooltip?.damage_list?.length > 0" class="mt-2 flex flex-wrap gap-1">
                    <span v-for="(d, di) in s.tooltip.damage_list" :key="di" class="badge bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      {{ formatDamage(d, weaponContext) }}
                    </span>
                  </div>
                  <!-- Use costs -->
                  <div v-if="s.use_costs?.length > 0" class="mt-1">
                    <span class="text-xs text-purple-500 dark:text-purple-400">{{ t('item.useCost') }}: {{ s.use_costs.map(translateUseCost).join(', ') }}</span>
                  </div>
                  <!-- Container spells -->
                  <div v-if="s.container_spells?.length > 0" class="mt-2 pl-3 border-l-2 border-purple-200 dark:border-purple-700 space-y-2">
                    <p class="text-xs font-semibold text-purple-600 dark:text-purple-400">{{ t('item.containerSpells') }}:</p>
                    <div v-for="(cs, ci) in s.container_spells" :key="ci" class="text-xs text-purple-600 dark:text-purple-300">
                      <span class="font-medium">{{ getLocalizedName(cs.name) }}</span>
                      <span v-if="getLocalizedDesc(cs.description)" class="block mt-0.5 text-purple-500 dark:text-purple-400">{{ resolveParams(getLocalizedDesc(cs.description), cs.description_params, weaponContext) }}</span>
                      <div v-if="cs.tooltip?.damage_list?.length > 0" class="mt-1 flex flex-wrap gap-1">
                        <span v-for="(d, di) in cs.tooltip.damage_list" :key="di" class="badge bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">{{ formatDamage(d, weaponContext) }}</span>
                      </div>
                      <span v-if="cs.use_costs?.length > 0" class="block mt-0.5 text-purple-400 dark:text-purple-500">{{ t('item.useCost') }}: {{ cs.use_costs.map(translateUseCost).join(', ') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </DetailSection>

            <!-- Status on equip -->
            <DetailSection v-if="visibleStatuses.length > 0" :title="t('item.statuses')" icon="🔄">
              <div class="space-y-3">
                <div v-for="(s, i) in visibleStatuses" :key="i" class="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                  <h5 class="font-semibold text-sm text-green-800 dark:text-green-300">{{ getLocalizedName(s.name) }}</h5>
                  <p v-if="getLocalizedDesc(s.description)" class="text-sm text-green-700 dark:text-green-200 mt-1">{{ resolveParams(getLocalizedDesc(s.description), s.description_params, weaponContext) }}</p>
                  <div v-if="translatedBoosts(s.boosts).length > 0" class="mt-2 flex flex-wrap gap-1">
                    <span v-for="(b, bi) in translatedBoosts(s.boosts)" :key="bi" class="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">{{ b }}</span>
                  </div>
                </div>
              </div>
            </DetailSection>

            <!-- Interrupts -->
            <DetailSection v-if="item.interrupts_full && item.interrupts_full.length > 0" :title="t('item.interrupts')" icon="⚡">
              <div class="space-y-3">
                <div v-for="(int_, i) in item.interrupts_full" :key="i" class="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20">
                  <h5 class="font-semibold text-sm text-yellow-800 dark:text-yellow-300">{{ getLocalizedName(int_.name) }}</h5>
                  <p v-if="getLocalizedDesc(int_.description)" class="text-sm text-yellow-700 dark:text-yellow-200 mt-1">{{ resolveParams(getLocalizedDesc(int_.description), int_.description_params, weaponContext) }}</p>
                  <div v-if="translatedBoosts(int_.boosts).length > 0" class="mt-2 flex flex-wrap gap-1">
                    <span v-for="(b, bi) in translatedBoosts(int_.boosts)" :key="bi" class="badge bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">{{ b }}</span>
                  </div>
                </div>
              </div>
            </DetailSection>

            <!-- Raw Stats (collapsible) -->
            <div v-if="item.raw_stats" class="mt-4">
              <button @click="showRawStats = !showRawStats" class="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <span>{{ showRawStats ? '▾' : '▸' }}</span>
                {{ t('item.rawStats') }}
              </button>
              <div v-if="showRawStats" class="mt-2 p-3 rounded-xl bg-gray-50 dark:bg-bg3-ink/30 border border-gray-200 dark:border-bg3-ink/50 overflow-x-auto">
                <table class="w-full text-xs">
                  <tr v-for="(val, key) in filteredRawStats" :key="key" class="border-b border-gray-100 dark:border-bg3-ink/30 last:border-0">
                    <td class="py-1 pr-3 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ key }}</td>
                    <td class="py-1 text-gray-800 dark:text-gray-200 break-all">{{ val }}</td>
                  </tr>
                </table>
              </div>
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
import { useHelpers } from '../composables/useHelpers'
import DetailSection from './DetailSection.vue'
import StatBox from './StatBox.vue'

const { t, locale } = useI18n()
const {
  cleanText, translateProficiency, translateDamageType, translateSlot,
  translateSpellSchool, translateCooldown, translateUseCost,
  getLocalizedName, getLocalizedDesc, formatDamage, resolveParams,
  translateBoostLine, isHiddenBoost, formatEffect, isHiddenStatus, isHiddenPassive,
  getRarityStyle, getWeaponDamageEntries, getWeaponContext,
} = useHelpers()

const props = defineProps({
  item: Object,
  isFavorite: Boolean,
  isInCompare: Boolean,
})

defineEmits(['close', 'toggle-favorite', 'toggle-compare'])

const iconError = ref(false)
const showRawStats = ref(false)

const weaponContext = computed(() => getWeaponContext(props.item))
const weaponDamageEntries = computed(() => getWeaponDamageEntries(props.item))

const visibleEffects = computed(() => {
  return (props.item?.effects || [])
    .map(e => formatEffect(e))
    .filter(Boolean)
})

const visibleStatuses = computed(() => {
  return (props.item?.status_full || []).filter(s => !isHiddenStatus(s))
})

const visiblePassives = computed(() => {
  return (props.item?.passives_full || []).filter(p => !isHiddenPassive(p))
})

function translatedBoosts(boosts) {
  return (boosts || [])
    .filter(b => !isHiddenBoost(b))
    .map(b => translateBoostLine(b, weaponContext.value))
    .filter(Boolean)
}

const name = computed(() => props.item?.translations?.[locale.value]?.name || props.item?.translations?.en?.name || props.item?.title || props.item?.id || '')
const description = computed(() => props.item?.translations?.[locale.value]?.description || props.item?.translations?.en?.description || props.item?.description || '')
const iconSrc = computed(() => props.item?.icon_path || `./icons/${props.item?.icon}.png`)

const rarityStyle = computed(() => getRarityStyle(props.item?.rarity))
const rarityBg = computed(() => rarityStyle.value.bg)
const rarityBorder = computed(() => `${rarityStyle.value.border}/40`)
const rarityGradient = computed(() => rarityStyle.value.gradient)

const filteredRawStats = computed(() => {
  if (!props.item?.raw_stats) return {}
  const exclude = ['_source_path', '_path']
  const result = {}
  for (const [k, v] of Object.entries(props.item.raw_stats)) {
    if (!exclude.includes(k) && v !== '' && v !== null) result[k] = v
  }
  return result
})
</script>
