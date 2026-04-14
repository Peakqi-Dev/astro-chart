/**
 * SVG 命盤圓形圖產生器
 * 完整西洋星盤：外圈（星座）+ 宮位線 + 行星符號 + 相位線
 */

// ── 常數 ─────────────────────────────────────────────────
const CX = 300, CY = 300           // 圓心
const R_OUTER  = 260               // 星座環外圓
const R_SIGN   = 238               // 星座環內圓（星座符號位置）
const R_HOUSE  = 218               // 宮位環外圓
const R_HOUSE_IN = 160             // 宮位環內圓
const R_PLANET = 195               // 行星符號位置
const R_ASPECT = 140               // 相位線端點
const R_CENTER = 60                // 中心圓

const SIGN_COLORS = {
  fire:  '#e88060', // 火象 - 珊瑚紅
  earth: '#90b870', // 土象 - 草綠
  air:   '#70a8d8', // 風象 - 天藍
  water: '#9080c8', // 水象 - 紫藍
}
const ELEMENT_OF_SIGN = [
  'fire','earth','air','water',
  'fire','earth','air','water',
  'fire','earth','air','water',
]
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']
const SIGN_NAMES_ZH = ['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','魔羯','水瓶','雙魚']

const ASPECT_COLORS = {
  conjunction: '#c8a060',
  opposition:  '#e06060',
  trine:       '#60c880',
  square:      '#e07060',
  sextile:     '#6090d8',
  quincunx:    '#b080c0',
}

// ── 幾何工具 ─────────────────────────────────────────────

function toRad(deg) { return deg * Math.PI / 180 }

// 西洋星盤：0°（牡羊0°）在右方 (3 o'clock)，逆時針增加
// SVG 座標：角度順時針，所以需要 -deg 轉換
function polarToXY(cx, cy, r, lonDeg, ascDeg = 0) {
  // 星盤旋轉：上升點在左方 (9 o'clock = 180°)
  // lonDeg 是黃道度數，ascDeg 是上升度數
  const angle = toRad(-(lonDeg - ascDeg) + 180)
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  }
}

function describeArc(cx, cy, r, startDeg, endDeg, ascDeg = 0) {
  const start = polarToXY(cx, cy, r, startDeg, ascDeg)
  const end = polarToXY(cx, cy, r, endDeg, ascDeg)
  // 弧長方向：黃道逆時針
  const sweep = ((endDeg - startDeg + 360) % 360) > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${sweep} 0 ${end.x} ${end.y}`
}

// ── 主要 SVG 生成函式 ─────────────────────────────────────

/**
 * @param {import('../types/index.js').NatalChart} chart
 * @returns {string} SVG 字串
 */
export function generateChartSVG(chart) {
  const ascDeg = chart.ascendantDegree || 0
  const parts = []

  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" style="background:#0d0d14">`)
  parts.push(defs())

  // 1. 背景圓
  parts.push(`<circle cx="${CX}" cy="${CY}" r="${R_OUTER}" fill="#0d0d14" stroke="#2a2a3a" stroke-width="1"/>`)
  parts.push(`<circle cx="${CX}" cy="${CY}" r="${R_HOUSE}" fill="#0d0d14" stroke="#2a2a3a" stroke-width="0.5"/>`)
  parts.push(`<circle cx="${CX}" cy="${CY}" r="${R_HOUSE_IN}" fill="#131320" stroke="#2a2a3a" stroke-width="0.5"/>`)
  parts.push(`<circle cx="${CX}" cy="${CY}" r="${R_CENTER}" fill="#0d0d14" stroke="#3a3a4a" stroke-width="1"/>`)

  // 2. 星座環
  parts.push(renderZodiacRing(ascDeg))

  // 3. 宮位線與編號
  parts.push(renderHouses(chart.houses, ascDeg))

  // 4. 相位線（在行星之前，避免遮蓋）
  parts.push(renderAspectLines(chart.aspects, chart.planets, ascDeg))

  // 5. 行星
  parts.push(renderPlanets(chart.planets, ascDeg))

  // 6. 交點
  parts.push(renderNodes(chart.nodes, ascDeg))

  // 7. 中心資訊
  parts.push(renderCenter(chart))

  parts.push(`</svg>`)
  return parts.join('\n')
}

// ── 各部件渲染 ────────────────────────────────────────────

function defs() {
  // 相位線的顏色 filter & 行星標籤背景
  return `<defs>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1a1a2a"/>
      <stop offset="100%" stop-color="#0d0d14"/>
    </radialGradient>
  </defs>`
}

function renderZodiacRing(ascDeg) {
  const parts = []
  for (let i = 0; i < 12; i++) {
    const startLon = i * 30
    const endLon = (i + 1) * 30
    const element = ELEMENT_OF_SIGN[i]
    const color = SIGN_COLORS[element]

    // 星座色弧
    const outerStart = polarToXY(CX, CY, R_OUTER, startLon, ascDeg)
    const outerEnd   = polarToXY(CX, CY, R_OUTER, endLon,   ascDeg)
    const innerStart = polarToXY(CX, CY, R_HOUSE,  endLon,   ascDeg)
    const innerEnd   = polarToXY(CX, CY, R_HOUSE,  startLon, ascDeg)
    parts.push(`<path d="M${outerStart.x},${outerStart.y} A${R_OUTER},${R_OUTER} 0 0,0 ${outerEnd.x},${outerEnd.y} L${innerStart.x},${innerStart.y} A${R_HOUSE},${R_HOUSE} 0 0,1 ${innerEnd.x},${innerEnd.y} Z" fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-width="0.3" stroke-opacity="0.4"/>`)

    // 星座符號
    const midLon = startLon + 15
    const symPos = polarToXY(CX, CY, R_SIGN, midLon, ascDeg)
    parts.push(`<text x="${symPos.x}" y="${symPos.y}" text-anchor="middle" dominant-baseline="central" fill="${color}" font-size="14" opacity="0.9">${SIGN_SYMBOLS[i]}</text>`)

    // 星座分隔線（小刻度）
    const tickOuter = polarToXY(CX, CY, R_OUTER, startLon, ascDeg)
    const tickInner = polarToXY(CX, CY, R_HOUSE, startLon, ascDeg)
    parts.push(`<line x1="${tickOuter.x}" y1="${tickOuter.y}" x2="${tickInner.x}" y2="${tickInner.y}" stroke="#3a3a5a" stroke-width="0.8"/>`)

    // 每 5 度小刻度
    for (let d = 5; d < 30; d += 5) {
      const tickLen = d % 10 === 0 ? 8 : 5
      const tp1 = polarToXY(CX, CY, R_OUTER, startLon + d, ascDeg)
      const tp2 = polarToXY(CX, CY, R_OUTER - tickLen, startLon + d, ascDeg)
      parts.push(`<line x1="${tp1.x}" y1="${tp1.y}" x2="${tp2.x}" y2="${tp2.y}" stroke="#2a2a4a" stroke-width="0.5"/>`)
    }
  }
  return parts.join('\n')
}

function renderHouses(houses, ascDeg) {
  const parts = []
  for (let i = 0; i < 12; i++) {
    const cuspDeg = houses.cusps[i]
    const isAngular = [0, 3, 6, 9].includes(i) // 1,4,7,10 宮（角宮）

    // 宮位線
    const outerPt = polarToXY(CX, CY, R_HOUSE, cuspDeg, ascDeg)
    const innerPt = polarToXY(CX, CY, R_CENTER, cuspDeg, ascDeg)
    const strokeColor = isAngular ? '#6060a0' : '#2a2a4a'
    const strokeW = isAngular ? 1.2 : 0.6
    parts.push(`<line x1="${outerPt.x}" y1="${outerPt.y}" x2="${innerPt.x}" y2="${innerPt.y}" stroke="${strokeColor}" stroke-width="${strokeW}"/>`)

    // 宮位編號
    const nextCusp = houses.cusps[(i + 1) % 12]
    // 跨越 0° 的宮位
    let midDeg = (cuspDeg + nextCusp) / 2
    if (nextCusp < cuspDeg) midDeg = ((cuspDeg + nextCusp + 360) / 2) % 360
    const numPos = polarToXY(CX, CY, (R_HOUSE_IN + R_CENTER) / 2, midDeg, ascDeg)
    const houseColor = isAngular ? '#8080c0' : '#4a4a6a'
    parts.push(`<text x="${numPos.x}" y="${numPos.y}" text-anchor="middle" dominant-baseline="central" fill="${houseColor}" font-size="10" font-family="serif">${i + 1}</text>`)
  }

  // ASC / DC / MC / IC 標籤
  const labels = [
    { lon: ascDeg,        label: 'ASC', color: '#f0a060' },
    { lon: ascDeg + 180,  label: 'DSC', color: '#a060f0' },
    { lon: houses.mc,     label: 'MC',  color: '#60d8a0' },
    { lon: houses.mc + 180, label: 'IC', color: '#60a0d8' },
  ]
  for (const lb of labels) {
    const pos = polarToXY(CX, CY, R_HOUSE + 16, lb.lon, ascDeg)
    parts.push(`<text x="${pos.x}" y="${pos.y}" text-anchor="middle" dominant-baseline="central" fill="${lb.color}" font-size="9" font-weight="bold">${lb.label}</text>`)
  }

  return parts.join('\n')
}

function renderAspectLines(aspects, planets, ascDeg) {
  const parts = []
  const planetLonMap = {}
  for (const p of planets) planetLonMap[p.id] = p.longitude

  // 只畫前 15 個最緊密相位，避免過於混亂
  for (const asp of aspects.slice(0, 15)) {
    const lon1 = planetLonMap[asp.planet1]
    const lon2 = planetLonMap[asp.planet2]
    if (lon1 === undefined || lon2 === undefined) continue

    const p1 = polarToXY(CX, CY, R_ASPECT, lon1, ascDeg)
    const p2 = polarToXY(CX, CY, R_ASPECT, lon2, ascDeg)
    const color = ASPECT_COLORS[asp.type] || '#606060'
    const opacity = Math.max(0.15, 0.7 - asp.orb * 0.07)
    const dashArray = asp.harmonic === 'soft' ? 'none' : asp.harmonic === 'hard' ? '3,3' : '6,2'

    parts.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="0.8" stroke-opacity="${opacity}" stroke-dasharray="${dashArray}"/>`)
  }
  return parts.join('\n')
}

function renderPlanets(planets, ascDeg) {
  const parts = []

  // 防重疊：同一方向的行星要分散
  const placed = []
  function findNonOverlapping(lon) {
    let adjusted = lon
    for (let attempt = 0; attempt < 12; attempt++) {
      const conflict = placed.find(p => {
        let diff = Math.abs(p - adjusted)
        if (diff > 180) diff = 360 - diff
        return diff < 7
      })
      if (!conflict) break
      adjusted += 7
    }
    return adjusted
  }

  for (const planet of planets) {
    const displayLon = findNonOverlapping(planet.longitude)
    placed.push(displayLon)

    const pos = polarToXY(CX, CY, R_PLANET, displayLon, ascDeg)

    // 行星圓形背景
    const planetBg = planet.retrograde ? '#2a1a1a' : '#1a1a2a'
    const borderColor = planet.retrograde ? '#c04040' : '#4a4a7a'
    parts.push(`<circle cx="${pos.x}" cy="${pos.y}" r="13" fill="${planetBg}" stroke="${borderColor}" stroke-width="0.8"/>`)

    // 行星符號
    parts.push(`<text x="${pos.x}" y="${pos.y}" text-anchor="middle" dominant-baseline="central" fill="#d0c8f0" font-size="11">${planet.symbol}</text>`)

    // 逆行標記
    if (planet.retrograde) {
      parts.push(`<text x="${pos.x + 10}" y="${pos.y - 10}" fill="#e06060" font-size="8">℞</text>`)
    }

    // 度數標籤（小）
    const degText = `${Math.floor(planet.degree)}°`
    const degPos = polarToXY(CX, CY, R_PLANET - 22, displayLon, ascDeg)
    parts.push(`<text x="${degPos.x}" y="${degPos.y}" text-anchor="middle" dominant-baseline="central" fill="#6a6880" font-size="8">${degText}</text>`)
  }
  return parts.join('\n')
}

function renderNodes(nodes, ascDeg) {
  const parts = []

  // 北交點
  const nPos = polarToXY(CX, CY, R_PLANET, nodes.northLongitude, ascDeg)
  parts.push(`<circle cx="${nPos.x}" cy="${nPos.y}" r="11" fill="#0a2a2a" stroke="#40b890" stroke-width="1"/>`)
  parts.push(`<text x="${nPos.x}" y="${nPos.y}" text-anchor="middle" dominant-baseline="central" fill="#40b890" font-size="12">☊</text>`)

  // 南交點
  const sPos = polarToXY(CX, CY, R_PLANET, nodes.southLongitude, ascDeg)
  parts.push(`<circle cx="${sPos.x}" cy="${sPos.y}" r="11" fill="#2a0a0a" stroke="#c06060" stroke-width="1"/>`)
  parts.push(`<text x="${sPos.x}" y="${sPos.y}" text-anchor="middle" dominant-baseline="central" fill="#c06060" font-size="12">☋</text>`)

  return parts.join('\n')
}

function renderCenter(chart) {
  const name = chart.birthData?.meta?.name || ''
  const lines = []

  if (name) {
    lines.push(`<text x="${CX}" y="${CY - 14}" text-anchor="middle" fill="#a090d0" font-size="10" font-family="serif">${escapeXml(name)}</text>`)
  }

  const { date } = chart.birthData
  const dateStr = `${date.year}.${String(date.month).padStart(2,'0')}.${String(date.day).padStart(2,'0')}`
  const yOffset = name ? CY : CY - 6
  lines.push(`<text x="${CX}" y="${yOffset}" text-anchor="middle" fill="#6a6880" font-size="9">${dateStr}</text>`)
  lines.push(`<text x="${CX}" y="${yOffset + 14}" text-anchor="middle" fill="#7a7090" font-size="9">${chart.birthData.location?.cityName || ''}</text>`)

  return lines.join('\n')
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
