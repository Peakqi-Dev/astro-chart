/**
 * 輸入驗證 middleware
 */

// Intl.supportedValuesOf 不含 'UTC'，手動補入常用別名
const VALID_TIMEZONES = new Set([
  ...Intl.supportedValuesOf('timeZone'),
  'UTC', 'GMT', 'Etc/UTC', 'Etc/GMT',
])

export function validateBirthData(req, res, next) {
  const errors = []
  const data = req.body

  // ── 日期驗證 ──────────────────────────────────────────
  const { year, month, day } = data.date || {}

  if (!year || !Number.isInteger(year) || year < 1900 || year > 2025) {
    errors.push('年份需介於 1900–2025 年')
  }
  if (!month || !Number.isInteger(month) || month < 1 || month > 12) {
    errors.push('月份需介於 1–12')
  }
  if (year && month && day) {
    const maxDay = new Date(year, month, 0).getDate() // getDate() of day 0 = last day of previous month
    if (!Number.isInteger(day) || day < 1 || day > maxDay) {
      errors.push(`${year}年${month}月最多只有 ${maxDay} 天`)
    }
  }

  // ── 時間驗證 ──────────────────────────────────────────
  const { hour, minute, precision: timePrecision } = data.time || {}

  if (timePrecision !== 'unknown') {
    if (hour === undefined || hour === null || !Number.isInteger(hour) || hour < 0 || hour > 23) {
      errors.push('小時需介於 0–23')
    }
    if (minute === undefined || minute === null || !Number.isInteger(minute) || minute < 0 || minute > 59) {
      errors.push('分鐘需介於 0–59')
    }
  }

  // ── 地點驗證 ──────────────────────────────────────────
  const { latitude, longitude, timezone, precision: locPrecision } = data.location || {}

  if (locPrecision !== 'unknown') {
    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      errors.push('緯度需介於 -90 到 90')
    }
    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      errors.push('經度需介於 -180 到 180')
    }
    if (!timezone || !VALID_TIMEZONES.has(timezone)) {
      errors.push(`時區 "${timezone}" 無效，請使用 IANA 格式（如 Asia/Taipei）`)
    }
  }

  // ── 選填欄位 ──────────────────────────────────────────
  if (data.meta?.name && typeof data.meta.name !== 'string') {
    errors.push('姓名必須為字串')
  }
  if (data.meta?.name) {
    // XSS 清理：移除 HTML 標籤
    data.meta.name = data.meta.name.replace(/<[^>]*>/g, '').trim().slice(0, 50)
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors })
  }

  next()
}
