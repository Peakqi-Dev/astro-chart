/**
 * PDF 報告產生器（修正版）
 * - 使用 IPA Gothic 支援繁體中文
 * - 修正 contentW scope 問題
 * - 修正行星頁版面計算
 */

// pdfkit 載入很慢（~30s），改為 lazy import 以加速 server 啟動
let PDFDocument
async function getPDFDocument() {
  if (!PDFDocument) {
    const mod = await import('pdfkit')
    PDFDocument = mod.default
  }
  return PDFDocument
}
import { NORTH_NODE_SIGNS, SOUTH_NODE_SIGNS, NORTH_NODE_HOUSES } from './interpretations.js'

const FONT_REGULAR = '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
const FONT_BOLD    = '/usr/share/fonts/opentype/ipafont-gothic/ipagp.ttf'

const C = {
  bg:'#0d0d14', bg2:'#13131f', bg3:'#1a1a2a', border:'#2a2a3a',
  accent:'#a78bfa', gold:'#f0c060', teal:'#5dd8b5', coral:'#f08080',
  text:'#e8e6f0', text2:'#9b97b0', text3:'#6b6880',
}

function fillRect(doc,x,y,w,h,color){doc.save().rect(x,y,w,h).fill(color).restore()}
function strokeRect(doc,x,y,w,h,color,lw=0.5){doc.save().lineWidth(lw).rect(x,y,w,h).stroke(color).restore()}
function hLine(doc,x1,x2,y,color,lw=0.5){doc.save().lineWidth(lw).moveTo(x1,y).lineTo(x2,y).stroke(color).restore()}

export async function generatePDFReport(chart, interpretation, aiReport = null) {
  const PDFDoc = await getPDFDocument()
  return new Promise((resolve, reject) => {
    const doc = new PDFDoc({
      size: 'A4',
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
      info: { Title: `星圖命盤報告 ${chart.birthData?.meta?.name || ''}`, Author: '星圖占星系統' },
    })

    doc.registerFont('Regular', FONT_REGULAR)
    doc.registerFont('Bold', FONT_BOLD)

    const chunks = []
    doc.on('data', c => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const PW = doc.page.width
    const L = 50, R = PW - 50, CW = R - L

    renderCover(doc, chart, PW, L, R, CW)
    doc.addPage()
    renderPlanets(doc, chart, PW, L, R, CW)
    doc.addPage()
    renderNodes(doc, chart, interpretation, PW, L, R, CW)
    if (aiReport && aiReport.trim()) {
      doc.addPage()
      renderAIReport(doc, aiReport, PW, L, R, CW)
    }
    doc.end()
  })
}

function renderCover(doc, chart, PW, L, R, CW) {
  fillRect(doc, 0, 0, PW, doc.page.height, C.bg)
  doc.save().lineWidth(0.5)
  doc.circle(PW/2, 200, 130).stroke(C.border)
  doc.circle(PW/2, 200, 100).stroke(C.border)
  doc.circle(PW/2, 200, 70).stroke(C.border)
  doc.restore()
  doc.font('Regular').fontSize(40).fillColor(C.accent).text('☽', PW/2 - 20, 175)
  doc.font('Bold').fontSize(24).fillColor(C.text).text('星圖命盤報告', L, 270, { align:'center', width:CW })
  const name = chart.birthData?.meta?.name
  if (name) doc.font('Regular').fontSize(16).fillColor(C.gold).text(name, L, 305, { align:'center', width:CW })

  const { date, time, location } = chart.birthData
  const dateStr = `${date.year} 年 ${date.month} 月 ${date.day} 日`
  const timeStr = time.precision === 'unknown' ? '出生時間不詳'
    : `${String(time.hour).padStart(2,'0')}:${String(time.minute).padStart(2,'0')}`
  const infoY = 360, infoX = L+40, infoW = CW-80
  fillRect(doc, infoX, infoY, infoW, 100, C.bg2)
  strokeRect(doc, infoX, infoY, infoW, 100, C.border)
  doc.font('Regular').fontSize(11).fillColor(C.text2)
  doc.text(`出生日期：${dateStr}`, infoX+16, infoY+14)
  doc.text(`出生時間：${timeStr}`, infoX+16, infoY+34)
  doc.text(`出生地點：${location.cityName}`, infoX+16, infoY+54)
  doc.text(`計算時區：${location.timezone}`, infoX+16, infoY+74)

  const signsY = 490
  const cardW = (CW - 20) / 3
  const cards = [
    { label:'太陽星座', value: chart.sunSign || '—', color: C.gold },
    { label:'月亮星座', value: chart.moonSign || '—', color: '#a0c0f0' },
    { label:'上升星座', value: chart.timePrecision==='unknown' ? '—' : (chart.risingSign||'—'), color: C.teal },
  ]
  cards.forEach((card, i) => {
    const cx = L + i * (cardW + 10)
    fillRect(doc, cx, signsY, cardW, 68, C.bg2)
    strokeRect(doc, cx, signsY, cardW, 68, card.color)
    doc.font('Regular').fontSize(9).fillColor(C.text3).text(card.label, cx, signsY+10, { align:'center', width:cardW })
    doc.font('Bold').fontSize(15).fillColor(card.color).text(card.value, cx, signsY+30, { align:'center', width:cardW })
  })
  if (chart.timePrecision === 'unknown') {
    doc.font('Regular').fontSize(9).fillColor(C.text3)
      .text('* 出生時間不詳，宮位及上升星座計算可能不準確', L, signsY+76, { align:'center', width:CW })
  }
  doc.font('Regular').fontSize(9).fillColor(C.text3)
    .text('占星是認識自我的工具，而非命運的枷鎖。', L, 760, { align:'center', width:CW })
}

function renderPlanets(doc, chart, PW, L, R, CW) {
  fillRect(doc, 0, 0, PW, doc.page.height, C.bg)
  doc.font('Bold').fontSize(15).fillColor(C.accent).text('行星位置總覽', L, 40)
  hLine(doc, L, R, 60, C.accent)

  const cols = { sym:L, name:L+22, sign:L+90, deg:L+168, house:L+224, note:L+288 }
  fillRect(doc, L, 72, CW, 20, C.bg2)
  doc.font('Bold').fontSize(9).fillColor(C.text3)
  doc.text('符', cols.sym+2, 77).text('行星', cols.name+2, 77).text('星座', cols.sign+2, 77)
  doc.text('度數', cols.deg+2, 77).text('宮位', cols.house+2, 77).text('備注', cols.note+2, 77)

  chart.planets.forEach((p, i) => {
    const ry = 96 + i * 26
    fillRect(doc, L, ry, CW, 24, i%2===0 ? C.bg : C.bg2)
    strokeRect(doc, L, ry, CW, 24, C.border, 0.3)
    doc.font('Regular').fontSize(11).fillColor(C.accent).text(p.symbol, cols.sym+2, ry+6)
    doc.font('Regular').fontSize(10).fillColor(C.text).text(p.nameZh, cols.name+2, ry+7)
    doc.font('Regular').fontSize(10).fillColor(C.text2)
      .text(p.signZh, cols.sign+2, ry+7)
      .text(`${p.degree.toFixed(1)}°`, cols.deg+2, ry+7)
      .text(`第 ${p.house} 宮`, cols.house+2, ry+7)
    if (p.retrograde) doc.font('Regular').fontSize(9).fillColor(C.coral).text('℞ 逆行', cols.note+2, ry+7)
  })

  const nodeY = 96 + chart.planets.length * 26 + 16
  doc.font('Bold').fontSize(12).fillColor(C.teal).text('靈魂節點', L, nodeY)
  hLine(doc, L, R, nodeY+17, C.teal, 0.4)
  const nodeRows = [
    { label:'北交點 ☊', sign:chart.nodes.northSignZh, deg:chart.nodes.northDegree, house:chart.nodes.northHouse, color:C.teal },
    { label:'南交點 ☋', sign:chart.nodes.southSignZh, deg:chart.nodes.southDegree, house:chart.nodes.southHouse, color:C.coral },
  ]
  nodeRows.forEach((row, i) => {
    const ry = nodeY + 24 + i * 26
    fillRect(doc, L, ry, CW, 24, C.bg2)
    strokeRect(doc, L, ry, CW, 24, row.color, 0.5)
    doc.font('Bold').fontSize(10).fillColor(row.color).text(row.label, cols.name+2, ry+7)
    doc.font('Regular').fontSize(10).fillColor(C.text)
      .text(row.sign, cols.sign+2, ry+7)
      .text(`${row.deg.toFixed(1)}°`, cols.deg+2, ry+7)
      .text(`第 ${row.house} 宮`, cols.house+2, ry+7)
  })

  const aspY = nodeY + 24 + nodeRows.length * 26 + 20
  doc.font('Bold').fontSize(12).fillColor(C.gold).text('主要相位', L, aspY)
  hLine(doc, L, R, aspY+17, C.gold, 0.4)
  const aspColors = { soft:C.teal, hard:C.coral, neutral:C.accent }
  chart.aspects.slice(0, 10).forEach((asp, i) => {
    const ay = aspY + 24 + i * 20
    if (ay > 780) return
    doc.font('Regular').fontSize(9).fillColor(C.text2)
      .text(`${asp.planet1Zh}  ${asp.typeZh}  ${asp.planet2Zh}`, L+4, ay)
    doc.font('Regular').fontSize(9).fillColor(aspColors[asp.harmonic] || C.text2)
      .text(`${asp.orb}°`, L+200, ay)
    doc.font('Regular').fontSize(9).fillColor(C.text3)
      .text(asp.harmonic==='soft'?'柔和':asp.harmonic==='hard'?'緊張':'中性', L+240, ay)
  })
}

function renderNodes(doc, chart, interpretation, PW, L, R, CW) {
  fillRect(doc, 0, 0, PW, doc.page.height, C.bg)
  doc.font('Bold').fontSize(15).fillColor(C.accent).text('靈魂節點深度詮釋', L, 40)
  hLine(doc, L, R, 60, C.accent)

  const northInterp = NORTH_NODE_SIGNS[chart.nodes.northSign] || {}
  const southInterp = SOUTH_NODE_SIGNS[chart.nodes.southSign] || {}
  const houseInterp = NORTH_NODE_HOUSES[chart.nodes.northHouse] || {}
  let y = 72

  // 北交點
  fillRect(doc, L, y, CW, 196, C.bg2)
  strokeRect(doc, L, y, CW, 196, C.teal, 0.8)
  fillRect(doc, L, y, CW, 26, '#0a2220')
  doc.font('Bold').fontSize(11).fillColor(C.teal)
    .text(`☊ 北交點 — ${chart.nodes.northSignZh}  第 ${chart.nodes.northHouse} 宮`, L+10, y+7)
  const nrows = [
    { label:'靈魂功課：', val: northInterp.lesson || '' },
    { label:'核心挑戰：', val: northInterp.challenge || '' },
    { label:'宮位主題：', val: houseInterp.focus || '' },
    { label:'成長方向：', val: northInterp.guidance || '' },
  ]
  nrows.forEach((row, i) => {
    const ry = y + 34 + i * 40
    doc.font('Bold').fontSize(9).fillColor(C.gold).text(row.label, L+10, ry)
    doc.font('Regular').fontSize(9).fillColor(C.text2).text(row.val, L+70, ry, { width:CW-80 })
  })
  y += 208

  // 南交點
  fillRect(doc, L, y, CW, 106, C.bg2)
  strokeRect(doc, L, y, CW, 106, C.coral, 0.8)
  fillRect(doc, L, y, CW, 26, '#220a0a')
  doc.font('Bold').fontSize(11).fillColor(C.coral)
    .text(`☋ 南交點 — ${chart.nodes.southSignZh}  第 ${chart.nodes.southHouse} 宮`, L+10, y+7)
  doc.font('Bold').fontSize(9).fillColor(C.coral).text('業力積累：', L+10, y+36)
  doc.font('Regular').fontSize(9).fillColor(C.text2).text(southInterp.karmaPattern||'', L+70, y+36, { width:CW-80 })
  doc.font('Bold').fontSize(9).fillColor(C.coral).text('需要釋放：', L+10, y+66)
  doc.font('Regular').fontSize(9).fillColor(C.text2).text(southInterp.release||'', L+70, y+66, { width:CW-80 })
  y += 118

  // 總結
  const synthesis = interpretation?.nodes?.synthesis ||
    `從${chart.nodes.southSignZh}的業力模式，走向${chart.nodes.northSignZh}的靈魂功課。${houseInterp.focus||''}`
  fillRect(doc, L, y, CW, 80, '#1a1428')
  strokeRect(doc, L, y, CW, 80, C.accent, 0.6)
  doc.font('Bold').fontSize(10).fillColor(C.accent).text('靈魂旅程總結', L+10, y+10)
  doc.font('Regular').fontSize(9).fillColor(C.text).text(synthesis, L+10, y+28, { width:CW-20 })
  y += 94

  // 元素分佈
  if (interpretation?.keyThemes) {
    const { elements, dominantElement, dominantQuality } = interpretation.keyThemes
    fillRect(doc, L, y, CW, 60, C.bg2)
    strokeRect(doc, L, y, CW, 60, C.border, 0.4)
    doc.font('Bold').fontSize(10).fillColor(C.text2).text('命盤主題', L+10, y+10)
    doc.font('Regular').fontSize(9).fillColor(C.text2)
      .text(`主導元素：${dominantElement}`, L+10, y+28)
      .text(`主導模式：${dominantQuality}`, L+10, y+44)
    const elemColors = { fire:'#e88060', earth:'#90b870', air:'#70a8d8', water:'#9080c8' }
    const elemNames = { fire:'火', earth:'土', air:'風', water:'水' }
    let ex = L + 220
    Object.entries(elements).forEach(([el, cnt]) => {
      const w = cnt * 22
      fillRect(doc, ex, y+30, w, 14, elemColors[el])
      doc.font('Regular').fontSize(8).fillColor('#fff').text(`${elemNames[el]}${cnt}`, ex+3, y+32)
      ex += w + 4
    })
  }
}

function renderAIReport(doc, aiReport, PW, L, R, CW) {
  fillRect(doc, 0, 0, PW, doc.page.height, C.bg)
  doc.font('Bold').fontSize(15).fillColor(C.accent).text('AI 人生規劃報告', L, 40)
  hLine(doc, L, R, 60, C.accent)

  const lines = aiReport.replace(/\*\*(.+?)\*\*/g, '$1').split('\n').filter(l => l.trim())
  let y = 72
  for (const line of lines) {
    if (y > 760) {
      doc.addPage()
      fillRect(doc, 0, 0, PW, doc.page.height, C.bg)
      y = 40
    }
    if (line.startsWith('## ')) {
      y += 6
      doc.font('Bold').fontSize(11).fillColor(C.accent).text(line.replace('## ',''), L, y)
      y += 20
    } else if (line.startsWith('# ')) {
      doc.font('Bold').fontSize(13).fillColor(C.gold).text(line.replace('# ',''), L, y)
      y += 24
    } else {
      const lineH = doc.font('Regular').fontSize(9).fillColor(C.text2)
        .text(line, L, y, { width:CW, lineGap:3 })
      y += doc.currentLineHeight(true) + 7
    }
  }
}
