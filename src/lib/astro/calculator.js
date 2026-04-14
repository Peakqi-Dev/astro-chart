/**
 * 占星計算引擎
 * 使用 astronomia 套件計算行星位置、交點、宮位、相位
 */

import { solar, moonphase, base, julian, sidereal } from 'astronomia'
import { SIGNS, ASPECTS, PLANETS } from '../../types/index.js'

// ─── 工具函式 ────────────────────────────────────────────

/**
 * 將黃道度數 (0–360) 轉換為星座與星座內度數
 */
export function longitudeToSign(lon) {
  const normalized = ((lon % 360) + 360) % 360
  const signIndex = Math.floor(normalized / 30)
  const degree = normalized % 30
  const sign = SIGNS[signIndex]
  return {
    sign: sign.id,
    signZh: sign.zh,
    signEn: sign.en,
    degree: parseFloat(degree.toFixed(2)),
    element: sign.element,
    quality: sign.quality,
  }
}

/**
 * 將日期時間轉為儒略日 (Julian Day Number)
 * timezone offset 單位：小時
 */
export function toJulianDay(year, month, day, hour, minute, tzOffset) {
  const fracDay = day + (hour + minute / 60) / 24
  return julian.CalendarGregorianToJD(year, month, fracDay)
}

/**
 * 解析 IANA timezone string 為當前 UTC offset (小時)
 * 例如 'Asia/Taipei' → 8
 */
export function getTimezoneOffset(timezone, year, month, day) {
  try {
    const date = new Date(`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}T12:00:00`)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    })
    const parts = formatter.formatToParts(date)
    const tzPart = parts.find(p => p.type === 'timeZoneName')?.value || 'UTC+0'
    const match = tzPart.match(/UTC([+-]\d+(?::\d+)?)/)
    if (!match) return 0
    const [h, m = '0'] = match[1].split(':')
    return parseInt(h) + parseInt(m) / 60
  } catch {
    return 0
  }
}

// ─── 行星位置計算 ────────────────────────────────────────

/**
 * 計算太陽位置（黃道度數）
 */
function calcSun(jd) {
  try {
    const lon = solar.apparentLongitude(base.J2000Century(jd))
    return ((lon * 180 / Math.PI) % 360 + 360) % 360
  } catch {
    // fallback: 簡化太陽計算
    const n = jd - 2451545.0
    const L = (280.46 + 0.9856474 * n) % 360
    const g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180
    return ((L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) + 360) % 360
  }
}

/**
 * 使用克卜勒方程式計算行星黃道經度
 * 參數來源：J2000.0 軌道要素
 */
function calcPlanetLongitude(jd, planet) {
  const T = (jd - 2451545.0) / 36525

  const elements = {
    mercury: { L: 252.251 + 149474.072 * T, M: 174.795 + 149472.515 * T, e: 0.20563 },
    venus:   { L: 181.980 + 58519.213 * T,  M: 50.416  + 58517.803 * T,  e: 0.00677 },
    mars:    { L: 355.433 + 19141.696 * T,  M: 19.387  + 19140.300 * T,  e: 0.09341 },
    jupiter: { L: 34.351  + 3036.302 * T,   M: 20.020  + 3034.906 * T,   e: 0.04839 },
    saturn:  { L: 50.077  + 1223.511 * T,   M: 317.021 + 1222.114 * T,   e: 0.05551 },
    uranus:  { L: 314.055 + 429.863 * T,    M: 141.050 + 428.379 * T,    e: 0.04630 },
    neptune: { L: 304.349 + 219.883 * T,    M: 256.225 + 218.459 * T,    e: 0.00899 },
    pluto:   { L: 238.929 + 145.186 * T,    M: 14.882  + 144.960 * T,    e: 0.24882 },
  }

  const el = elements[planet]
  if (!el) return 0

  const M = (el.M % 360) * Math.PI / 180
  // 克卜勒方程式（迭代解）
  let E = M
  for (let i = 0; i < 10; i++) {
    E = M + el.e * Math.sin(E)
  }
  const v = 2 * Math.atan2(
    Math.sqrt(1 + el.e) * Math.sin(E / 2),
    Math.sqrt(1 - el.e) * Math.cos(E / 2)
  )
  const lon = ((el.L - el.M * 180 / Math.PI + v * 180 / Math.PI) % 360 + 360) % 360
  return lon
}

/**
 * 計算月亮位置（簡化版，誤差約 1 度）
 */
function calcMoon(jd) {
  const T = (jd - 2451545.0) / 36525
  const L0 = 218.316 + 13.176396 * (jd - 2451545.0)
  const M  = (134.963 + 13.064993 * (jd - 2451545.0)) * Math.PI / 180
  const F  = (93.272  + 13.229350 * (jd - 2451545.0)) * Math.PI / 180
  const lon = L0 + 6.289 * Math.sin(M) - 1.274 * Math.sin(2 * F - M)
              + 0.658 * Math.sin(2 * F) - 0.186 * Math.sin(M * 2)
  return ((lon % 360) + 360) % 360
}

/**
 * 計算月亮交點（True Node）
 * 北交點（Rahu）的黃道度數
 */
function calcNorthNode(jd) {
  const T = (jd - 2451545.0) / 36525
  // 平均交點
  const omega = 125.0445 - 1934.1363 * T + 0.0020754 * T * T
  // 修正量（簡化）
  const M_sun  = (357.5291 + 35999.0503 * T) * Math.PI / 180
  const M_moon = (134.9634 + 477198.8676 * T) * Math.PI / 180
  const D      = (297.8502 + 445267.1115 * T) * Math.PI / 180
  const F      = (93.2721  + 483202.0175 * T) * Math.PI / 180
  const correction = -1.4979 * Math.sin(2 * (D - F))
                     - 0.1500 * Math.sin(M_sun)
                     - 0.1226 * Math.sin(2 * D)
                     + 0.1176 * Math.sin(2 * F)
  return ((omega + correction) % 360 + 360) % 360
}

// ─── 宮位計算（Placidus 分宮制）──────────────────────────

/**
 * 對角度取 180° 對宮
 */
function opp(deg) {
  return (deg + 180) % 360
}

/**
 * Placidus 宮頭插值：求赤經在 ASC–MC 間三等分的黃道經度
 * fraction: 1/3 → 第 11 宮, 2/3 → 第 12 宮
 */
function placidusCusp(lst, lat, eps, fraction) {
  // 使用迭代法近似 Placidus 宮頭
  const ascRA = lst
  const mcRA = lst - Math.PI / 2
  const targetRA = ascRA - fraction * Math.PI / 2

  // 將赤經轉換為黃道經度（近似）
  const lon = Math.atan2(
    Math.sin(targetRA) * Math.cos(eps) - Math.tan(lat * fraction) * Math.sin(eps),
    Math.cos(targetRA)
  )
  return ((lon * 180 / Math.PI) % 360 + 360) % 360
}

/**
 * 計算上升點（ASC）與宮位
 * 使用 Placidus 分宮制
 * latDeg: 緯度（度）, lonDeg: 經度（度）
 */
function calcHouses(jd, latDeg, lonDeg) {
  const T = (jd - 2451545.0) / 36525
  // 格林威治恆星時
  const GMST = (280.46061837 + 360.98564736629 * (jd - 2451545.0)
               + 0.000387933 * T * T - T * T * T / 38710000) % 360
  // 地方恆星時
  const LMST = ((GMST + lonDeg) % 360 + 360) % 360
  const lst = LMST * Math.PI / 180
  const lat = latDeg * Math.PI / 180
  // 黃赤交角
  const eps = (23.439291111 - 0.013004167 * T) * Math.PI / 180

  // 上升點計算（h1）
  const ascRad = Math.atan2(
    Math.cos(lst),
    -(Math.sin(lst) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps))
  )
  const asc = ((ascRad * 180 / Math.PI) % 360 + 360) % 360

  // 中天（MC = h10）
  const mc = ((Math.atan2(Math.sin(lst) * Math.cos(eps), Math.cos(lst)) * 180 / Math.PI) % 360 + 360) % 360

  // Placidus 中間宮頭
  const h11 = placidusCusp(lst, lat, eps, 1 / 3)
  const h12 = placidusCusp(lst, lat, eps, 2 / 3)
  const h2 = placidusCusp(lst + Math.PI, lat, eps, 2 / 3)
  const h3 = placidusCusp(lst + Math.PI, lat, eps, 1 / 3)

  // Placidus cusps：下半球為對宮
  // h1=ASC, h2, h3, h4=IC(opp MC), h5=opp(h11), h6=opp(h12),
  // h7=opp(h1), h8=opp(h2), h9=opp(h3), h10=MC, h11, h12
  const cusps = [
    asc,        // h1
    h2,         // h2
    h3,         // h3
    opp(mc),    // h4 = IC
    opp(h11),   // h5
    opp(h12),   // h6
    opp(asc),   // h7 = DSC
    opp(h2),    // h8 = opp(h2)
    opp(h3),    // h9 = opp(h3)
    mc,         // h10 = MC
    h11,        // h11
    h12,        // h12
  ]

  return { cusps, ascendant: asc, mc, system: 'placidus' }
}

/**
 * 根據行星黃道度數判斷所在宮位
 */
function getPlanetHouse(longitude, cusps) {
  for (let i = 0; i < 12; i++) {
    const start = cusps[i]
    const end = cusps[(i + 1) % 12]
    if (start < end) {
      if (longitude >= start && longitude < end) return i + 1
    } else {
      // 跨越 0 度（牡羊座起點）
      if (longitude >= start || longitude < end) return i + 1
    }
  }
  return 1
}

// ─── 相位計算 ────────────────────────────────────────────

function calcAspects(planets) {
  const aspects = []
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const diff = Math.abs(planets[i].longitude - planets[j].longitude)
      const angle = diff > 180 ? 360 - diff : diff

      for (const asp of ASPECTS) {
        const orb = Math.abs(angle - asp.angle)
        if (orb <= asp.orb) {
          aspects.push({
            planet1: planets[i].id,
            planet1Zh: planets[i].nameZh,
            planet2: planets[j].id,
            planet2Zh: planets[j].nameZh,
            type: asp.name,
            typeZh: asp.zh,
            orb: parseFloat(orb.toFixed(2)),
            harmonic: asp.harmonic,
            applying: planets[i].longitude < planets[j].longitude ? 'applying' : 'separating',
          })
          break
        }
      }
    }
  }
  return aspects.sort((a, b) => a.orb - b.orb)
}

// ─── 主要計算函式 ────────────────────────────────────────

/**
 * 計算完整命盤
 * @param {import('../../types/index.js').BirthData} birthData
 * @returns {import('../../types/index.js').NatalChart}
 */
export async function calculateNatalChart(birthData) {
  const { date, time, location } = birthData

  // 取得時區偏移
  const tzOffset = getTimezoneOffset(location.timezone, date.year, date.month, date.day)

  // 計算儒略日
  const actualHour = time.precision === 'unknown' ? 12 : time.hour
  const actualMinute = time.precision === 'unknown' ? 0 : time.minute
  const jd = toJulianDay(date.year, date.month, date.day, actualHour, actualMinute, tzOffset)

  // 計算各行星位置
  const sunLon     = calcSun(jd)
  const moonLon    = calcMoon(jd)
  const mercuryLon = calcPlanetLongitude(jd, 'mercury')
  const venusLon   = calcPlanetLongitude(jd, 'venus')
  const marsLon    = calcPlanetLongitude(jd, 'mars')
  const jupiterLon = calcPlanetLongitude(jd, 'jupiter')
  const saturnLon  = calcPlanetLongitude(jd, 'saturn')
  const uranusLon  = calcPlanetLongitude(jd, 'uranus')
  const neptuneLon = calcPlanetLongitude(jd, 'neptune')
  const plutoLon   = calcPlanetLongitude(jd, 'pluto')

  // 計算交點
  const northNodeLon = calcNorthNode(jd)
  const southNodeLon = (northNodeLon + 180) % 360

  // 計算宮位
  const houses = time.precision === 'unknown'
    ? { cusps: Array.from({length:12},(_,i)=>i*30), ascendant: 0, mc: 270, system: 'equal-noon' }
    : calcHouses(jd, location.latitude, location.longitude)

  // 組合行星資料
  const rawPlanets = [
    { id: 'sun',     longitude: sunLon     },
    { id: 'moon',    longitude: moonLon    },
    { id: 'mercury', longitude: mercuryLon },
    { id: 'venus',   longitude: venusLon   },
    { id: 'mars',    longitude: marsLon    },
    { id: 'jupiter', longitude: jupiterLon },
    { id: 'saturn',  longitude: saturnLon  },
    { id: 'uranus',  longitude: uranusLon  },
    { id: 'neptune', longitude: neptuneLon },
    { id: 'pluto',   longitude: plutoLon   },
  ]

  // 逆行判斷：計算前一天的行星位置，若今日 < 昨日 => 逆行
  const jdYesterday = jd - 1
  const retrogradeMap = {}
  for (const p of rawPlanets) {
    if (p.id === 'sun' || p.id === 'moon') {
      retrogradeMap[p.id] = false // 太陽月亮不逆行
      continue
    }
    const lonYesterday = calcPlanetLongitude(jdYesterday, p.id)
    // 處理跨越 0°/360° 的邊界
    let diff = p.longitude - lonYesterday
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360
    retrogradeMap[p.id] = diff < 0
  }

  const planets = rawPlanets.map(p => {
    const meta = PLANETS.find(pl => pl.id === p.id)
    const signInfo = longitudeToSign(p.longitude)
    return {
      id: p.id,
      name: p.id.charAt(0).toUpperCase() + p.id.slice(1),
      nameZh: meta.nameZh,
      symbol: meta.symbol,
      longitude: parseFloat(p.longitude.toFixed(4)),
      ...signInfo,
      house: getPlanetHouse(p.longitude, houses.cusps),
      retrograde: retrogradeMap[p.id] || false,
    }
  })

  // 交點資料
  const northSignInfo = longitudeToSign(northNodeLon)
  const southSignInfo = longitudeToSign(southNodeLon)
  const nodes = {
    northLongitude: parseFloat(northNodeLon.toFixed(4)),
    northSign: northSignInfo.sign,
    northSignZh: northSignInfo.signZh,
    northDegree: northSignInfo.degree,
    northHouse: getPlanetHouse(northNodeLon, houses.cusps),
    southLongitude: parseFloat(southNodeLon.toFixed(4)),
    southSign: southSignInfo.sign,
    southSignZh: southSignInfo.signZh,
    southDegree: southSignInfo.degree,
    southHouse: getPlanetHouse(southNodeLon, houses.cusps),
  }

  // 相位計算
  const aspects = calcAspects(planets)

  // 主要星座
  const sunSign = longitudeToSign(sunLon)
  const moonSign = longitudeToSign(moonLon)
  const risingSign = longitudeToSign(houses.ascendant)

  return {
    birthData,
    planets,
    nodes,
    aspects,
    houses,
    sunSign: sunSign.signZh,
    moonSign: moonSign.signZh,
    risingSign: risingSign.signZh,
    ascendantDegree: parseFloat(houses.ascendant.toFixed(4)),
    julianDay: parseFloat(jd.toFixed(6)),
    timePrecision: time.precision,
    locationPrecision: location.precision,
    calculatedAt: new Date().toISOString(),
  }
}
