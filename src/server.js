/**
 * 占星命盤系統 — Express Server
 */

import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import 'dotenv/config'
import apiRouter from './routes/api.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(express.static(join(__dirname, '../public')))

// API routes
app.use('/api', apiRouter)

// SPA fallback
app.get('*', (_, res) => {
  res.sendFile(join(__dirname, '../public/index.html'))
})

app.listen(PORT, () => {
  console.log(`\n🌟 占星命盤系統運行中`)
  console.log(`   http://localhost:${PORT}`)
  console.log(`   API: http://localhost:${PORT}/api/health\n`)
})
