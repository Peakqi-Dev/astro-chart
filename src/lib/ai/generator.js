/**
 * AI 生成層 — 使用 Claude API 產生個人化人生規劃與能量建議
 */

// lazy import 以加速 server 啟動
let client
async function getClient() {
  if (!client) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    client = new Anthropic()
  }
  return client
}
import { NORTH_NODE_SIGNS, SOUTH_NODE_SIGNS, NORTH_NODE_HOUSES } from '../astro/interpretations.js'

// ─── Prompt 建構 ──────────────────────────────────────────

function buildChartSummary(chart, interpretation) {
  const { planets, nodes, houses } = chart
  const sun = planets.find(p => p.id === 'sun')
  const moon = planets.find(p => p.id === 'moon')
  const mercury = planets.find(p => p.id === 'mercury')
  const venus = planets.find(p => p.id === 'venus')
  const mars = planets.find(p => p.id === 'mars')
  const jupiter = planets.find(p => p.id === 'jupiter')
  const saturn = planets.find(p => p.id === 'saturn')

  const northInterp = NORTH_NODE_SIGNS[nodes.northSign] || {}
  const southInterp = SOUTH_NODE_SIGNS[nodes.southSign] || {}
  const houseInterp = NORTH_NODE_HOUSES[nodes.northHouse] || {}

  const topAspects = chart.aspects.slice(0, 6).map(a =>
    `${a.planet1Zh}${a.typeZh}${a.planet2Zh}（容許度 ${a.orb}°，${a.harmonic === 'soft' ? '柔和' : a.harmonic === 'hard' ? '緊張' : '中性'}）`
  ).join('；')

  return `
【命盤基本資料】
太陽：${sun?.signZh} 第 ${sun?.house} 宮
月亮：${moon?.signZh} 第 ${moon?.house} 宮
上升：${chart.risingSign}
水星：${mercury?.signZh} 第 ${mercury?.house} 宮
金星：${venus?.signZh} 第 ${venus?.house} 宮
火星：${mars?.signZh} 第 ${mars?.house} 宮
木星：${jupiter?.signZh} 第 ${jupiter?.house} 宮
土星：${saturn?.signZh} 第 ${saturn?.house} 宮

【靈魂節點】
北交點：${nodes.northSignZh} 第 ${nodes.northHouse} 宮
南交點：${nodes.southSignZh} 第 ${nodes.southHouse} 宮
北交點功課：${northInterp.lesson || ''}
業力模式：${southInterp.karmaPattern || ''}
宮位主題：${houseInterp.theme || ''}

【主要相位】
${topAspects || '無顯著相位'}

【元素分佈】
${interpretation?.keyThemes?.summary || ''}
`.trim()
}

// ─── 生成函式 ─────────────────────────────────────────────

/**
 * 生成完整人生規劃報告（串流版）
 * @param {object} chart - 命盤資料
 * @param {object} interpretation - 靜態詮釋
 * @param {Function} onChunk - 接收串流文字的 callback
 */
export async function generateLifePlan(chart, interpretation, onChunk) {
  const chartSummary = buildChartSummary(chart, interpretation)

  const systemPrompt = `你是一位資深的西洋占星師與靈性引導師，擁有深厚的心理占星學背景。
你的語氣溫暖而具有洞察力，能夠將占星符號語言轉化為實際可行的生命指引。
你相信占星是一個自我認識的工具，不是命運的枷鎖。
請用繁體中文回應，語氣真誠而有深度，避免過於神秘化或迷信化的表達。`

  const userPrompt = `根據以下命盤資料，請為這位使用者生成一份完整的人生規劃與能量建議報告。

${chartSummary}

請按照以下結構輸出，每個段落都要具體、有深度，結合命盤具體行星位置給出個人化建議：

## 靈魂使命概覽
（2-3段，整合太陽、北交點、上升點說明這一世的核心使命）

## 業力功課與成長方向
（說明南交點帶來的舊模式，以及北交點指引的成長方向，給出具體的練習建議）

## 人生三大核心主題
（根據命盤最突出的配置，點出三個這一世特別需要面對的主題，每個主題給出 2-3 個具體行動建議）

## 事業與天賦方向
（根據太陽、水星、第 10 宮、木星位置，說明天賦所在與適合的事業方向）

## 關係模式與愛情
（根據金星、第 7 宮、月亮，說明關係模式、吸引力法則與親密關係建議）

## 能量轉化實踐建議
（5-7 個具體的日常練習，說明如何在生活中轉化命盤能量，每個練習要有可執行的步驟）

## 當前發展重點
（根據土星與北交點位置，說明目前人生階段最重要的功課）`

  const cl = await getClient()
  const stream = await cl.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  let fullText = ''
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      fullText += chunk.delta.text
      if (onChunk) onChunk(chunk.delta.text)
    }
  }

  return fullText
}

/**
 * 生成單一主題的深度建議（用於使用者追問）
 * @param {string} topic - 主題關鍵字
 * @param {object} chart - 命盤資料
 */
export async function generateTopicAdvice(topic, chart, interpretation) {
  const chartSummary = buildChartSummary(chart, interpretation)

  const topicPrompts = {
    career:       '請針對事業與職涯發展，給出更深入、具體的建議',
    relationship: '請針對感情與人際關係，給出更深入、具體的建議',
    energy:       '請針對能量管理與身心健康，給出更深入、具體的練習',
    spiritual:    '請針對靈性成長與意識提升，給出更深入、具體的修行建議',
    finance:      '請針對財務與物質豐盛，給出更深入、具體的建議',
  }

  const prompt = topicPrompts[topic] || `請針對「${topic}」這個主題，給出更深入的占星解析與建議`

  const cl = await getClient()
  const response = await cl.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: '你是一位資深西洋占星師，用繁體中文回應，語氣溫暖而具體。',
    messages: [{
      role: 'user',
      content: `${chartSummary}\n\n${prompt}`
    }],
  })

  return response.content[0].text
}
