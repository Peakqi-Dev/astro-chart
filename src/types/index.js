/**
 * 核心型別定義（JSDoc 格式，提供 IDE 提示）
 *
 * @typedef {Object} BirthData
 * @property {{ year: number, month: number, day: number }} date
 * @property {{ hour: number, minute: number, precision: 'exact'|'unknown' }} time
 * @property {{ cityName: string, latitude: number, longitude: number, timezone: string, precision: 'exact'|'unknown' }} location
 * @property {{ name?: string, gender?: 'female'|'male'|'nonbinary'|'unspecified' }} [meta]
 *
 * @typedef {Object} PlanetPosition
 * @property {string} name      - 行星名稱
 * @property {string} nameZh    - 中文名稱
 * @property {number} longitude - 黃道度數 (0–360)
 * @property {string} sign      - 所在星座
 * @property {string} signZh    - 星座中文
 * @property {number} degree    - 星座內度數 (0–30)
 * @property {number} house     - 所在宮位 (1–12)
 * @property {boolean} retrograde - 是否逆行
 *
 * @typedef {Object} NorthSouthNode
 * @property {number} northLongitude - 北交點黃道度數
 * @property {string} northSign
 * @property {string} northSignZh
 * @property {number} northHouse
 * @property {number} southLongitude - 南交點黃道度數
 * @property {string} southSign
 * @property {string} southSignZh
 * @property {number} southHouse
 *
 * @typedef {Object} Aspect
 * @property {string} planet1
 * @property {string} planet2
 * @property {string} type      - conjunction, opposition, trine, square, sextile
 * @property {string} typeZh
 * @property {number} orb       - 容許度 (度)
 * @property {'applying'|'separating'} applying
 *
 * @typedef {Object} HouseSystem
 * @property {number[]} cusps   - 12 宮頭度數 [0]=1st house, [11]=12th house
 * @property {number} ascendant - 上升點度數
 * @property {number} mc        - 中天度數
 * @property {string} system    - 'placidus'
 *
 * @typedef {Object} NatalChart
 * @property {BirthData} birthData
 * @property {PlanetPosition[]} planets
 * @property {NorthSouthNode} nodes
 * @property {Aspect[]} aspects
 * @property {HouseSystem} houses
 * @property {string} sunSign
 * @property {string} moonSign
 * @property {string} risingSign
 * @property {number} julianDay
 * @property {string} calculatedAt
 */

export const PLANETS = [
  { id: 'sun',     nameZh: '太陽',   symbol: '☉' },
  { id: 'moon',    nameZh: '月亮',   symbol: '☽' },
  { id: 'mercury', nameZh: '水星',   symbol: '☿' },
  { id: 'venus',   nameZh: '金星',   symbol: '♀' },
  { id: 'mars',    nameZh: '火星',   symbol: '♂' },
  { id: 'jupiter', nameZh: '木星',   symbol: '♃' },
  { id: 'saturn',  nameZh: '土星',   symbol: '♄' },
  { id: 'uranus',  nameZh: '天王星', symbol: '⛢' },
  { id: 'neptune', nameZh: '海王星', symbol: '♆' },
  { id: 'pluto',   nameZh: '冥王星', symbol: '♇' },
]

export const SIGNS = [
  { id: 'aries',       zh: '牡羊座', en: 'Aries',       element: 'fire',  quality: 'cardinal', ruler: 'mars'    },
  { id: 'taurus',      zh: '金牛座', en: 'Taurus',      element: 'earth', quality: 'fixed',    ruler: 'venus'   },
  { id: 'gemini',      zh: '雙子座', en: 'Gemini',      element: 'air',   quality: 'mutable',  ruler: 'mercury' },
  { id: 'cancer',      zh: '巨蟹座', en: 'Cancer',      element: 'water', quality: 'cardinal', ruler: 'moon'    },
  { id: 'leo',         zh: '獅子座', en: 'Leo',         element: 'fire',  quality: 'fixed',    ruler: 'sun'     },
  { id: 'virgo',       zh: '處女座', en: 'Virgo',       element: 'earth', quality: 'mutable',  ruler: 'mercury' },
  { id: 'libra',       zh: '天秤座', en: 'Libra',       element: 'air',   quality: 'cardinal', ruler: 'venus'   },
  { id: 'scorpio',     zh: '天蠍座', en: 'Scorpio',     element: 'water', quality: 'fixed',    ruler: 'pluto'   },
  { id: 'sagittarius', zh: '射手座', en: 'Sagittarius', element: 'fire',  quality: 'mutable',  ruler: 'jupiter' },
  { id: 'capricorn',   zh: '魔羯座', en: 'Capricorn',   element: 'earth', quality: 'cardinal', ruler: 'saturn'  },
  { id: 'aquarius',    zh: '水瓶座', en: 'Aquarius',    element: 'air',   quality: 'fixed',    ruler: 'uranus'  },
  { id: 'pisces',      zh: '雙魚座', en: 'Pisces',      element: 'water', quality: 'mutable',  ruler: 'neptune' },
]

export const ASPECTS = [
  { name: 'conjunction', zh: '合相', angle: 0,   orb: 8,  harmonic: 'neutral' },
  { name: 'opposition',  zh: '對分', angle: 180, orb: 8,  harmonic: 'hard'    },
  { name: 'trine',       zh: '三分', angle: 120, orb: 8,  harmonic: 'soft'    },
  { name: 'square',      zh: '四分', angle: 90,  orb: 8,  harmonic: 'hard'    },
  { name: 'sextile',     zh: '六分', angle: 60,  orb: 6,  harmonic: 'soft'    },
  { name: 'quincunx',    zh: '補十二', angle: 150, orb: 3, harmonic: 'neutral' },
]

export const HOUSES_ZH = [
  '', '自我宮', '財富宮', '溝通宮', '家庭宮', '創作宮', '健康宮',
  '關係宮', '轉化宮', '哲學宮', '事業宮', '友誼宮', '靈性宮'
]
