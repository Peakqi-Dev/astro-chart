# 星圖 — 占星命盤與靈魂使命系統

西洋占星命盤計算、南北交點詮釋、AI 人生規劃報告的完整 Node.js 系統。

## 功能

- 輸入出生年月日、時間、地點，計算完整西洋命盤
- SVG 圓形星盤圖（含行星符號、宮位線、相位線、逆行標記）
- 南北交點靈魂功課深度詮釋（12 星座 × 12 宮位全覆蓋）
- Claude AI 串流生成個人化人生規劃報告
- 支援五大主題深度建議：事業、關係、能量、靈性、財富
- PDF 報告匯出（嵌入中文字型，含命盤資料 + AI 報告）

## 技術架構

```
Node.js + Express   後端 API
astronomia          占星計算（行星位置、交點、相位）
Claude API          AI 人生規劃生成（SSE 串流）
PDFKit + IPA Gothic PDF 輸出（支援繁體中文）
原生 HTML/CSS/JS    前端介面
```

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

```bash
cp .env.example .env
# 編輯 .env，填入你的 Anthropic API Key
```

`.env` 內容：
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
PORT=3000
```

### 3. 啟動

```bash
npm start
# 或開發模式（自動重啟）
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000)

## API Endpoints

| Method | Path | 說明 |
|--------|------|------|
| POST | `/api/calculate` | 計算命盤（同步） |
| POST | `/api/chart-svg` | 產生 SVG 星盤圖 |
| POST | `/api/generate-report` | AI 報告（SSE 串流） |
| POST | `/api/topic-advice` | 單一主題深度建議 |
| POST | `/api/export-pdf` | 匯出 PDF 報告 |
| GET  | `/api/health` | 健康檢查 |

## 輸入格式

```json
{
  "date": { "year": 1990, "month": 5, "day": 15 },
  "time": { "hour": 14, "minute": 30, "precision": "exact" },
  "location": {
    "cityName": "台北市",
    "latitude": 25.033,
    "longitude": 121.565,
    "timezone": "Asia/Taipei",
    "precision": "exact"
  },
  "meta": { "name": "測試", "gender": "unspecified" }
}
```

`time.precision` 可設為 `"unknown"`（使用正午估算，宮位計算會不準確）

## 系統需求

- Node.js 18+
- Linux 系統（PDF 中文字型路徑為 `/usr/share/fonts/opentype/ipafont-gothic/`）
- IPA Gothic 字型：`apt-get install fonts-ipafont`
- Anthropic API Key（用於 AI 報告生成功能）

## 注意事項

- 占星計算使用克卜勒方程式近似，行星位置誤差約 1–2 度
- 太陽、月亮位置較精確；外行星誤差稍大
- 宮位採等宮制（Equal House）
- 逆行判斷：比對前一天行星位置，黃道度數減少即標記逆行

## 授權

MIT
