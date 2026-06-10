// scripts/fetchData.mjs
// Runs in GitHub Actions — fetches from wc2026api.com and writes public/live.json
// The API key is injected via the WC_API_KEY environment variable (GitHub Secret)
// Never commit the key to the repository.

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://api.wc2026api.com'
const API_KEY  = process.env.WC_API_KEY

if (!API_KEY) {
  console.error('WC_API_KEY environment variable is not set.')
  process.exit(1)
}

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
}

async function fetchJSON(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers })
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`)
  return res.json()
}

async function main() {
  console.log('Fetching World Cup data...')

  const [matches, standings] = await Promise.all([
    fetchJSON('/matches'),
    fetchJSON('/standings'),
  ])

  const payload = {
    fetched_at: new Date().toISOString(),
    matches,
    standings,
  }

  const outDir  = join(__dirname, '..', 'public')
  const outFile = join(outDir, 'live.json')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(outFile, JSON.stringify(payload, null, 2))

  console.log(`Written ${outFile} — ${matches.length ?? '?'} matches, standings for ${standings.length ?? '?'} groups`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
