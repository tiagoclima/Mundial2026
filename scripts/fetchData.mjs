// scripts/fetchData.mjs
// Smart fetcher — respects 400 req/day budget and adapts frequency to match schedule.
//
// State file: public/api-state.json (persisted in gh-pages branch between runs)
// Live data:  public/live.json
//
// Decision logic per execution:
//   1. Load api-state.json from gh-pages checkout (previous run state)
//   2. If daily budget exhausted (>= 400) → skip all API calls, exit 0
//   3. If force_full_refresh=true and requests_today < 250 → fetch everything, clear flag
//   4. Determine current match context from live.json (games now, recently finished, upcoming)
//   5. Decide which endpoints to call based on context
//   6. Call only what's needed, update state, write live.json + api-state.json

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname   = dirname(fileURLToPath(import.meta.url))
const BASE_URL    = 'https://api.wc2026api.com'
const API_KEY     = process.env.WC_API_KEY
const OUT_DIR     = join(__dirname, '..', 'public')
const LIVE_FILE   = join(OUT_DIR, 'live.json')
const STATE_FILE  = join(OUT_DIR, 'api-state.json')
const DAILY_LIMIT = 400
const MIN = 60 * 1000

if (!API_KEY) { console.error('WC_API_KEY not set'); process.exit(1) }

const headers = { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
let requestsThisRun = 0

async function fetchJSON(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers })
  requestsThisRun++
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`)
  return res.json()
}

// ── STATE ─────────────────────────────────────────────────────────────────────

function loadState() {
  const defaults = {
    date: '',
    requests_today: 0,
    last_matches_fetch: null,
    last_standings_fetch: null,
    groups_last_fetch: {},
    groups_done: [],
    force_full_refresh: false,
  }
  if (existsSync(STATE_FILE)) {
    try {
      const s = JSON.parse(readFileSync(STATE_FILE, 'utf8'))
      const todayUTC = new Date().toISOString().slice(0, 10)
      if (s.date !== todayUTC) {
        console.log(`New day (${todayUTC}) — resetting request counter (was ${s.requests_today})`)
        return { ...defaults, ...s, date: todayUTC, requests_today: 0 }
      }
      return { ...defaults, ...s }
    } catch { return defaults }
  }
  return { ...defaults, date: new Date().toISOString().slice(0, 10) }
}

function saveState(state) {
  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
}

// ── LIVE DATA ─────────────────────────────────────────────────────────────────

function loadLive() {
  if (existsSync(LIVE_FILE)) {
    try { return JSON.parse(readFileSync(LIVE_FILE, 'utf8')) } catch {}
  }
  return { fetched_at: null, matches: [], standings: [] }
}

// ── MATCH CONTEXT ─────────────────────────────────────────────────────────────

function getMatchContext(matches) {
  const now = Date.now()
  const MATCH_DURATION = 115 * MIN

  const liveMatches    = []
  const recentlyEnded  = []
  const upcomingNext2h = []
  const activeGroups   = new Set()

  for (const m of matches) {
    if (!m.kickoff_utc) continue
    const ko = new Date(m.kickoff_utc).getTime()
    const isLive   = m.status === 'live' || ['1H','HT','2H','ET1','ET2','PEN'].includes(m.phase)
    const isDone   = m.status === 'completed' || ['FT','FT_PEN'].includes(m.phase)
    const endEst   = ko + MATCH_DURATION
    const recentEnd = isDone && (now - endEst) < 40 * MIN && (now - endEst) > -5 * MIN

    if (isLive) {
      liveMatches.push(m)
      if (m.group_name) activeGroups.add(m.group_name)
    }
    if (recentEnd) {
      recentlyEnded.push(m)
      if (m.group_name) activeGroups.add(m.group_name)
    }
    if (!isLive && !isDone && ko > now && ko - now < 2 * 60 * MIN) {
      upcomingNext2h.push(m)
    }
  }

  const future = matches
    .filter(m => !['completed'].includes(m.status) && !['FT','FT_PEN'].includes(m.phase))
    .filter(m => m.kickoff_utc && new Date(m.kickoff_utc).getTime() > now)
    .sort((a, b) => new Date(a.kickoff_utc) - new Date(b.kickoff_utc))
  const nextKickoff = future[0] ? new Date(future[0].kickoff_utc).getTime() : null
  const minsToNext  = nextKickoff ? Math.round((nextKickoff - now) / MIN) : null

  return { liveMatches, recentlyEnded, upcomingNext2h, activeGroups, minsToNext }
}

// ── GROUPS DONE CHECK ─────────────────────────────────────────────────────────
function computeGroupsDone(standings) {
  return standings
    .filter(group => {
      if (!group.standings || group.standings.length < 2) return false
      const expectedGames = group.standings.length - 1  // 3 para grupos de 4
      return group.standings.every(team => team.played >= expectedGames)
    })
    .map(group => group.group_name)
}


function old_computeGroupsDone(matches) {
  const groupCompleted = {}
  const GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L']

  for (const m of matches) {
    if (m.round !== 'group' || !m.group_name) continue
    if (m.status === 'completed' || ['FT','FT_PEN'].includes(m.phase)) {
      groupCompleted[m.group_name] = (groupCompleted[m.group_name] || 0) + 1
    }
  }

  return GROUP_LETTERS.filter(g => (groupCompleted[g] || 0) >= 6)
}

// ── FULL REFRESH ──────────────────────────────────────────────────────────────

async function doFullRefresh(now, state, live) {
  console.log(`Force full refresh — fetching /matches + all 12 groups`)
  const GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L']

  const matches = await fetchJSON('/matches')
  state.last_matches_fetch = now.toISOString()
  console.log(`  /matches → ${matches.length} matches`)

  const standings = live.standings || []
  for (const letter of GROUP_LETTERS) {
    const g = await fetchJSON(`/groups/${letter}`)
    const idx = standings.findIndex(s => s.group_name === letter)
    const entry = { group_name: letter, standings: g.standings || g.teams || [] }
    if (idx >= 0) standings[idx] = entry
    else standings.push(entry)
    state.groups_last_fetch[letter] = now.toISOString()
    console.log(`  /groups/${letter} → ${entry.standings.length} teams`)
  }

  const payload = {
    fetched_at:   now.toISOString(),
    standings_at: now.toISOString(),
    matches,
    standings,
  }
  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(LIVE_FILE, JSON.stringify(payload, null, 2))

  state.requests_today += requestsThisRun
  state.groups_done = computeGroupsDone(matches)
  state.force_full_refresh = false
  saveState(state)

  console.log(`Full refresh done — ${requestsThisRun} requests this run, ${state.requests_today} today total`)
  console.log(`Groups done: [${state.groups_done.join(',') || 'none'}]`)
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  const now   = new Date()
  const state = loadState()
  const live  = loadLive()

  console.log(`[${now.toISOString()}] Requests today so far: ${state.requests_today}/${DAILY_LIMIT}`)

  // Hard budget check
  if (state.requests_today >= DAILY_LIMIT) {
    console.log('Daily budget exhausted — skipping all API calls')
    return
  }

  // Force full refresh (manual resync)
  if (state.force_full_refresh) {
    if (state.requests_today < 250) {
      await doFullRefresh(now, state, live)
    } else {
      console.log(`Force full refresh requested but budget too low (${state.requests_today}/400) — skipping`)
      state.force_full_refresh = false
      saveState(state)
    }
    return
  }

  const remaining = DAILY_LIMIT - state.requests_today
  const ctx       = getMatchContext(live.matches || [])

  console.log(`Context: live=${ctx.liveMatches.length} recentEnd=${ctx.recentlyEnded.length} upcoming2h=${ctx.upcomingNext2h.length} minsToNext=${ctx.minsToNext}`)

  const minAgo = (ts) => ts ? Math.round((now - new Date(ts)) / MIN) : Infinity

  // ── DECIDE: fetch /matches? ───────────────────────────────────────────────
  let fetchMatches = false
  let matchReason  = ''
  let gameWindow   = 'none'

  for (const m of (live.matches || [])) {
    if (!m.kickoff_utc) continue
    if (m.status === 'completed' || m.phase === 'FT' || m.phase === 'FT_PEN') continue
    const ko      = new Date(m.kickoff_utc).getTime()
    const elapsed = (now - ko) / MIN
    const minsTo  = -elapsed

    let w = 'none'
    if      (elapsed >= 0  && elapsed <= 130) w = 'live'
    else if (elapsed > 130 && elapsed <= 170) w = 'post'
    else if (minsTo  >= 0  && minsTo  <= 15)  w = 'pre15m'
    else if (minsTo  > 15  && minsTo  <= 60)  w = 'pre1h'
    else if (minsTo  > 60  && minsTo  <= 180) w = 'pre3h'

    const priority = { live:5, post:4, pre15m:3, pre1h:2, pre3h:1, none:0 }
    if ((priority[w] || 0) > (priority[gameWindow] || 0)) gameWindow = w
  }

  const apiConfirmedLive = ctx.liveMatches.length > 0
  console.log('  gameWindow=' + gameWindow + ' apiLive=' + apiConfirmedLive)

  if (apiConfirmedLive || gameWindow === 'live') {
    fetchMatches = true
    matchReason  = apiConfirmedLive ? 'live (API confirmed)' : 'live (by kickoff time)'
  } else if (gameWindow === 'post') {
    fetchMatches = true
    matchReason  = 'post-game (catching final score)'
  } else if (gameWindow === 'pre15m') {
    fetchMatches = true
    matchReason  = 'pre-game <15min'
  } else if (gameWindow === 'pre1h') {
    fetchMatches = minAgo(state.last_matches_fetch) >= 14
    matchReason  = 'pre-game <1h (15min interval)'
  } else if (gameWindow === 'pre3h') {
    fetchMatches = minAgo(state.last_matches_fetch) >= 29
    matchReason  = 'pre-game <3h (30min interval)'
  } else if (ctx.minsToNext !== null && ctx.minsToNext < 360) {
    fetchMatches = minAgo(state.last_matches_fetch) >= 119
    matchReason  = 'next game <6h (2h interval)'
  } else {
    fetchMatches = minAgo(state.last_matches_fetch) >= 179
    matchReason  = 'dead hours (3h interval)'
  }

  // ── DECIDE: which groups to fetch standings for? ──────────────────────────
  const groupsDone    = computeGroupsDone(live.standings || [])
  const activeGroups  = [...ctx.activeGroups].filter(g => !groupsDone.includes(g))
  const GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L']
  const pendingGroups = GROUP_LETTERS.filter(g => !groupsDone.includes(g))

  let groupsToFetch = []

  if (gameWindow === 'post' && activeGroups.length > 0) {
    groupsToFetch = activeGroups.filter(g => minAgo(state.groups_last_fetch[g]) >= 4)
  } else if (gameWindow === 'live' || gameWindow === 'pre15m') {
    groupsToFetch = []
  } else {
    groupsToFetch = pendingGroups.filter(g => minAgo(state.groups_last_fetch[g]) >= 119)
  }

  // ── BUDGET CHECK ──────────────────────────────────────────────────────────
  const plannedRequests = (fetchMatches ? 1 : 0) + groupsToFetch.length
  if (state.requests_today + plannedRequests > DAILY_LIMIT) {
    const budgetForGroups = remaining - (fetchMatches ? 1 : 0)
    groupsToFetch = groupsToFetch.slice(0, Math.max(0, budgetForGroups))
    console.log(`Budget trim: can fetch ${budgetForGroups} groups`)
  }

  console.log(`Plan: matches=${fetchMatches} (${matchReason}) groups=[${groupsToFetch.join(',')}]`)

  if (!fetchMatches && groupsToFetch.length === 0) {
    console.log('Nothing to fetch this run')
    return
  }

  // ── FETCH ─────────────────────────────────────────────────────────────────
  let matches  = live.matches  || []
  let standings = live.standings || []

  if (fetchMatches) {
    matches = await fetchJSON('/matches')
    state.last_matches_fetch = now.toISOString()
    console.log(`  /matches → ${matches.length} matches`)
  }

  for (const letter of groupsToFetch) {
    const g = await fetchJSON(`/groups/${letter}`)
    const idx = standings.findIndex(s => s.group_name === letter)
    const entry = { group_name: letter, standings: g.standings || g.teams || [] }
    if (idx >= 0) standings[idx] = entry
    else standings.push(entry)
    state.groups_last_fetch[letter] = now.toISOString()
    console.log(`  /groups/${letter} → ${entry.standings.length} teams`)
  }

  // ── WRITE ─────────────────────────────────────────────────────────────────
  const payload = {
    fetched_at:   now.toISOString(),
    standings_at: groupsToFetch.length > 0 ? now.toISOString() : (live.standings_at || null),
    matches,
    standings,
  }

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(LIVE_FILE, JSON.stringify(payload, null, 2))

  state.requests_today += requestsThisRun
  state.groups_done     = computeGroupsDone(matches)
  saveState(state)

  console.log(`Done — ${requestsThisRun} requests this run, ${state.requests_today} today total`)
  console.log(`Groups done: [${state.groups_done.join(',') || 'none'}]`)
}

main().catch(err => { console.error(err); process.exit(1) })
