import { jsPDF } from 'jspdf'

const RARITY_COLORS = {
  Common: { r: 156, g: 163, b: 175 },
  Uncommon: { r: 34, g: 197, b: 94 },
  Rare: { r: 59, g: 130, b: 246 },
  VeryRare: { r: 168, g: 85, b: 247 },
  Legendary: { r: 245, g: 158, b: 11 },
  Story: { r: 236, g: 72, b: 153 },
}

const RARITY_LABELS = {
  en: { Common: 'Common', Uncommon: 'Uncommon', Rare: 'Rare', VeryRare: 'Very Rare', Legendary: 'Legendary', Story: 'Story' },
  fr: { Common: 'Commun', Uncommon: 'Peu commun', Rare: 'Rare', VeryRare: 'Très rare', Legendary: 'Légendaire', Story: 'Histoire' },
}

function cleanLSTags(text) {
  if (!text) return ''
  return text.replace(/<LSTag[^>]*?>(.*?)<\/LSTag>/gi, '$1').replace(/<[^>]+>/g, '')
}

function fillDescriptionParams(text, params) {
  if (!text || !params || params.length === 0) return text
  let result = text
  params.forEach((p, i) => {
    result = result.replace(`[${i + 1}]`, p)
  })
  return result
}

export function usePDF() {

  async function exportItemPDF(item, locale = 'en') {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [100, 150] })

    const name = item.translations?.[locale]?.name || item.translations?.en?.name || item.title || item.id
    const description = item.translations?.[locale]?.description || item.translations?.en?.description || item.description || ''
    const rarityColor = RARITY_COLORS[item.rarity] || RARITY_COLORS.Common
    const rarityLabel = RARITY_LABELS[locale]?.[item.rarity] || item.rarity || 'Unknown'
    const categoryLabel = item.category || ''

    // Background
    doc.setFillColor(26, 26, 46)
    doc.rect(0, 0, 100, 150, 'F')

    // Border
    doc.setDrawColor(200, 168, 78)
    doc.setLineWidth(1)
    doc.rect(3, 3, 94, 144)
    doc.setLineWidth(0.3)
    doc.rect(5, 5, 90, 140)

    // Inner decorative line
    doc.setDrawColor(200, 168, 78, 0.5)
    doc.setLineWidth(0.15)
    doc.rect(7, 7, 86, 136)

    // Title area
    doc.setFillColor(200, 168, 78)
    doc.rect(10, 10, 80, 12, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(26, 26, 46)
    const titleLines = doc.splitTextToSize(name, 74)
    const titleY = titleLines.length > 1 ? 14 : 17
    doc.text(titleLines, 50, titleY, { align: 'center' })

    // Rarity badge
    let y = 26
    doc.setFillColor(rarityColor.r, rarityColor.g, rarityColor.b)
    const badgeWidth = doc.getTextWidth(rarityLabel) + 8
    doc.roundedRect(50 - badgeWidth / 2, y, badgeWidth, 7, 1.5, 1.5, 'F')
    doc.setFontSize(8)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text(rarityLabel, 50, y + 5, { align: 'center' })

    y += 10

    // Category
    doc.setFontSize(7)
    doc.setTextColor(200, 168, 78)
    doc.setFont('helvetica', 'normal')
    doc.text(categoryLabel, 50, y + 3, { align: 'center' })
    y += 7

    // Separator
    doc.setDrawColor(200, 168, 78)
    doc.setLineWidth(0.3)
    doc.line(15, y, 85, y)
    y += 4

    // Icon placeholder
    if (item.icon) {
      doc.setFillColor(40, 40, 65)
      doc.roundedRect(35, y, 30, 30, 2, 2, 'F')
      doc.setDrawColor(200, 168, 78)
      doc.setLineWidth(0.3)
      doc.roundedRect(35, y, 30, 30, 2, 2, 'S')

      // Try to load the icon image
      try {
        const iconUrl = item.icon_path || `/icons/${item.icon}.png`
        const img = await loadImage(iconUrl)
        if (img) {
          doc.addImage(img, 'PNG', 37, y + 2, 26, 26)
        } else {
          doc.setFontSize(6)
          doc.setTextColor(150, 150, 170)
          doc.text(item.icon || '', 50, y + 16, { align: 'center', maxWidth: 26 })
        }
      } catch {
        doc.setFontSize(6)
        doc.setTextColor(150, 150, 170)
        doc.text(item.icon || '', 50, y + 16, { align: 'center', maxWidth: 26 })
      }
      y += 34
    }

    // Description
    if (description) {
      doc.setFontSize(7)
      doc.setTextColor(200, 200, 210)
      doc.setFont('helvetica', 'italic')
      const descLines = doc.splitTextToSize(cleanLSTags(description), 76)
      const maxDescLines = Math.min(descLines.length, 4)
      doc.text(descLines.slice(0, maxDescLines), 12, y + 2)
      y += maxDescLines * 3.5 + 3
    }

    // Separator
    doc.setDrawColor(200, 168, 78)
    doc.line(15, y, 85, y)
    y += 4

  // Effects
  const namedEffects = (item.display_effects || []).filter(e => e.name)
  if (namedEffects.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(200, 168, 78)
    const effectsTitle = locale === 'fr' ? 'Effets' : 'Effects'
    doc.text(effectsTitle, 12, y + 1)
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(180, 210, 180)
    doc.setFontSize(6.5)
    namedEffects.slice(0, 4).forEach(eff => {
      const label = eff.name?.[locale] || eff.name?.en
      doc.text(`• ${cleanLSTags(label)}`, 14, y + 1)
      y += 3.5
    })
    y += 1
  }

    // Passives
    if (item.passives_full && item.passives_full.length > 0) {
      if (y < 130) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(200, 168, 78)
        const passivesTitle = locale === 'fr' ? 'Passifs' : 'Passives'
        doc.text(passivesTitle, 12, y + 1)
        y += 4
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(170, 190, 220)
        doc.setFontSize(6.5)
        item.passives_full.slice(0, 3).forEach(p => {
          const pName = p.name?.[locale] || p.name?.en || p.id || ''
          let pDesc = p.description?.[locale] || p.description?.en || ''
          pDesc = fillDescriptionParams(pDesc, p.description_params)
          pDesc = cleanLSTags(pDesc)
          doc.setFont('helvetica', 'bold')
          doc.text(`• ${pName}`, 14, y + 1)
          y += 3.5
          if (pDesc) {
            doc.setFont('helvetica', 'normal')
            const pLines = doc.splitTextToSize(pDesc, 72)
            doc.text(pLines.slice(0, 2), 16, y + 1)
            y += Math.min(pLines.length, 2) * 3 + 1
          }
        })
      }
    }

    // Spells
    if (item.spells_full && item.spells_full.length > 0) {
      if (y < 130) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(200, 168, 78)
        const spellsTitle = locale === 'fr' ? 'Sorts' : 'Spells'
        doc.text(spellsTitle, 12, y + 1)
        y += 4
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(190, 170, 220)
        doc.setFontSize(6.5)
        item.spells_full.slice(0, 2).forEach(s => {
          const sName = s.name?.[locale] || s.name?.en || s.id || ''
          doc.text(`• ${sName}`, 14, y + 1)
          y += 3.5
        })
      }
    }

    // Footer
    doc.setFontSize(5)
    doc.setTextColor(120, 120, 140)
    doc.text('BG3 Items Browser — Baldur\'s Gate 3 Compendium', 50, 145, { align: 'center' })

    doc.save(`${item.id || 'item'}.pdf`)
  }

  function loadImage(url) {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => resolve(null)
      img.src = url
    })
  }

  return { exportItemPDF }
}
