/* 占星命盤前端邏輯（修正版）*/

let currentChart = null
let currentInterpretation = null
let currentAIReport = ''

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('city').value = btn.dataset.city
    document.getElementById('lat').value = btn.dataset.lat
    document.getElementById('lng').value = btn.dataset.lng
    document.getElementById('tz').value = btn.dataset.tz
    const geoFields = document.getElementById('geo-fields')
    geoFields.style.opacity = '1'
    geoFields.style.pointerEvents = 'auto'
  })
})

document.getElementById('time-unknown').addEventListener('change', function () {
  const inputs = document.getElementById('time-inputs')
  const warn = document.getElementById('time-warn')
  inputs.style.opacity = this.checked ? '0.4' : '1'
  inputs.style.pointerEvents = this.checked ? 'none' : 'auto'
  warn.style.display = this.checked ? 'inline-block' : 'none'
})

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))
    tab.classList.add('active')
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active')
  })
})

document.getElementById('birth-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  if (!validateForm()) return
  await calculateChart()
})

function validateForm() {
  let valid = true
  const year = parseInt(document.getElementById('year').value)
  const month = parseInt(document.getElementById('month').value)
  const day = parseInt(document.getElementById('day').value)
  document.getElementById('year-err').textContent = ''
  document.getElementById('day-err').textContent = ''
  if (!year || year < 1900 || year > 2025) {
    document.getElementById('year-err').textContent = '年份需介於 1900–2025'
    valid = false
  }
  if (year && month && day) {
    const maxDay = new Date(year, month, 0).getDate()
    if (day < 1 || day > maxDay) {
      document.getElementById('day-err').textContent = `${month} 月最多 ${maxDay} 天`
      valid = false
    }
  }
  if (!document.getElementById('lat').value) {
    alert('請選擇出生地點（點擊下方城市快選）')
    valid = false
  }
  return valid
}

async function calculateChart() {
  const timeUnknown = document.getElementById('time-unknown').checked
  const payload = {
    date: {
      year: parseInt(document.getElementById('year').value),
      month: parseInt(document.getElementById('month').value),
      day: parseInt(document.getElementById('day').value),
    },
    time: {
      hour: timeUnknown ? 12 : (parseInt(document.getElementById('hour').value) || 12),
      minute: timeUnknown ? 0 : (parseInt(document.getElementById('minute').value) || 0),
      precision: timeUnknown ? 'unknown' : 'exact',
    },
    location: {
      cityName: document.getElementById('city').value,
      latitude: parseFloat(document.getElementById('lat').value),
      longitude: parseFloat(document.getElementById('lng').value),
      timezone: document.getElementById('tz').value,
      precision: 'exact',
    },
    meta: {
      name: document.getElementById('name').value.trim() || undefined,
      gender: document.getElementById('gender').value,
    },
  }
  showLoading('正在計算星盤位置...')
  try {
    const res = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!data.success) throw new Error((data.errors || [data.error]).join('、'))
    currentChart = data.chart
    currentInterpretation = data.interpretation
    currentAIReport = ''
    renderResult(data.chart, data.interpretation)
  } catch (err) {
    hideLoading()
    alert('計算失敗：' + err.message)
  }
}

function renderResult(chart, interp) {
  hideLoading()
  document.getElementById('form-section').style.display = 'none'
  document.getElementById('result-section').style.display = 'block'

  document.getElementById('report-content').style.display = 'none'
  document.getElementById('report-content').innerHTML = ''
  document.getElementById('topic-buttons').style.display = 'none'
  document.getElementById('pdf-row').style.display = 'none'
  document.getElementById('generate-btn').disabled = false
  document.getElementById('generate-btn').innerHTML = '<span>✦</span> 生成 AI 人生規劃報告'

  const name = chart.birthData.meta?.name
  document.getElementById('chart-name').textContent = name ? `${name} 的命盤報告` : '命盤報告'
  document.getElementById('sun-sign').textContent = chart.sunSign || '—'
  document.getElementById('moon-sign').textContent = chart.moonSign || '—'
  document.getElementById('rising-sign').textContent =
    chart.timePrecision === 'unknown' ? '—（需要出生時間）' : (chart.risingSign || '—')

  renderPlanets(chart.planets)
  renderNodes(interp.nodes, chart.nodes)
  renderAspects(chart.aspects)
  loadChartSVG()

  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))
  document.querySelector('.tab[data-tab="wheel"]').classList.add('active')
  document.getElementById('tab-wheel').classList.add('active')
}

function renderPlanets(planets) {
  const grid = document.getElementById('planets-grid')
  grid.innerHTML = planets.map(p => `
    <div class="planet-card">
      <span class="planet-symbol">${p.symbol}</span>
      <div class="planet-info">
        <div class="planet-name">${p.nameZh}${p.retrograde ? ' <span style="color:var(--coral);font-size:10px">℞</span>' : ''}</div>
        <div class="planet-position">${p.signZh} ${p.degree.toFixed(1)}°</div>
        <div class="planet-house">第 ${p.house} 宮</div>
      </div>
    </div>
  `).join('')
}

function renderNodes(nodeInterp, nodeData) {
  const el = document.getElementById('nodes-content')
  el.innerHTML = `
    <div class="node-card north">
      <span class="node-tag">北交點 ☊ — 靈魂功課</span>
      <div class="node-title">${nodeInterp.north?.title || '北交點在 ' + nodeData.northSignZh}</div>
      <div class="node-text">
        <strong style="color:var(--teal)">功課：</strong>${nodeInterp.north?.lesson || '—'}<br>
        <strong style="color:var(--teal)">挑戰：</strong>${nodeInterp.north?.challenge || '—'}<br>
        <strong style="color:var(--teal)">宮位主題：</strong>第 ${nodeData.northHouse} 宮 — ${nodeInterp.north?.houseFocus || '—'}<br><br>
        ${nodeInterp.north?.guidance || ''}
      </div>
    </div>
    <div class="node-card south">
      <span class="node-tag">南交點 ☋ — 業力模式</span>
      <div class="node-title">南交點在 ${nodeData.southSignZh}（第 ${nodeData.southHouse} 宮）</div>
      <div class="node-text">
        <strong style="color:var(--coral)">過去世積累：</strong>${nodeInterp.south?.karmaPattern || '—'}<br>
        <strong style="color:var(--coral)">需要釋放：</strong>${nodeInterp.south?.release || '—'}
      </div>
    </div>
    <div class="synthesis-card">
      <strong style="color:var(--accent)">靈魂旅程總結：</strong><br>
      ${nodeInterp.synthesis || ''}
    </div>
  `
}

function renderAspects(aspects) {
  const list = document.getElementById('aspects-list')
  if (!aspects || !aspects.length) {
    list.innerHTML = '<p style="color:var(--text3);font-size:13px;padding:1rem 0">無顯著相位</p>'
    return
  }
  list.innerHTML = aspects.slice(0, 15).map(a => `
    <div class="aspect-row">
      <span class="aspect-planets">${a.planet1Zh} — ${a.planet2Zh}</span>
      <span class="aspect-type aspect-${a.harmonic}">${a.typeZh}</span>
      <span class="aspect-orb">${a.orb}°</span>
    </div>
  `).join('')
}

async function generateReport() {
  if (!currentChart) return
  const btn = document.getElementById('generate-btn')
  btn.disabled = true
  btn.textContent = '生成中...'
  const reportEl = document.getElementById('report-content')
  reportEl.style.display = 'block'
  reportEl.innerHTML = '<span style="color:var(--text3)">AI 正在分析你的命盤...</span>'
  currentAIReport = ''

  try {
    const res = await fetch('/api/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chart: currentChart, interpretation: currentInterpretation }),
    })
    if (!res.ok) throw new Error(`伺服器錯誤 (${res.status})`)

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    let buffer = ''
    reportEl.innerHTML = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const data = JSON.parse(line.slice(6))
          if (data.error) throw new Error(data.error)
          if (data.text) {
            fullText += data.text
            currentAIReport = fullText
            reportEl.innerHTML = formatReport(fullText)
          }
          if (data.done) {
            document.getElementById('topic-buttons').style.display = 'block'
            document.getElementById('pdf-row').style.display = 'block'
          }
        } catch (pe) { if (pe.message && !pe.message.includes('JSON')) throw pe }
      }
    }
    // 處理最後殘留
    if (buffer.startsWith('data: ')) {
      try {
        const data = JSON.parse(buffer.slice(6))
        if (data.done) {
          document.getElementById('topic-buttons').style.display = 'block'
          document.getElementById('pdf-row').style.display = 'block'
        }
      } catch {}
    }
  } catch (err) {
    reportEl.innerHTML = `<span style="color:var(--coral)">生成失敗：${escapeHtml(err.message)}</span>`
  } finally {
    btn.disabled = false
    btn.innerHTML = '<span>✦</span> 重新生成'
  }
}

function formatReport(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/## (.+)/g, '<h2 style="color:var(--accent);font-size:15px;margin:1.2rem 0 .4rem">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

async function getTopicAdvice(topic) {
  if (!currentChart) return
  const topicNames = { career:'事業與天賦', relationship:'愛情與關係', energy:'能量管理', spiritual:'靈性成長', finance:'財富豐盛' }
  const reportEl = document.getElementById('report-content')
  reportEl.style.display = 'block'
  reportEl.innerHTML = `<span style="color:var(--text3)">正在生成「${topicNames[topic] || topic}」深度建議...</span>`
  try {
    const res = await fetch('/api/topic-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, chart: currentChart, interpretation: currentInterpretation }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    currentAIReport = data.advice
    reportEl.innerHTML = formatReport(data.advice)
    document.getElementById('pdf-row').style.display = 'block'
  } catch (err) {
    reportEl.innerHTML = `<span style="color:var(--coral)">請求失敗：${escapeHtml(err.message)}</span>`
  }
}

async function loadChartSVG() {
  if (!currentChart) return
  const container = document.getElementById('chart-svg-container')
  container.innerHTML = '<p class="chart-loading-hint">正在繪製星盤...</p>'
  try {
    const res = await fetch('/api/chart-svg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chart: currentChart }),
    })
    if (!res.ok) throw new Error(`SVG 載入失敗 (${res.status})`)
    container.innerHTML = await res.text()
  } catch (err) {
    container.innerHTML = `<p class="chart-loading-hint" style="color:var(--coral)">星盤圖載入失敗：${escapeHtml(err.message)}</p>`
  }
}

async function exportPDF() {
  if (!currentChart) return
  const btns = document.querySelectorAll('.btn-pdf')
  btns.forEach(b => { b.textContent = '生成中...'; b.disabled = true })
  try {
    const res = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chart: currentChart, interpretation: currentInterpretation, aiReport: currentAIReport || null }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `PDF 生成失敗 (${res.status})`)
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const name = currentChart.birthData?.meta?.name || 'chart'
    const date = currentChart.birthData?.date
    a.download = `星圖-${name}-${date?.year || ''}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    alert('PDF 下載失敗：' + err.message)
  } finally {
    btns.forEach(b => { b.textContent = '↓ 下載 PDF 報告'; b.disabled = false })
  }
}

function showLoading(msg) {
  document.getElementById('form-section').style.display = 'none'
  document.getElementById('result-section').style.display = 'none'
  document.getElementById('loading-section').style.display = 'block'
  document.getElementById('loading-text').textContent = msg
}

function hideLoading() {
  document.getElementById('loading-section').style.display = 'none'
}

function resetForm() {
  document.getElementById('result-section').style.display = 'none'
  document.getElementById('loading-section').style.display = 'none'
  document.getElementById('form-section').style.display = 'block'
  document.getElementById('report-content').style.display = 'none'
  document.getElementById('report-content').innerHTML = ''
  document.getElementById('topic-buttons').style.display = 'none'
  document.getElementById('pdf-row').style.display = 'none'
  document.getElementById('generate-btn').disabled = false
  document.getElementById('generate-btn').innerHTML = '<span>✦</span> 生成 AI 人生規劃報告'
  document.getElementById('chart-svg-container').innerHTML = '<p class="chart-loading-hint">命盤圖載入中...</p>'
  currentChart = null
  currentInterpretation = null
  currentAIReport = ''
}
