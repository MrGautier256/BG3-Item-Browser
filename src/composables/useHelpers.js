import { useI18n } from 'vue-i18n'

// Phrases toutes faites pour "X dégâts de ..." avec le bon accord en français
const DAMAGE_PHRASE_FR = {
  Bludgeoning: 'dégâts contondants',
  Piercing: 'dégâts perforants',
  Slashing: 'dégâts tranchants',
  Fire: 'dégâts de feu',
  Cold: 'dégâts de froid',
  Lightning: 'dégâts de foudre',
  Thunder: 'dégâts de tonnerre',
  Acid: "dégâts d'acide",
  Poison: 'dégâts de poison',
  Necrotic: 'dégâts nécrotiques',
  Radiant: 'dégâts radiants',
  Psychic: 'dégâts psychiques',
  Force: 'dégâts de force',
}

// Fonctions purement techniques/internes au moteur : jamais utile en JDR
const HIDDEN_BOOST_FUNCTIONS = new Set([
  'CriticalHit',
  'Tag',
  'HiddenDuringCinematic',
  'DetectDisturbancesBlock',
  'GameplayLight',
  'ActiveCharacterLight',
  'ObjectSize',
  'ScaleMultiplier',
  'AiArchetypeOverride',
  'FactionOverride',
  'DialogueBlock',
  'BlockVerbalComponent',
  'VoicebarkBlock',
  'SoundsBlocked',
  'Attribute',
  'SightRangeMaximum',
  'SightRangeOverride',
  'WeightCategory',
  'CanShootThrough',
  'CanWalkThrough',
  'ProjectileDeflect',
  'ActionResourcePreventReduction',
  'DownedStatus',
  'IgnoreLeaveAttackRange',
  'CannotHarmCauseEntity',
  'RedirectDamage',
  'UnlockInterrupt',
  'UnlockSpell',
  'UnlockSpellVariant',
])

const ACTION_RESOURCE_FR = {
  ActionPoint: 'action',
  BonusActionPoint: 'action bonus',
  ReactionActionPoint: 'réaction',
  Movement: 'de déplacement',
}

const WEAPON_PROPERTY_FR = {
  Magical: 'Magique',
  Finesse: 'Finesse',
  Twohanded: 'Deux mains',
  Light: 'Légère',
  Heavy: 'Lourde',
  Reach: 'Allonge',
  Thrown: 'Lancer',
  Ammo: 'Munitions',
  Versatile: 'Polyvalente',
  Dippable: 'Trempable',
  Melee: 'Mêlée',
  RangedWeapon: 'Arme à distance',
  DualWielding: 'Combat à deux armes',
  Unstowable: 'Ne peut être rangée',
  NonLethal: 'Non létale',
}

export function useHelpers() {
  const { t, locale } = useI18n()

  function cleanText(text) {
    if (!text) return ''
    return text
      .replace(/<LSTag[^>]*?>(.*?)<\/LSTag>/gi, '$1')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
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

  // Élision : "de Force" mais "d'Intelligence" / "d'Acrobaties"
  function withDe(word) {
    if (!word) return `de ${word}`
    return /^[aeiouhàâäéèêëîïôöùûü]/i.test(word) ? `d'${word}` : `de ${word}`
  }

  // "dégâts tranchants" / "dégâts de feu" avec le bon accord, contrairement à translateDamageType seul
  function damagePhrase(dmgType) {
    if (!dmgType) return 'dégâts'
    if (locale.value === 'fr' && DAMAGE_PHRASE_FR[dmgType]) return DAMAGE_PHRASE_FR[dmgType]
    return `${translateDamageType(dmgType)} damage`
  }

  function translateSlot(slot) {
    if (!slot) return slot
    const key = `slots.${slot}`
    const translated = t(key)
    return translated !== key ? translated : slot
  }

  function translateAbility(ability) {
    if (!ability) return ability
    const key = `abilities.${ability}`
    const translated = t(key)
    return translated !== key ? translated : ability
  }

  function translateSkill(skill) {
    if (!skill) return skill
    const key = `skills.${skill}`
    const translated = t(key)
    return translated !== key ? translated : skill
  }

  function translateSpellSchool(school) {
    if (!school || school === 'None') return ''
    const key = `spellSchools.${school}`
    const translated = t(key)
    return translated !== key ? translated : school
  }

  function translateCooldown(cooldown) {
    if (!cooldown) return ''
    const key = `cooldowns.${cooldown}`
    const translated = t(key)
    return translated !== key ? translated : cooldown
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

  // --- Résolution des jetons "arme" dans les formules de dégâts (sorts d'arme) ---

  function resolveWeaponDice(token, weaponContext) {
    const t = token.trim()
    if (/^-?\d+d\d+([+\-]\d+)?$/i.test(t) || /^-?\d+$/.test(t)) return t

    let m = t.match(/^(MainMeleeWeapon|MainRangedWeapon|MainWeapon)\/(\d+)$/i)
    if (m) {
      return weaponContext?.dice
        ? `moitié de ${weaponContext.dice}`
        : "moitié des dégâts de l'arme"
    }
    m = t.match(/^(MainMeleeWeapon|MainRangedWeapon|MainWeapon)\s*\+\s*ProficiencyBonus$/i)
    if (m) {
      return weaponContext?.dice
        ? `${weaponContext.dice} + bonus de maîtrise`
        : "dégâts de l'arme + bonus de maîtrise"
    }
    if (/^(MainMeleeWeapon|MainRangedWeapon|MainWeapon)$/i.test(t)) {
      return weaponContext?.dice || "dégâts de l'arme équipée"
    }
    if (/^(OffhandMeleeWeapon|OffhandRangedWeapon|OffhandWeapon)$/i.test(t)) {
      return "dégâts de l'arme secondaire"
    }
    if (/^ProficiencyBonus$/i.test(t)) return 'bonus de maîtrise'
    if (/^ImprovisedWeapon$/i.test(t)) return 'arme improvisée'
    if (/^UnarmedDamage$/i.test(t)) return 'dégâts à mains nues'

    return t
      .replace(/StrengthModifier/gi, 'mod. Force')
      .replace(/DexterityModifier/gi, 'mod. Dextérité')
      .replace(/ConstitutionModifier/gi, 'mod. Constitution')
      .replace(/IntelligenceModifier/gi, 'mod. Intelligence')
      .replace(/WisdomModifier/gi, 'mod. Sagesse')
      .replace(/CharismaModifier/gi, 'mod. Charisme')
      .replace(/UnarmedMeleeAbilityModifier/gi, 'mod. à mains nues')
      .replace(/SpellCastingAbilityModifier/gi, "mod. d'incantation")
      .replace(/ProficiencyBonus/gi, 'bonus de maîtrise')
  }

  function resolveWeaponDamageType(token, weaponContext) {
    const t = token.trim()
    if (/^(MainMeleeWeaponDamageType|MainWeaponDamageType|MainRangedWeaponDamageType)$/i.test(t)) {
      return weaponContext?.type ? translateDamageType(weaponContext.type) : "type de l'arme"
    }
    if (/^(OffhandWeaponDamageType|OffhandMeleeWeaponDamageType|OffhandRangedWeaponDamageType)$/i.test(t)) {
      return "type de l'arme secondaire"
    }
    return translateDamageType(t)
  }

  // Résout un jeton de type de dégâts vers sa clé brute BG3 (ex: MainMeleeWeaponDamageType -> "Slashing"),
  // pour pouvoir ensuite utiliser damagePhrase(). Renvoie null si non résolvable (ex: main secondaire).
  function resolveDamageTypeKey(token, weaponContext) {
    const t = (token || '').trim()
    if (/^(MainMeleeWeaponDamageType|MainWeaponDamageType|MainRangedWeaponDamageType)$/i.test(t)) {
      return weaponContext?.type || null
    }
    if (/^(OffhandWeaponDamageType|OffhandMeleeWeaponDamageType|OffhandRangedWeaponDamageType)$/i.test(t)) {
      return null
    }
    return t
  }

  // Découpe le contenu d'un appel "FuncName(...)" en respectant les parenthèses
  // imbriquées (ex: dés "max(DexterityModifier,StrengthModifier)"). Les arguments
  // superflus (UUID techniques, flags...) sont naturellement ignorés par l'appelant.
  function parseFunctorArgs(str, fnName) {
    const m = str.match(new RegExp(`^${fnName}\\((.*)\\)$`, 's'))
    if (!m) return null
    return splitArgs(m[1])
  }

  // Formate une entrée brute de fonction de dégâts/soins ("DealDamage(...)",
  // "RegainHitPoints(...)", "GainTemporaryHitPoints(...)") en texte lisible.
  // weaponContext (optionnel) = { dice, type } de l'arme porteuse, pour résoudre MainMeleeWeapon etc.
  function formatDamage(raw, weaponContext) {
    if (!raw) return raw
    const trimmed = raw.trim()

    let args = parseFunctorArgs(trimmed, 'DealDamage')
    if (args) {
      const dice = resolveWeaponDice(args[0], weaponContext)
      const typeKey = resolveDamageTypeKey(args[1], weaponContext)
      if (!typeKey) return `${dice} ${resolveWeaponDamageType(args[1] || '', weaponContext)}`.trim()
      const phrase = locale.value === 'fr' ? DAMAGE_PHRASE_FR[typeKey] : null
      return phrase ? `${dice} ${phrase}` : `${dice} ${translateDamageType(typeKey)}`.trim()
    }
    args = parseFunctorArgs(trimmed, 'RegainHitPoints')
    if (args) {
      const amount = resolveWeaponDice(args[0], weaponContext)
      return locale.value === 'fr' ? `${amount} points de vie` : `${amount} hit points`
    }
    args = parseFunctorArgs(trimmed, 'GainTemporaryHitPoints')
    if (args) {
      const amount = resolveWeaponDice(args[0], weaponContext)
      return locale.value === 'fr' ? `${amount} points de vie temporaires` : `${amount} temporary hit points`
    }
    return raw
  }

  // Formate un paramètre de description ([1], [2]...) : DealDamage/Distance/RegainHitPoints/...
  function formatDescriptionParam(param, weaponContext) {
    if (!param) return ''
    const trimmed = param.trim()
    const distance = trimmed.match(/^Distance\((-?[\d.]+)\)/)
    if (distance) return `${distance[1]} m`

    const formatted = formatDamage(trimmed, weaponContext)
    return formatted !== trimmed ? formatted : param
  }

  // Remplace les [1], [2]... d'un texte par leurs paramètres formatés
  function resolveParams(text, params, weaponContext) {
    if (!text) return text
    if (!params || !params.length) return text
    return text.replace(/\[(\d+)\]/g, (match, idxStr) => {
      const idx = parseInt(idxStr, 10) - 1
      const p = params[idx]
      return p !== undefined ? formatDescriptionParam(p, weaponContext) : match
    })
  }

  function translateUseCost(cost) {
    if (!cost) return cost
    const [key, amountStr] = cost.split(':')
    if (key === 'Movement') {
      const n = parseFloat(amountStr)
      return Number.isFinite(n) ? `${amountStr} m de déplacement` : 'Déplacement'
    }
    if (key === 'SpellSlotsGroup') return 'Emplacement de sort'
    const label = ACTION_RESOURCE_FR[key]
    const n = parseInt(amountStr, 10)
    if (label && Number.isFinite(n)) {
      if (key === 'BonusActionPoint') return `${n} action${n > 1 ? 's' : ''} bonus`
      return `${n} ${label}${n > 1 ? 's' : ''}`
    }
    return label || cost
  }

  // --- Parsing générique des appels "Fonction(arg1, arg2, ...)" ---

  function splitArgs(str) {
    const args = []
    let depth = 0
    let current = ''
    for (const ch of str) {
      if (ch === '(') depth++
      if (ch === ')') depth--
      if (ch === ',' && depth === 0) {
        args.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
    if (current.trim() !== '') args.push(current.trim())
    return args
  }

  function parseCall(str) {
    const m = str.match(/^([A-Za-z_]+)\s*\((.*)\)$/s)
    if (!m) return null
    return { name: m[1], args: splitArgs(m[2]) }
  }

  const CONDITION_FR = {
    'IsMeleeAttack()': 'en mêlée',
    'IsRangedAttack()': 'à distance',
    'IsMeleeAttack(context.Source)': 'en mêlée',
  }

  function isHiddenBoost(rawBoost) {
    if (!rawBoost) return true
    const inner = rawBoost.match(/^IF\s*\(.*?\):(.+)$/s)
    const call = parseCall((inner ? inner[1] : rawBoost).trim())
    if (!call) return false
    return HIDDEN_BOOST_FUNCTIONS.has(call.name)
  }

  // Traduit une ligne de boost/effet brut BG3 en texte FR lisible.
  // Retourne null si l'entrée est purement technique et doit être masquée.
  function translateBoostLine(rawBoost, weaponContext) {
    if (!rawBoost) return null

    let condLabel = ''
    let body = rawBoost.trim()
    const ifMatch = body.match(/^IF\s*\((.*?)\):(.+)$/s)
    if (ifMatch) {
      const cond = ifMatch[1].trim()
      condLabel = CONDITION_FR[cond] ? ` (${CONDITION_FR[cond]})` : ''
      body = ifMatch[2].trim()
    }

    const call = parseCall(body)
    if (!call) return body

    if (HIDDEN_BOOST_FUNCTIONS.has(call.name)) return null

    const { name, args } = call

    switch (name) {
      case 'Advantage': {
        if (args[0] === 'SavingThrow') return args[1]
          ? `Avantage aux jets de sauvegarde ${withDe(translateAbility(args[1]))}${condLabel}`
          : `Avantage à tous les jets de sauvegarde${condLabel}`
        if (args[0] === 'AllSavingThrows') return `Avantage à tous les jets de sauvegarde${condLabel}`
        if (args[0] === 'Skill') return `Avantage aux tests ${withDe(translateSkill(args[1]))}${condLabel}`
        if (args[0] === 'AttackTarget') return `Les attaques contre cette cible ont l'avantage${condLabel}`
        if (args[0] === 'AttackRoll') return `Avantage aux jets d'attaque${condLabel}`
        if (args[0] === 'Ability') return `Avantage aux tests ${withDe(translateAbility(args[1]))}${condLabel}`
        return `Avantage : ${args.join(', ')}${condLabel}`
      }
      case 'Disadvantage': {
        if (args[0] === 'SavingThrow') return args[1]
          ? `Désavantage aux jets de sauvegarde ${withDe(translateAbility(args[1]))}${condLabel}`
          : `Désavantage à tous les jets de sauvegarde${condLabel}`
        if (args[0] === 'AllSavingThrows') return `Désavantage à tous les jets de sauvegarde${condLabel}`
        if (args[0] === 'Skill') return `Désavantage aux tests ${withDe(translateSkill(args[1]))}${condLabel}`
        if (args[0] === 'AttackTarget') return `Les attaques contre cette cible ont un désavantage${condLabel}`
        if (args[0] === 'AttackRoll') return `Désavantage aux jets d'attaque${condLabel}`
        if (args[0] === 'Ability') return `Désavantage aux tests ${withDe(translateAbility(args[1]))}${condLabel}`
        return `Désavantage : ${args.join(', ')}${condLabel}`
      }
      case 'Resistance': {
        const level = args[1] === 'Immune' ? 'Immunité' : args[1] === 'Vulnerable' ? 'Vulnérabilité' : 'Résistance'
        return `${level} aux ${damagePhrase(args[0])}${condLabel}`
      }
      case 'WeaponDamageResistance':
        return `Résistance d'arme aux ${damagePhrase(args[0])}${condLabel}`
      case 'DamageReduction': {
        const type = args[0] === 'All' ? 'tous les dégâts' : damagePhrase(args[0])
        return `Réduction des ${type} : ${args[2]}${condLabel}`
      }
      case 'IgnoreResistance':
        return `Ignore la résistance aux ${damagePhrase(args[0])}${condLabel}`
      case 'StatusImmunity':
        return `Immunité : ${prettifyStatusId(args[0])}${condLabel}`
      case 'ActionResourceBlock': {
        const label = ACTION_RESOURCE_FR[args[0]] || args[0]
        return `Bloque : ${label}${condLabel}`
      }
      case 'ActionResource': {
        const label = ACTION_RESOURCE_FR[args[0]] || args[0]
        const n = parseFloat(args[1])
        const sign = n > 0 ? '+' : ''
        return `${sign}${args[1]} ${label}${condLabel}`
      }
      case 'ActionResourceMultiplier': {
        const label = ACTION_RESOURCE_FR[args[0]] || args[0]
        const mult = parseFloat(args[1]) / 100
        return `${label.charAt(0).toUpperCase()}${label.slice(1)} x${mult}${condLabel}`
      }
      case 'BlockAbilityModifierFromAC':
        return `Perd le bonus ${withDe(translateAbility(args[0]))} à la Classe d'Armure${condLabel}`
      case 'AC': {
        const n = parseInt(args[0], 10)
        return `${n >= 0 ? '+' : ''}${n} Classe d'Armure${condLabel}`
      }
      case 'ACOverrideFormula': {
        if (args[2]) return `Classe d'armure : ${args[0]} + modificateur ${withDe(translateAbility(args[2]))}${condLabel}`
        return `Classe d'armure fixe : ${args[0]}${condLabel}`
      }
      case 'Initiative':
        return `${parseInt(args[0], 10) >= 0 ? '+' : ''}${args[0]} à l'initiative${condLabel}`
      case 'SpellSaveDC':
        return `${parseInt(args[0], 10) >= 0 ? '+' : ''}${args[0]} au DD des sorts${condLabel}`
      case 'RollBonus': {
        const n = args[1]
        const sign = parseInt(n, 10) >= 0 ? '+' : ''
        if (args[0] === 'SavingThrow') return args[2]
          ? `${sign}${n} aux jets de sauvegarde ${withDe(translateAbility(args[2]))}${condLabel}`
          : `${sign}${n} à tous les jets de sauvegarde${condLabel}`
        if (args[0] === 'SkillCheck') return `${sign}${n} aux tests ${withDe(translateSkill(args[2]))}${condLabel}`
        if (args[0] === 'MeleeSpellAttack') return `${sign}${n} aux jets d'attaque de sort au corps à corps${condLabel}`
        if (args[0] === 'RangedSpellAttack') return `${sign}${n} aux jets d'attaque de sort à distance${condLabel}`
        if (args[0] === 'MeleeWeaponAttack') return `${sign}${n} aux jets d'attaque d'arme au corps à corps${condLabel}`
        if (args[0] === 'RangedWeaponAttack') return `${sign}${n} aux jets d'attaque d'arme à distance${condLabel}`
        return `${sign}${n} : ${args[0]}${condLabel}`
      }
      case 'CharacterWeaponDamage':
      case 'WeaponDamage':
        return `+${args[0]} ${damagePhrase(args[1])} supplémentaires à l'arme${condLabel}`
      case 'CharacterUnarmedDamage':
        return `+${args[0]} ${damagePhrase(args[1])} supplémentaires à mains nues${condLabel}`
      case 'WeaponEnchantment':
        return `+${args[0]} à l'arme (enchantement)${condLabel}`
      case 'WeaponProperty':
        return `Propriété : ${WEAPON_PROPERTY_FR[args[0]] || args[0]}${condLabel}`
      case 'Ability': {
        const n = parseInt(args[1], 10)
        const sign = n >= 0 ? '+' : ''
        const max = args[2] ? ` (max ${args[2]})` : ''
        return `${sign}${args[1]} ${translateAbility(args[0])}${max}${condLabel}`
      }
      case 'AbilityOverrideMinimum':
        return `${translateAbility(args[0])} minimum : ${args[1]}${condLabel}`
      case 'Skill': {
        if (/Modifier$/.test(args[1])) {
          return `${translateSkill(args[0])} basé(e) sur ${resolveWeaponDice(args[1])}${condLabel}`
        }
        const n = parseInt(args[1], 10)
        return `${n >= 0 ? '+' : ''}${args[1]} ${translateSkill(args[0])}${condLabel}`
      }
      case 'AbilityFailedSavingThrow':
        return `Échoue automatiquement aux jets de sauvegarde ${withDe(translateAbility(args[0]))}${condLabel}`
      case 'Proficiency':
        return `Maîtrise : ${translateProficiency(args[0])}${condLabel}`
      case 'CannotBeDisarmed':
        return `Ne peut pas être désarmé${condLabel}`
      case 'Invulnerable':
        return `Invulnérable${condLabel}`
      case 'Invisibility':
        return `Invisibilité${condLabel}`
      case 'ItemReturnToOwner':
        return `Revient à son propriétaire${condLabel}`
      case 'FallDamageMultiplier':
        return `Dégâts de chute x${args[0]}${condLabel}`
      case 'IgnoreFallDamage':
        return `Immunisé aux dégâts de chute${condLabel}`
      case 'ReduceCriticalAttackThreshold':
        return `Critique à partir de ${20 - parseInt(args[0], 10)}${condLabel}`
      case 'JumpMaxDistanceBonus':
        return `+${args[0]} à la distance de saut${condLabel}`
      case 'JumpMaxDistanceMultiplier':
        return `Distance de saut x${args[0]}${condLabel}`
      case 'IncreaseMaxHP':
        return `+${args[0]} points de vie maximum${condLabel}`
      case 'TemporaryHP':
        return `${args[0]} points de vie temporaires${condLabel}`
      case 'BlockRegainHP':
        return `Empêche la récupération de points de vie${condLabel}`
      case 'MaximizeHealing':
        return `Soins maximisés${condLabel}`
      case 'DarkvisionRange':
      case 'DarkvisionRangeMin':
        return `Vision dans le noir (${args[0]} m)${condLabel}`
      case 'CarryCapacityMultiplier':
        return `Capacité de transport x${args[0]}${condLabel}`
      case 'MovementSpeedLimit':
        return `Vitesse de déplacement limitée à ${args[0]}${condLabel}`
      case 'SourceAdvantageOnAttack':
        return `Avantage aux jets d'attaque${condLabel}`
      case 'TwoWeaponFighting':
        return `Combat à deux armes sans pénalité${condLabel}`
      case 'BlockSpellCast':
        return `Empêche de lancer des sorts${condLabel}`
      case 'Reroll':
        return `Relance les dés de ${args[0] === 'Damage' ? 'dégâts' : args[0]} de ${args[1]} ou moins${condLabel}`
      case 'IgnoreSurfaceCover':
        return `Ignore la couverture offerte par le décor${condLabel}`
      case 'EntityThrowDamage':
        return `+${args[0]} dégâts en la lançant${condLabel}`
      case 'ProficiencyBonus':
        if (args[0] === 'SavingThrow') return `+ bonus de maîtrise aux jets de sauvegarde ${withDe(translateAbility(args[1]))}${condLabel}`
        return `+ bonus de maîtrise${condLabel}`
      default:
        return `${name}${args.length ? ' : ' + args.join(', ') : ''}${condLabel}`
    }
  }

  const STATUS_LABEL_FR = {
    SG_Charmed: 'Charme',
    SG_Frightened: 'Peur',
    SG_Blinded: 'Aveuglement',
    SG_Fleeing: 'Fuite',
    SG_Condition: "altérations d'état",
    SG_Stunned: 'Étourdissement',
    SG_Poisoned: 'Poison',
    SG_Sleeping: 'Sommeil',
    SG_Paralyzed: 'Paralysie',
    SG_Restrained: 'Entrave',
    SG_Prone: 'À terre',
    SG_Possessed: 'Possession',
    SG_Disease: 'Maladie',
    SG_Cursed: 'Malédiction',
    SG_DifficultTerrain: 'Terrain difficile',
    STUNNED: 'Étourdissement',
    DAZED: 'Hébétement',
    BLINDED: 'Aveuglement',
    BLINDED_DARKNESS: 'Aveuglement (ténèbres)',
    CHARMED: 'Charme',
    FRIGHTENED: 'Peur',
    PRONE: 'À terre',
    PARALYZED: 'Paralysie',
    SLEEP: 'Sommeil',
    BURNING: 'Brûlure',
    WILD_MAGIC_BURNING: 'Brûlure (magie sauvage)',
    BLEEDING: 'Hémorragie',
    ENSNARED: 'Entravé (lianes)',
    ENSNARED_VINES: 'Entravé (lianes)',
    ENSNARING_STRIKE: 'Entravé (lianes)',
    ENSNARING_STRIKE_2: 'Entravé (lianes)',
    HIDEOUS_LAUGHTER: 'Fou rire incontrôlable',
    CRIPPLED: 'Estropié',
    HAMSTRING: 'Estropié',
    PIN_DOWN: 'Cloué au sol',
    WEB: 'Toile',
    DIFFICULT_TERRAIN: 'Terrain difficile',
    DIFFICULT_TERRAIN_WEB: 'Toile (terrain difficile)',
    DIFFICULT_TERRAIN_VINES: 'Lianes (terrain difficile)',
    DIFFICULT_TERRAIN_MUD: 'Boue (terrain difficile)',
    DIFFICULT_TERRAIN_OVERGROWTH: 'Végétation (terrain difficile)',
    DIFFICULT_TERRAIN_LAVA: 'Lave (terrain difficile)',
    PRONE_ICE: 'Glace glissante',
    PRONE_GREASE: 'Graisse glissante',
    SHOCKED_SURFACE: 'Surface électrifiée',
  }

  function prettifyStatusId(id) {
    if (!id) return ''
    if (STATUS_LABEL_FR[id]) return STATUS_LABEL_FR[id]
    return id.replace(/^SG_/, '').replace(/_/g, ' ').toLowerCase()
      .replace(/^\w/, c => c.toUpperCase())
  }

  // Un effet est masqué si : c'est un simple déblocage de sort (déjà listé dans spells_full),
  // ou si sa ligne brute correspond à une fonction purement technique.
  function formatEffect(effect) {
    if (!effect) return null
    if (effect.type === 'unlock_spell') return null
    const label = translateBoostLine(effect.raw || effect.label)
    return label
  }

  // Statuts techniques internes au moteur (trackers invisibles), jamais affichés
  function isHiddenStatus(status) {
    if (!status) return true
    const nameEn = status?.name?.en || ''
    const id = status?.id || ''
    const flags = status?.raw?.StatusPropertyFlags || ''
    if (nameEn.includes('%%%')) return true
    if (id.includes('_TECHNICAL')) return true
    if (flags.includes('DisableOverhead') && flags.includes('DisableCombatlog') && flags.includes('DisablePortraitIndicator')) return true
    return false
  }

  // Passifs techniques internes (trackers de cooldown/ressource invisibles), jamais affichés
  function isHiddenPassive(passive) {
    if (!passive) return true
    const nameEn = passive?.name?.en || ''
    const id = passive?.id || ''
    if (nameEn.includes('%%%')) return true
    if (id.includes('_TECHNICAL')) return true
    return false
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

  // Renvoie l'entrée de dégâts propre à l'arme elle-même (source_type === 'weapon')
  // Renvoie les dégâts propres à l'arme, enrichis d'un qualificatif expliquant
  // pourquoi plusieurs lignes peuvent apparaître : "à une main" / "à deux mains"
  // pour les armes polyvalentes (VersatileDamage), ou "bonus" pour les dégâts
  // additionnels propres à l'arme (ex: enchantement thématique conditionnel).
  function getWeaponDamageEntries(item) {
    const entries = (item?.weapon_damage || []).filter(wd => wd.source_type === 'weapon')
    const hasVersatile = entries.some(e => e.field === 'VersatileDamage')
    const oneHand = locale.value === 'fr' ? 'à une main' : 'one-handed'
    const twoHand = locale.value === 'fr' ? 'à deux mains' : 'two-handed'
    return entries.map(e => {
      let qualifier = ''
      let bonus = false
      if (e.field === 'VersatileDamage') qualifier = twoHand
      else if (e.field === 'Damage') qualifier = hasVersatile ? oneHand : ''
      else bonus = true
      return { ...e, qualifier, bonus }
    })
  }

  function getWeaponContext(item) {
    const entries = getWeaponDamageEntries(item)
    if (!entries.length) return null
    const base = entries.find(e => e.field === 'Damage') || entries[0]
    return { dice: base.dice, type: base.type }
  }

  return {
    cleanText,
    translateProficiency,
    translateDamageType,
    translateSlot,
    translateAbility,
    translateSkill,
    translateSpellSchool,
    translateCooldown,
    translateUseCost,
    getLocalizedName,
    getLocalizedDesc,
    formatDamage,
    formatDescriptionParam,
    resolveParams,
    translateBoostLine,
    isHiddenBoost,
    formatEffect,
    isHiddenStatus,
    isHiddenPassive,
    getRarityStyle,
    getWeaponDamageEntries,
    getWeaponContext,
  }
}
