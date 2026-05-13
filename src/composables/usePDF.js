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
    const pageW = 148
    const pageH = 210
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pageW, pageH] })
    const margin = 12
    const contentW = pageW - margin * 2
    const centerX = pageW / 2

    const name = item.translations?.[locale]?.name || item.translations?.en?.name || item.title || item.id
    const description = item.translations?.[locale]?.description || item.translations?.en?.description || item.description || ''
    const rarityColor = RARITY_COLORS[item.rarity] || RARITY_COLORS.Common
    const rarityLabel = RARITY_LABELS[locale]?.[item.rarity] || item.rarity || 'Unknown'
    const categoryLabel = item.category || ''

    // ── Background ──
    doc.setFillColor(26, 26, 46)
    doc.rect(0, 0, pageW, pageH, 'F')

    // ── Decorative borders ──
    doc.setDrawColor(200, 168, 78)
    doc.setLineWidth(0.8)
    doc.rect(4, 4, pageW - 8, pageH - 8)
    doc.setLineWidth(0.25)
    doc.rect(6.5, 6.5, pageW - 13, pageH - 13)

    // ── Corner ornaments ──
    const co = 3
    const corners = [
      [6.5, 6.5, 1, 1], [pageW - 6.5, 6.5, -1, 1],
      [6.5, pageH - 6.5, 1, -1], [pageW - 6.5, pageH - 6.5, -1, -1]
    ]
    doc.setLineWidth(0.4)
    corners.forEach(([cx, cy, dx, dy]) => {
      doc.line(cx, cy, cx + co * dx, cy)
      doc.line(cx, cy, cx, cy + co * dy)
    })

    // ── Title bar ──
    let y = 12
    doc.setFillColor(200, 168, 78)
    doc.roundedRect(margin, y, contentW, 10, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(26, 26, 46)
    const titleLines = doc.splitTextToSize(name, contentW - 8)
    if (titleLines.length > 1) {
      // Expand title bar for multi-line
      doc.setFillColor(200, 168, 78)
      const titleBarH = 6 + titleLines.length * 4.5
      doc.roundedRect(margin, y, contentW, titleBarH, 1.5, 1.5, 'F')
      doc.text(titleLines, centerX, y + 5, { align: 'center' })
      y += titleBarH + 2
    } else {
      doc.text(name, centerX, y + 7, { align: 'center' })
      y += 13
    }

    // ── Rarity badge + Category + Unique (centered row) ──
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    const badgeW = doc.getTextWidth(rarityLabel) + 7
    const badgeX = centerX - badgeW / 2
    doc.setFillColor(rarityColor.r, rarityColor.g, rarityColor.b)
    doc.roundedRect(badgeX, y, badgeW, 5.5, 1.2, 1.2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.text(rarityLabel, centerX, y + 4, { align: 'center' })
    y += 8

    // Category
doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(160, 160, 180)
    const categoryTranslations = {
      en: { Armor: 'Armor', Weapon: 'Weapon', Shield: 'Shield', Amulet: 'Amulet', Ring: 'Ring', Helmet: 'Helmet', Cloak: 'Cloak', Gloves: 'Gloves', Boots: 'Boots' },
      fr: { Armor: 'Armure', Weapon: 'Arme', Shield: 'Bouclier', Amulet: 'Amulette', Ring: 'Anneau', Helmet: 'Casque', Cloak: 'Cape', Gloves: 'Gants', Boots: 'Bottes' }
    }
    const catLabel = categoryTranslations[locale]?.[categoryLabel] || categoryLabel
    let catLine = catLabel
    if (item.unique) catLine += `  ·  ★ ${locale === 'fr' ? 'Unique' : 'Unique'}`
    doc.text(catLine, centerX, y, { align: 'center' })
    y += 5

    // Icon (centered)
    const iconSize = 36
    if (item.icon) {
      const iconX = centerX - iconSize / 2
      doc.setFillColor(35, 35, 58)
      doc.roundedRect(iconX, y, iconSize, iconSize, 2, 2, 'F')
      doc.setDrawColor(200, 168, 78)
      doc.setLineWidth(0.3)
      doc.roundedRect(iconX, y, iconSize, iconSize, 2, 2, 'S')

      try {
        const iconUrl = item.icon_path || `/icons/${item.icon}.png`
        const img = await loadImage(iconUrl)
        if (img) {
          doc.addImage(img, 'PNG', iconX + 1.5, y + 1.5, iconSize - 3, iconSize - 3)
        }
      } catch { /* ignore */ }

      y += iconSize + 4
    }


    // ── Separator ──
    doc.setDrawColor(200, 168, 78)
    doc.setLineWidth(0.25)
    doc.line(margin + 10, y, pageW - margin - 10, y)
    y += 4

    // ── Description ──
    if (description) {
      doc.setFontSize(7.5)
      doc.setTextColor(195, 195, 210)
      doc.setFont('helvetica', 'italic')
      const descLines = doc.splitTextToSize(cleanLSTags(description), contentW - 4)
      doc.text(descLines, margin + 2, y)
      y += descLines.length * 3.5 + 4
    }

    // ── Stats row (weight, value, charges) ──
    const stats = []
    if (item.weight) stats.push({ label: locale === 'fr' ? 'Poids' : 'Weight', val: `${item.weight}` })
    if (item.value) stats.push({ label: locale === 'fr' ? 'Valeur' : 'Value', val: `${item.value}` })
    if (item.charges) stats.push({ label: 'Charges', val: `${item.charges}/${item.max_charges || item.charges}` })
    if (item.proficiency_group) stats.push({ label: locale === 'fr' ? 'Maîtrise' : 'Proficiency', val: item.proficiency_group })

    if (stats.length > 0) {
      const statW = contentW / stats.length
      doc.setFontSize(5.5)
      stats.forEach((s, i) => {
        const sx = margin + i * statW + statW / 2
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(130, 130, 155)
        doc.text(s.label, sx, y, { align: 'center' })
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(200, 200, 215)
        doc.text(s.val, sx, y + 3.5, { align: 'center' })
      })
      y += 8
    }

    // ── Separator ──
    doc.setDrawColor(200, 168, 78)
    doc.setLineWidth(0.15)
    doc.line(margin + 10, y, pageW - margin - 10, y)
    y += 5

    // ── Helper: section rendering ──
    function renderSection(title, items, colors, getContent) {
      if (!items || items.length === 0) return
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(200, 168, 78)
      doc.text(title, margin, y)
      y += 5

      items.forEach(entry => {
        if (y > pageH - 18) return
        const { name: eName, desc, extra } = getContent(entry)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7.5)
        doc.setTextColor(colors.name.r, colors.name.g, colors.name.b)
        doc.text(`• ${eName}`, margin + 2, y)
        y += 3.8

        if (desc) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(7)
          doc.setTextColor(colors.desc.r, colors.desc.g, colors.desc.b)
          const lines = doc.splitTextToSize(desc, contentW - 8)
          doc.text(lines, margin + 6, y)
          y += lines.length * 3.2 + 1.5
        }

        if (extra) {
          doc.setFont('helvetica', 'italic')
          doc.setFontSize(6.5)
          doc.setTextColor(140, 150, 170)
          const eLines = doc.splitTextToSize(extra, contentW - 8)
          doc.text(eLines, margin + 6, y)
          y += eLines.length * 3 + 1.5
        }
      })
      y += 3
    }

    // ── Passives ──
    renderSection(
      locale === 'fr' ? 'Passifs' : 'Passives',
      item.passives_full,
      { name: { r: 170, g: 190, b: 220 }, desc: { r: 155, g: 165, b: 190 } },
      p => {
        let desc = p.description?.[locale] || p.description?.en || ''
        desc = cleanLSTags(fillDescriptionParams(desc, p.description_params))
        let extra = p.extra_description?.[locale] || p.extra_description?.en || ''
        extra = cleanLSTags(fillDescriptionParams(extra, p.extra_description_params))
        return {
          name: p.name?.[locale] || p.name?.en || p.id || '',
          desc,
          extra: extra || null
        }
      }
    )

    // ── Spells ──
    renderSection(
      locale === 'fr' ? 'Sorts' : 'Spells',
      item.spells_full,
      { name: { r: 190, g: 170, b: 220 }, desc: { r: 170, g: 160, b: 200 } },
      s => {
        let desc = s.description?.[locale] || s.description?.en || ''
        desc = cleanLSTags(fillDescriptionParams(desc, s.description_params))
        const meta = [s.spell_school, s.level ? `Lvl ${s.level}` : null].filter(Boolean).join(' · ')
        return {
          name: (s.name?.[locale] || s.name?.en || s.id || '') + (meta ? `  (${meta})` : ''),
          desc,
          extra: null
        }
      }
    )

    // ── Statuses ──
    if (item.status_full && item.status_full.length > 0) {
      const visible = item.status_full.filter(s => {
        const n = s.name?.[locale] || s.name?.en || ''
        return n && !n.includes('%%%') && !n.toLowerCase().includes('technical')
      })
      renderSection(
        locale === 'fr' ? "Statuts à l'équipement" : 'Statuses on Equip',
        visible,
        { name: { r: 210, g: 180, b: 100 }, desc: { r: 185, g: 170, b: 130 } },
        s => {
          let desc = s.description?.[locale] || s.description?.en || ''
          desc = cleanLSTags(fillDescriptionParams(desc, s.description_params))
          return { name: s.name?.[locale] || s.name?.en || s.id || '', desc, extra: null }
        }
      )
    }

    // ── Footer ──
    doc.setFontSize(5)
    doc.setTextColor(90, 90, 110)
    doc.text('BG3 Items Browser — Baldur\'s Gate 3 Compendium', centerX, pageH - 8, { align: 'center' })

    // ── Save ──
    const fileName = name
      .replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '')
      .replace(/\s+/g, '_')
    doc.save(`${fileName}.pdf`)
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