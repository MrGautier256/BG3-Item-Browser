<template>
  <div class="animate-fade-in">
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-display text-xl font-bold text-gray-900 dark:text-gray-100">
        ⚖️ {{ t('compare.title') }}
      </h2>
      <button v-if="items.length > 0" @click="$emit('clear')" class="btn-ghost text-red-500">
        🗑️ {{ t('compare.removeAll') }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="items.length === 0" class="flex flex-col items-center justify-center py-20 gap-4">
      <span class="text-6xl opacity-30">⚖️</span>
      <p class="text-gray-500 dark:text-gray-400 font-medium text-lg text-center">{{ t('compare.noItems') }}</p>
    </div>

    <!-- Comparison table -->
    <div v-else class="overflow-x-auto">
      <div class="inline-flex gap-4 min-w-full pb-4">
        <div v-for="item in items" :key="item.id" class="w-72 flex-shrink-0">
          <div class="card overflow-hidden h-full">
            <!-- Rarity accent -->
            <div class="h-1.5 w-full bg-gradient-to-r" :class="getRarityGradient(item.rarity)"></div>
            <div class="p-4">
              <!-- Header -->
              <div class="flex items-start gap-3 mb-3">
                <div class="w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0" :class="getRarityBorder(item.rarity)">
                  <img :src="`./icons/${item.icon}.png`" :alt="getName(item)" class="w-full h-full object-cover bg-gray-100 dark:bg-bg3-dark"
                    @error="(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML = item.category === 'Weapon' ? '⚔️' : '🛡️' }" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-display font-semibold text-sm truncate cursor-pointer hover:text-bg3-gold transition-colors" @click="$emit('select', item)">
                    {{ getName(item) }}
                  </h3>
                  <span class="badge text-white text-[10px]" :class="getRarityBg(item.rarity)">
                    {{ t(`rarities.${item.rarity || 'Common'}`) }}
                  </span>
                </div>
                <button @click="$emit('remove', item.id)" class="text-gray-400 hover:text-red-500 transition-colors p-1">✕</button>
              </div>

              <!-- Stats -->
              <div class="space-y-2 text-sm">
                <CompareRow :label="t('item.category')" :value="t(`categories.${item.category}`)" />
                <CompareRow v-if="item.raw_stats?.Slot" :label="t('item.slot')" :value="translateSlot(item.raw_stats.Slot)" />
                <CompareRow v-if="item.weight" :label="t('item.weight')" :value="item.weight" />
                <CompareRow v-if="item.value" :label="t('item.value')" :value="String(item.value)" />
                <CompareRow v-if="item.raw_stats?.ArmorClass" :label="t('item.armorClass')" :value="item.raw_stats.ArmorClass" />
                <CompareRow v-if="item.proficiency_group" :label="t('item.proficiency')" :value="translateProficiency(item.proficiency_group)" />

                <!-- Weapon Damage -->
                <div v-if="getWeaponDamageEntries(item).length > 0">
                  <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{{ t('item.weaponDamage') }}</p>
                  <div v-for="(wd, i) in getWeaponDamageEntries(item)" :key="i" class="flex items-center gap-1">
                    <span class="font-mono text-xs font-bold text-red-600 dark:text-red-400">{{ wd.bonus ? '+' : '' }}{{ wd.dice }}</span>
                    <span class="text-xs text-gray-500">{{ translateDamageType(wd.type) }}</span>
                    <span v-if="wd.qualifier" class="text-[10px] text-gray-400">({{ wd.qualifier }})</span>
                  </div>
                </div>

                <!-- Passives -->
                <div v-if="visiblePassives(item).length > 0">
                  <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{{ t('item.passives') }}</p>
                  <p v-for="(p, i) in visiblePassives(item)" :key="i" class="text-xs text-blue-600 dark:text-blue-400">
                    • {{ getLocalizedName(p.name) }}
                  </p>
                </div>

                <!-- Spells -->
                <div v-if="item.spells_full?.length > 0">
                  <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{{ t('item.spells') }}</p>
                  <p v-for="(s, i) in item.spells_full" :key="i" class="text-xs text-purple-600 dark:text-purple-400">
                    ✨ {{ getLocalizedName(s.name) }}
                  </p>
                </div>

                <!-- Effects -->
                <div v-if="visibleEffects(item).length > 0">
                  <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{{ t('item.effects') }}</p>
                  <p v-for="(e, i) in visibleEffects(item)" :key="i" class="text-xs text-amber-600 dark:text-amber-400">
                    {{ e }}
                  </p>
                </div>

                <!-- Charges -->
                <CompareRow v-if="item.charges" :label="t('item.charges')" :value="`${item.charges}/${item.max_charges || item.charges}`" />
                <CompareRow v-if="item.unique" :label="t('item.unique')" :value="t('item.yes')" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useHelpers } from '../composables/useHelpers'
import CompareRow from './CompareRow.vue'

const { t, locale } = useI18n()
const {
  translateProficiency, translateDamageType, translateSlot, getLocalizedName, getRarityStyle,
  getWeaponDamageEntries, formatEffect, isHiddenPassive,
} = useHelpers()

defineProps({
  items: { type: Array, default: () => [] },
})

defineEmits(['remove', 'clear', 'select'])

function getName(item) {
  return item.translations?.[locale.value]?.name || item.translations?.en?.name || item.title || item.id
}

function visibleEffects(item) {
  return (item.effects || []).map(e => formatEffect(e)).filter(Boolean)
}

function visiblePassives(item) {
  return (item.passives_full || []).filter(p => !isHiddenPassive(p))
}

function getRarityGradient(rarity) { return getRarityStyle(rarity).gradient }
function getRarityBorder(rarity) { return `${getRarityStyle(rarity).border}/40` }
function getRarityBg(rarity) { return getRarityStyle(rarity).bg }
</script>
