/**
 * API Routes
 */

import { Router } from 'express'
import { validateBirthData } from '../middleware/validate.js'
import { generateInterpretation } from '../lib/astro/interpretations.js'
import { generateChartSVG } from '../lib/astro/chartSVG.js'

// 慢速模組改為 lazy import，加速 server 啟動
const lazy = {
  async calculator() { return import('../lib/astro/calculator.js') },
  async generator()  { return import('../lib/ai/generator.js') },
  async pdfReport()  { return import('../lib/astro/pdfReport.js') },
}

const router = Router()

// ─── POST /api/calculate ──────────────────────────────────
router.post('/calculate', validateBirthData, async (req, res) => {
  try {
    const { calculateNatalChart } = await lazy.calculator()
    const chart = await calculateNatalChart(req.body)
    const interpretation = generateInterpretation(chart)
    res.json({ success: true, chart, interpretation })
  } catch (err) {
    console.error('計算錯誤:', err)
    res.status(500).json({ success: false, error: '命盤計算失敗：' + err.message })
  }
})

// ─── POST /api/chart-svg ──────────────────────────────────
// 回傳 SVG 命盤圖
router.post('/chart-svg', async (req, res) => {
  const { chart } = req.body
  if (!chart) return res.status(400).json({ success: false, error: '缺少命盤資料' })
  try {
    const svg = generateChartSVG(chart)
    res.setHeader('Content-Type', 'image/svg+xml')
    res.send(svg)
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── POST /api/generate-report (SSE 串流) ─────────────────
router.post('/generate-report', async (req, res) => {
  const { chart, interpretation } = req.body
  if (!chart || !interpretation) {
    return res.status(400).json({ success: false, error: '缺少命盤資料' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  try {
    const { generateLifePlan } = await lazy.generator()
    await generateLifePlan(chart, interpretation, (chunk) => {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`)
    })
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
  } catch (err) {
    console.error('AI 生成錯誤:', err)
    res.write(`data: ${JSON.stringify({ error: 'AI 生成失敗：' + err.message })}\n\n`)
  } finally {
    res.end()
  }
})

// ─── POST /api/topic-advice ───────────────────────────────
router.post('/topic-advice', async (req, res) => {
  const { topic, chart, interpretation } = req.body
  if (!topic || !chart) {
    return res.status(400).json({ success: false, error: '缺少主題或命盤資料' })
  }
  try {
    const { generateTopicAdvice } = await lazy.generator()
    const advice = await generateTopicAdvice(topic, chart, interpretation)
    res.json({ success: true, advice })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── POST /api/export-pdf ─────────────────────────────────
router.post('/export-pdf', async (req, res) => {
  const { chart, interpretation, aiReport } = req.body
  if (!chart) return res.status(400).json({ success: false, error: '缺少命盤資料' })

  try {
    const { generatePDFReport } = await lazy.pdfReport()
    const pdfBuffer = await generatePDFReport(chart, interpretation, aiReport || null)
    const name = chart.birthData?.meta?.name || 'chart'
    const filename = `astro-${name}-${chart.birthData.date.year}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
    res.send(pdfBuffer)
  } catch (err) {
    console.error('PDF 生成錯誤:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── GET /api/health ──────────────────────────────────────
router.get('/health', (_, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

export default router
