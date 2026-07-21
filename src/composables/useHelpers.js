import { useI18n } from 'vue-i18n'

export function useHelpers() {
  const { t, locale } = useI18n()

  function cleanText(text) {
    if (!text) return ''
    return text
      .replace(/<LSTag[^>]*?>(.*?)<\/LSTag>/gi, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/\[(\d+)\]/g, '[$1]')
  }

  function translateProficiency(profStr) {
    if (!profStr) return ''
    return profStr.split(';').map(p => {
      const key = `proficiencies.${p}`
      const translated = t(key)
      return translated !== key ? translated : p
    }).join(' / ')
  }

  function translateDamageType(dmgType) {
    if (!dmgType) return dmgType
    const key = `damageTypes.${dmgType}`
    const translated = t(key)
    return translated !== key ? translated : dmgType
  }

  function translateSlot(slot) {
    if (!slot) return slot
    const key = `slots.${slot}`
    const translated = t(key)
    return translated !== key ? translated : slot
  }

  function getLocalizedName(obj) {
    if (!obj) return ''
    if (typeof obj === 'string') return obj
    return obj[locale.value] || obj.en || obj.fr || ''
  }

  function getLocalizedDesc(obj) {
    if (!obj) return ''
    if (typeof obj === 'string') return cleanText(obj)
    const raw = obj[locale.value] || obj.en || obj.fr || ''
    return cleanText(raw)
  }

  function formatDamage(damageStr) {
    if (!damageStr) return damageStr
    // Parse DealDamage(XdY+Z, Type) patterns
    const match = damageStr.match(/DealDamage\(([^,]+),\s*(\w+)/)
    if (match) {
      return `${match[1]} ${translateDamageType(match[2])}`
    }
    return damageStr
  }

  const RARITY_COLORS = {
    Common: { bg: 'bg-rarity-common', text: 'text-rarity-common', border: 'border-rarity-common', dot: '#9ca3af', gradient: 'from-rarity-common/60 to-rarity-common/20' },
    Uncommon: { bg: 'bg-rarity-uncommon', text: 'text-rarity-uncommon', border: 'border-rarity-uncommon', dot: '#22c55e', gradient: 'from-rarity-uncommon/60 to-rarity-uncommon/20' },
    Rare: { bg: 'bg-rarity-rare', text: 'text-rarity-rare', border: 'border-rarity-rare', dot: '#3b82f6', gradient: 'from-rarity-rare/60 to-rarity-rare/20' },
    VeryRare: { bg: 'bg-rarity-veryrare', text: 'text-rarity-veryrare', border: 'border-rarity-veryrare', dot: '#a855f7', gradient: 'from-rarity-veryrare/60 to-rarity-veryrare/20' },
    Legendary: { bg: 'bg-rarity-legendary', text: 'text-rarity-legendary', border: 'border-rarity-legendary', dot: '#f59e0b', gradient: 'from-rarity-legendary/60 to-rarity-legendary/20' },
    Story: { bg: 'bg-rarity-story', text: 'text-rarity-story', border: 'border-rarity-story', dot: '#ec4899', gradient: 'from-rarity-story/60 to-rarity-story/20' },
  }

  function getRarityStyle(rarity) {
    return RARITY_COLORS[rarity] || RARITY_COLORS.Common
  }

  return {
    cleanText,
    translateProficiency,
    translateDamageType,
    translateSlot,
    getLocalizedName,
    getLocalizedDesc,
    formatDamage,
    getRarityStyle,
  }
}
