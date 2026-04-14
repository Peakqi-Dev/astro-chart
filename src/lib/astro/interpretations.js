/**
 * 占星詮釋資料庫
 * 南北交點 × 12 星座 × 12 宮位 的靜態詮釋文本
 */

// ─── 北交點 × 星座詮釋 ───────────────────────────────────

export const NORTH_NODE_SIGNS = {
  aries: {
    title: '北交點在牡羊座 — 靈魂功課：獨立與勇氣',
    lesson: '學習獨立自主，勇於先行，建立自我認同',
    challenge: '放下對他人認同的依賴，克服猶豫不決的慣性',
    energy: '行動力、領導力、自我表達',
    karmaFrom: '過去世習慣依賴他人、追求和諧而犧牲自我',
    guidance: '這一世需要學習先照顧自己的需求，勇於衝突而非逃避，成為自己的英雄',
  },
  taurus: {
    title: '北交點在金牛座 — 靈魂功課：穩定與價值',
    lesson: '學習建立物質基礎，享受當下，培養耐心',
    challenge: '放下對死亡、轉化、他人資源的執著',
    energy: '穩定、感官享受、自我價值',
    karmaFrom: '過去世深陷權力、控制、強烈情緒的漩渦',
    guidance: '這一世需要學習慢下來，透過簡單的物質享受找到生命意義，建立屬於自己的財務安全感',
  },
  gemini: {
    title: '北交點在雙子座 — 靈魂功課：溝通與好奇',
    lesson: '學習多元觀點，輕鬆溝通，保持好奇心',
    challenge: '放下對真理的執著，接受不確定性',
    energy: '溝通、學習、靈活思維',
    karmaFrom: '過去世習慣哲學性思考，偏好宏觀而忽略細節',
    guidance: '這一世需要學習傾聽，在日常對話中找到智慧，建立多樣化的社交連結',
  },
  cancer: {
    title: '北交點在巨蟹座 — 靈魂功課：情感與歸屬',
    lesson: '學習情感連結，建立家庭與根基',
    challenge: '放下對社會地位的執著，允許自己脆弱',
    energy: '情感、家庭、直覺、滋養',
    karmaFrom: '過去世過度重視事業成就，忽略情感需求',
    guidance: '這一世需要學習照顧自己的內在小孩，建立真正的情感連結，將家庭視為神聖空間',
  },
  leo: {
    title: '北交點在獅子座 — 靈魂功課：創意與愛',
    lesson: '學習自我表達，帶著愛領導，發光發熱',
    challenge: '放下群體歸屬感的需求，勇於成為焦點',
    energy: '創造力、自我表達、愛、戲劇性',
    karmaFrom: '過去世習慣融入群體，隱藏個人特質',
    guidance: '這一世需要學習讓自己被看見，相信自己有值得分享的獨特天賦',
  },
  virgo: {
    title: '北交點在處女座 — 靈魂功課：服務與精確',
    lesson: '學習實際技能，在細節中找到神聖，服務他人',
    challenge: '放下對完美精神現實的追求，落地實踐',
    energy: '分析、服務、健康、精確',
    karmaFrom: '過去世漂浮在理想與靈性世界，逃避現實責任',
    guidance: '這一世需要學習在日常工作中找到意義，用身體智慧而非只用思維來生活',
  },
  libra: {
    title: '北交點在天秤座 — 靈魂功課：關係與平衡',
    lesson: '學習合作、和諧共處，在關係中成長',
    challenge: '放下自我中心的衝動，學習考慮他人感受',
    energy: '關係、美感、公正、合作',
    karmaFrom: '過去世習慣單打獨鬥，以自我意志推動一切',
    guidance: '這一世需要學習在關係中找到鏡子，透過他人眼睛認識自己',
  },
  scorpio: {
    title: '北交點在天蠍座 — 靈魂功課：轉化與深度',
    lesson: '學習情感深度，面對陰暗面，經歷死亡與重生',
    challenge: '放下對安全感和舒適的執著，擁抱未知',
    energy: '轉化、心理深度、神秘、力量',
    karmaFrom: '過去世習慣依賴物質安全感，逃避深度情感',
    guidance: '這一世需要學習讓舊有模式死去，在最深的脆弱中找到真正的力量',
  },
  sagittarius: {
    title: '北交點在射手座 — 靈魂功課：信念與擴展',
    lesson: '學習信仰、冒險、探索更大的真理',
    challenge: '放下對細節的執著，信任更大的計畫',
    energy: '哲學、冒險、信念、自由',
    karmaFrom: '過去世習慣分析細節，在資料中迷失方向感',
    guidance: '這一世需要學習相信直覺，跳出舒適圈去探索，找到屬於自己的人生哲學',
  },
  capricorn: {
    title: '北交點在魔羯座 — 靈魂功課：責任與成就',
    lesson: '學習紀律、在世界上建立影響力',
    challenge: '放下情緒化的依賴，建立成熟的自我管理',
    energy: '紀律、成就、結構、傳承',
    karmaFrom: '過去世過度依賴家庭與情緒連結，缺乏獨立性',
    guidance: '這一世需要學習承擔責任，在世界上留下有意義的足跡',
  },
  aquarius: {
    title: '北交點在水瓶座 — 靈魂功課：社群與創新',
    lesson: '學習服務社群，帶來改革，超越個人自我',
    challenge: '放下對個人榮耀的執著，為更大的整體服務',
    energy: '人道主義、創新、友誼、改革',
    karmaFrom: '過去世習慣透過個人魅力和權威獲得認可',
    guidance: '這一世需要學習將獨特才能貢獻給群體，成為時代的變革者',
  },
  pisces: {
    title: '北交點在雙魚座 — 靈魂功課：慈悲與靈性',
    lesson: '學習放手、慈悲、信任更高的力量',
    challenge: '放下對控制、完美的執著，融入流動',
    energy: '靈性、慈悲、直覺、療癒',
    karmaFrom: '過去世習慣分析和批判，用理性控制一切',
    guidance: '這一世需要學習放下自我，在服務和靈性實踐中找到意義',
  },
}

// ─── 南交點 × 星座詮釋 ───────────────────────────────────

export const SOUTH_NODE_SIGNS = {
  aries:       { karmaPattern: '過去世的戰士、先驅者，習慣衝動行動', release: '釋放衝動、自我中心、過度競爭的模式' },
  taurus:      { karmaPattern: '過去世的守護者、農夫，習慣囤積與固執', release: '釋放對安全感的過度執著、物質主義' },
  gemini:      { karmaPattern: '過去世的溝通者、信使，習慣表面流動', release: '釋放分散注意力、焦慮性思考的模式' },
  cancer:      { karmaPattern: '過去世的照顧者、家長，習慣情感依附', release: '釋放過度保護、情緒化反應的慣性' },
  leo:         { karmaPattern: '過去世的國王、表演者，習慣中心舞台', release: '釋放自我中心、需要掌聲的驅動力' },
  virgo:       { karmaPattern: '過去世的工匠、療癒者，習慣挑剔細節', release: '釋放完美主義、過度批判的慣性思維' },
  libra:       { karmaPattern: '過去世的外交官、藝術家，習慣取悅他人', release: '釋放優柔寡斷、避免衝突的應對模式' },
  scorpio:     { karmaPattern: '過去世的神秘主義者，習慣控制與強烈情緒', release: '釋放執念、嫉妒、操控的心理模式' },
  sagittarius: { karmaPattern: '過去世的哲學家、探險家，習慣高談闊論', release: '釋放說教、逃避責任、虛假樂觀的模式' },
  capricorn:   { karmaPattern: '過去世的領袖、父親，習慣控制與成就導向', release: '釋放對權力、規則、地位的過度依賴' },
  aquarius:    { karmaPattern: '過去世的革命者，習慣反抗體制', release: '釋放冷漠疏離、脫離現實、反抗為反抗的模式' },
  pisces:      { karmaPattern: '過去世的修行者，習慣逃入靈性世界', release: '釋放受害心態、逃避現實、缺乏界限的慣性' },
}

// ─── 交點 × 宮位詮釋 ─────────────────────────────────────

export const NORTH_NODE_HOUSES = {
  1:  { theme: '自我認同與個人形象', focus: '學習建立清晰的自我認同，勇敢展現真實的自己' },
  2:  { theme: '財務自主與自我價值', focus: '學習建立財務獨立，認識自身的真實價值' },
  3:  { theme: '溝通學習與短途探索', focus: '學習表達想法，建立在地社群連結' },
  4:  { theme: '家庭根基與情感安全', focus: '學習建立穩固的家庭基礎，滋養內在' },
  5:  { theme: '創造力與自我表達', focus: '學習透過藝術、戀愛、遊戲來表達生命力' },
  6:  { theme: '日常服務與身心健康', focus: '學習在日常工作中找到意義，照顧身體健康' },
  7:  { theme: '伴侶關係與合作', focus: '學習在深度關係中找到成長，建立真正的平等合作' },
  8:  { theme: '死亡轉化與共享資源', focus: '學習面對死亡、轉變，以及心理深層的自我探索' },
  9:  { theme: '高等教育與哲學信念', focus: '學習追尋更高的真理，踏上信仰的旅程' },
  10: { theme: '事業成就與公眾形象', focus: '學習在公眾舞台上展現才能，建立有意義的事業' },
  11: { theme: '社群友誼與集體夢想', focus: '學習與志同道合的人合作，為更大的願景服務' },
  12: { theme: '靈性修行與隱退', focus: '學習放下自我，進入靜默，在服務中找到靈性意義' },
}

// ─── 行星 × 星座詮釋（精選重要組合）────────────────────

export const PLANET_SIGN_KEYWORDS = {
  sun: {
    aries: '充滿活力的先驅者，天生的領導者',
    taurus: '穩健踏實，重視物質與感官享受',
    gemini: '聰明好奇，擅長溝通與資訊整合',
    cancer: '情感豐富，重視家庭與情感連結',
    leo: '光芒四射，慷慨大方，渴望被欣賞',
    virgo: '分析精準，重視細節與實際服務',
    libra: '追求和諧，天生的外交家與藝術家',
    scorpio: '強烈深邃，洞察力強，追求真相',
    sagittarius: '樂觀開朗，熱愛自由與哲學探索',
    capricorn: '嚴謹自律，有強烈的成就動機',
    aquarius: '獨特前衛，重視人道與集體進步',
    pisces: '感受細膩，富有同理心與靈感',
  },
  moon: {
    aries: '情緒直接快速，需要行動來釋放感受',
    taurus: '情緒穩定，需要安全感與身體舒適',
    gemini: '情緒善變，透過溝通處理感受',
    cancer: '情感豐富，高度感受性，重視家庭',
    leo: '需要被認可，情感表達戲劇化',
    virgo: '情緒較壓抑，透過分析處理感受',
    libra: '渴望和諧，情緒容易受到不公平影響',
    scorpio: '情緒強烈深刻，難以釋放傷痛',
    sagittarius: '情緒樂觀，需要自由與空間',
    capricorn: '情緒壓抑，用工作轉移感受',
    aquarius: '情感疏離，用理性理解情緒',
    pisces: '情感如海洋，極度感同身受',
  },
}

// ─── 組合詮釋函式 ─────────────────────────────────────────

/**
 * 根據命盤資料產生結構化詮釋
 * @param {import('../../types/index.js').NatalChart} chart
 */
export function generateInterpretation(chart) {
  const { planets, nodes, houses } = chart

  const sun = planets.find(p => p.id === 'sun')
  const moon = planets.find(p => p.id === 'moon')
  const mercury = planets.find(p => p.id === 'mercury')
  const venus = planets.find(p => p.id === 'venus')
  const mars = planets.find(p => p.id === 'mars')

  const northNodeInterp = NORTH_NODE_SIGNS[nodes.northSign] || {}
  const southNodeInterp = SOUTH_NODE_SIGNS[nodes.southSign] || {}
  const northHouseInterp = NORTH_NODE_HOUSES[nodes.northHouse] || {}

  return {
    overview: {
      sunSign: {
        sign: sun?.signZh,
        house: sun?.house,
        keyword: PLANET_SIGN_KEYWORDS.sun?.[sun?.sign] || '',
      },
      moonSign: {
        sign: moon?.signZh,
        house: moon?.house,
        keyword: PLANET_SIGN_KEYWORDS.moon?.[moon?.sign] || '',
      },
      risingSign: chart.risingSign,
    },
    nodes: {
      north: {
        sign: nodes.northSignZh,
        house: nodes.northHouse,
        houseTheme: NORTH_NODE_HOUSES[nodes.northHouse]?.theme || '',
        ...northNodeInterp,
        houseFocus: northHouseInterp.focus,
      },
      south: {
        sign: nodes.southSignZh,
        house: nodes.southHouse,
        ...southNodeInterp,
      },
      synthesis: `你的靈魂從「${southNodeInterp.karmaPattern || '過去世的積累'}」走向「${northNodeInterp.lesson || '新的功課'}」。${northHouseInterp.focus || ''}`,
    },
    planets: planets.map(p => ({
      id: p.id,
      nameZh: p.nameZh,
      symbol: p.symbol,
      sign: p.signZh,
      house: p.house,
      degree: p.degree,
      longitude: p.longitude,
      keyword: PLANET_SIGN_KEYWORDS[p.id]?.[p.sign] || `${p.nameZh}在${p.signZh}`,
    })),
    aspects: chart.aspects.slice(0, 10), // 最重要的前 10 個相位
    keyThemes: deriveKeyThemes(chart),
  }
}

/**
 * 從命盤提取關鍵主題（元素分佈、宮位強調）
 */
function deriveKeyThemes(chart) {
  const elements = { fire: 0, earth: 0, air: 0, water: 0 }
  const qualities = { cardinal: 0, fixed: 0, mutable: 0 }
  const SIGN_META = {
    aries: { element:'fire', quality:'cardinal' },
    taurus: { element:'earth', quality:'fixed' },
    gemini: { element:'air', quality:'mutable' },
    cancer: { element:'water', quality:'cardinal' },
    leo: { element:'fire', quality:'fixed' },
    virgo: { element:'earth', quality:'mutable' },
    libra: { element:'air', quality:'cardinal' },
    scorpio: { element:'water', quality:'fixed' },
    sagittarius: { element:'fire', quality:'mutable' },
    capricorn: { element:'earth', quality:'cardinal' },
    aquarius: { element:'air', quality:'fixed' },
    pisces: { element:'water', quality:'mutable' },
  }

  for (const p of chart.planets) {
    const meta = SIGN_META[p.sign]
    if (meta) {
      elements[meta.element]++
      qualities[meta.quality]++
    }
  }

  const dominantElement = Object.entries(elements).sort((a,b) => b[1]-a[1])[0][0]
  const dominantQuality = Object.entries(qualities).sort((a,b) => b[1]-a[1])[0][0]

  const elementNames = { fire: '火象（行動、熱情）', earth: '土象（實際、穩定）', air: '風象（思考、溝通）', water: '水象（情感、直覺）' }
  const qualityNames = { cardinal: '開創（主動出擊）', fixed: '固定（專注持久）', mutable: '變動（適應靈活）' }

  return {
    elements,
    qualities,
    dominantElement: elementNames[dominantElement],
    dominantQuality: qualityNames[dominantQuality],
    summary: `命盤以${elementNames[dominantElement]}為主，行事風格偏向${qualityNames[dominantQuality]}`,
  }
}
