import { useState, useEffect, useRef } from "react"

// ── STATIC DATA ───────────────────────────────────────────────────────────────

const TV_COLORS = {
  "RTP1": { bg: "#0000FF", text: "#fff" },
  "SIC":  { bg: "#FF6B00", text: "#fff" },
  "TVI":  { bg: "#E19127", text: "#000" },
  "LV":   { bg: "#F20202", text: "#fff" },
  "SPTV": { bg: "#F7E400", text: "#000" },
}

// TV overrides keyed by 'home_team|away_team' -- matches API team names exactly
// All matches have SPTV by default; only overrides with free-to-air or LV listed here
const TV_BY_TEAMS = {
  "Mexico|South Africa":            ["SPTV","LV","TVI"],   // match 1
  "Canada|Bosnia-Herzegovina":      ["SPTV","LV","SIC"],   // match 3
  "Brazil|Morocco":                 ["SPTV","LV"],          // match 7
  "Germany|Curaçao":                ["SPTV","LV"],          // match 10
  "Spain|Cabo Verde":               ["SPTV","LV"],          // match 14
  "France|Senegal":                 ["SPTV","LV","RTP1"],   // match 17
  "Portugal|Congo DR":              ["SPTV","LV","SIC"],    // match 23
  "Switzerland|Bosnia-Herzegovina": ["SPTV","LV","RTP1"],   // match 26
  "Brazil|Haiti":                   ["SPTV","LV"],          // match 29
  "Germany|Côte d'Ivoire":          ["SPTV","LV","TVI"],    // match 33
  "Netherlands|Sweden":             ["SPTV"],                // match 35
  "Spain|Saudi Arabia":             ["SPTV","LV"],          // match 38
  "Argentina|Austria":              ["SPTV","LV"],          // match 43
  "Portugal|Uzbekistan":            ["SPTV","LV","TVI"],    // match 47
  "Scotland|Brazil":                ["SPTV"],                // match 49
  "Morocco|Haiti":                  ["SPTV"],                // match 50
  "Ecuador|Germany":                ["SPTV","LV","SIC"],    // match 56
  "Norway|France":                  ["SPTV","TVI"],          // match 61
  "Colombia|Portugal":              ["SPTV","LV","RTP1"],   // match 71
}

const DEFAULT_TV = ["SPTV"]

function getTv(home_team, away_team) {
  return TV_BY_TEAMS[`${home_team}|${away_team}`] || DEFAULT_TV
}

const FLAGS = {
  "Mexico":"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czech Republic":"🇨🇿",
  "Czechia":"🇨🇿","Canada":"🇨🇦","Bosnia-Herzegovina":"🇧🇦","Bosnia":"🇧🇦",
  "Qatar":"🇶🇦","Switzerland":"🇨🇭","Brazil":"🇧🇷","Morocco":"🇲🇦","Haiti":"🇭🇹",
  "Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","USA":"🇺🇸","United States":"🇺🇸","Paraguay":"🇵🇾",
  "Australia":"🇦🇺","Turkey":"🇹🇷","Türkiye":"🇹🇷","Germany":"🇩🇪","Curaçao":"🇨🇼",
  "Ivory Coast":"🇨🇮","Côte d'Ivoire":"🇨🇮","Ecuador":"🇪🇨","Netherlands":"🇳🇱",
  "Japan":"🇯🇵","Sweden":"🇸🇪","Tunisia":"🇹🇳","Belgium":"🇧🇪","Egypt":"🇪🇬",
  "Iran":"🇮🇷","New Zealand":"🇳🇿","Spain":"🇪🇸","Cape Verde":"🇨🇻",
  "Saudi Arabia":"🇸🇦","Uruguay":"🇺🇾","France":"🇫🇷","Senegal":"🇸🇳",
  "Iraq":"🇮🇶","Norway":"🇳🇴","Argentina":"🇦🇷","Algeria":"🇩🇿","Austria":"🇦🇹",
  "Jordan":"🇯🇴","Portugal":"🇵🇹","Uzbekistan":"🇺🇿","Colombia":"🇨🇴",
  "England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croatia":"🇭🇷","Ghana":"🇬🇭","Panama":"🇵🇦",
  "Congo DR":"🇨🇩","DR Congo":"🇨🇩",
}

const PT_NAMES = {
  "Mexico":"México","South Africa":"África do Sul","South Korea":"Coreia do Sul",
  "Czech Republic":"Rep. Checa","Czechia":"Rep. Checa","Canada":"Canadá",
  "Bosnia-Herzegovina":"Bósnia-Herz.","Bosnia":"Bósnia-Herz.","Qatar":"Qatar",
  "Switzerland":"Suíça","Brazil":"Brasil","Morocco":"Marrocos","Haiti":"Haiti",
  "Scotland":"Escócia","USA":"EUA","United States":"EUA","Paraguay":"Paraguai",
  "Australia":"Austrália","Turkey":"Turquia","Türkiye":"Turquia","Germany":"Alemanha",
  "Curaçao":"Curaçau","Ivory Coast":"C. do Marfim","Côte d'Ivoire":"C. do Marfim",
  "Ecuador":"Equador","Netherlands":"P. Baixos","Japan":"Japão","Sweden":"Suécia",
  "Tunisia":"Tunísia","Belgium":"Bélgica","Egypt":"Egito","Iran":"Irão",
  "New Zealand":"Nova Zelândia","Spain":"Espanha","Cape Verde":"Cabo Verde",
  "Saudi Arabia":"A. Saudita","Uruguay":"Uruguai","France":"França","Senegal":"Senegal",
  "Iraq":"Iraque","Norway":"Noruega","Argentina":"Argentina","Algeria":"Argélia",
  "Austria":"Áustria","Jordan":"Jordânia","Portugal":"Portugal","Uzbekistan":"Uzbequistão",
  "Colombia":"Colômbia","England":"Inglaterra","Croatia":"Croácia","Ghana":"Gana",
  "Panama":"Panamá","Congo DR":"RD Congo","DR Congo":"RD Congo",
}

function toPT(name) { return PT_NAMES[name] || name }
function flag(name) { return FLAGS[name] || "🏳️" }

// ── DATE / TIME HELPERS ───────────────────────────────────────────────────────

function toLocalHour(kickoff_utc) {
  // kickoff_utc: "2026-06-14T21:00:00.000Z"
  if (!kickoff_utc) return "--:--"
  const d = new Date(kickoff_utc)
  return d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Lisbon" })
}

function toLocalDate(kickoff_utc) {
  if (!kickoff_utc) return ""
  const d = new Date(kickoff_utc)
  return d.toLocaleDateString("pt-PT", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Lisbon" })
}

function toDateKey(kickoff_utc) {
  if (!kickoff_utc) return ""
  const d = new Date(kickoff_utc)
  return d.toLocaleDateString("pt-PT", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Lisbon" })
}

function isPortugal(t1, t2) {
  return [t1, t2].some(t => t === "Portugal" || (t || "").includes("Congo") || t === "Uzbekistan" || t === "Colombia")
}
// Actually just check Portugal directly:
function hasPortugal(t1, t2) {
  return t1 === "Portugal" || t2 === "Portugal"
}

// ── STATUS DISPLAY ────────────────────────────────────────────────────────────

function StatusBadge({ match }) {
  const { status, phase, home_score, away_score, minute } = match
  if (status === "live" || phase === "IN_PLAY") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f00", animation: "pulse 1s infinite" }} />
        <span style={{ color: "#f55", fontSize: "10px", fontWeight: 700 }}>{minute ? `${minute}'` : "AO VIVO"}</span>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>{home_score} – {away_score}</span>
      </span>
    )
  }
  if (status === "finished" || phase === "FT") {
    return <span style={{ color: "#aaa", fontSize: "13px", fontWeight: 700 }}>{home_score} – {away_score}</span>
  }
  return null
}

// ── COMPONENTS ────────────────────────────────────────────────────────────────

function TVBadge({ canal }) {
  const s = TV_COLORS[canal] || { bg: "#444", text: "#fff" }
  const style = {
    background: s.bg, color: s.text,
    fontSize: "9px", fontWeight: 700, padding: "1px 5px",
    borderRadius: "3px", letterSpacing: "0.03em", whiteSpace: "nowrap",
    textDecoration: "none", display: "inline-block",
  }
  if (canal === "LV") {
    return (
      <a href="https://youtube.com/@livemodetv_pt" target="_blank" rel="noopener noreferrer" style={style}>
        {canal}
      </a>
    )
  }
  return <span style={style}>{canal}</span>
}

function MatchRow({ match }) {
  const t1    = match.home_team
  const t2    = match.away_team
  const isPT  = hasPortugal(t1, t2)
  const tv    = getTv(match.home_team, match.away_team)
  const hora  = toLocalHour(match.kickoff_utc)
  const past  = match.status === "finished" || match.phase === "FT"
  const live  = match.status === "live" || match.phase === "IN_PLAY"

  return (
    <div style={{
      background: isPT ? "rgba(0,87,168,0.15)" : live ? "rgba(200,0,0,0.08)" : "rgba(255,255,255,0.04)",
      border: isPT ? "1px solid rgba(0,87,168,0.5)" : live ? "1px solid rgba(200,0,0,0.4)" : "1px solid rgba(255,255,255,0.07)",
      borderRadius: "8px", padding: "8px 12px", marginBottom: "5px",
      opacity: past && !isPT ? 0.5 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", flex: 1, minWidth: 0, overflow: "hidden" }}>
          {!live && <span style={{ fontSize: "10px", color: "#777", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{hora}</span>}
          {match.group_name && (
            <span style={{ fontSize: "9px", background: "rgba(255,255,255,0.1)", color: "#aaa", padding: "1px 4px", borderRadius: "3px", fontWeight: 600, flexShrink: 0 }}>
              G{match.group_name}
            </span>
          )}
          <span style={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {flag(t1)} <span style={{ color: "#eee", fontWeight: isPT ? 700 : 400 }}>{toPT(t1)}</span>
            <span style={{ color: "#444", margin: "0 4px" }}>vs</span>
            {flag(t2)} <span style={{ color: "#eee", fontWeight: isPT ? 700 : 400 }}>{toPT(t2)}</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
          {(live || past) && <StatusBadge match={match} />}
          <div style={{ display: "flex", gap: "3px" }}>
            {tv.map(t => <TVBadge key={t} canal={t} />)}
          </div>
        </div>
      </div>
      {match.stadium && (
        <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>📍 {match.stadium}</div>
      )}
    </div>
  )
}

// ── TAB: FIXTURES ─────────────────────────────────────────────────────────────

function FixturesTab({ matches, porOnly }) {
  const [filterGroup, setFilterGroup] = useState("ALL")
  const groups = ["A","B","C","D","E","F","G","H","I","J","K","L"]

  const filtered = matches.filter(m => {
    if (m.round !== "group") return false
    if (porOnly && !hasPortugal(m.home_team, m.away_team)) return false
    if (filterGroup !== "ALL" && m.group_name !== filterGroup) return false
    return true
  })

  const byDate = {}
  filtered.forEach(m => {
    const key = toDateKey(m.kickoff_utc)
    if (!byDate[key]) byDate[key] = []
    byDate[key].push(m)
  })

  const todayKey = toDateKey(new Date().toISOString())

  return (
    <div>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "10px" }}>
        {["ALL", ...groups].map(g => (
          <button key={g} onClick={() => setFilterGroup(g)} style={{
            padding: "3px 9px", borderRadius: "20px", border: "none", cursor: "pointer",
            fontSize: "11px", fontWeight: 600,
            background: filterGroup === g ? (g === "K" ? "#0057A8" : "rgba(255,255,255,0.9)") : "rgba(255,255,255,0.08)",
            color: filterGroup === g ? (g === "K" ? "#fff" : "#000") : "#888",
          }}>{g === "ALL" ? "Todos" : `G${g}`}</button>
        ))}
      </div>
      {Object.keys(byDate).map(dateKey => (
        <div key={dateKey}>
          <div style={{
            fontSize: "11px", fontWeight: 700,
            color: dateKey === todayKey ? "#4CAF50" : "#666",
            letterSpacing: "0.06em", textTransform: "uppercase",
            margin: "10px 0 5px", paddingBottom: "4px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: "6px"
          }}>
            {toLocalDate(byDate[dateKey][0].kickoff_utc)}
            {dateKey === todayKey && (
              <span style={{ background: "#4CAF50", color: "#000", fontSize: "9px", padding: "1px 5px", borderRadius: "3px" }}>HOJE</span>
            )}
          </div>
          {byDate[dateKey].map((m, i) => <MatchRow key={m.id || i} match={m} />)}
        </div>
      ))}
      {Object.keys(byDate).length === 0 && (
        <div style={{ textAlign: "center", color: "#555", padding: "40px 0", fontSize: "13px" }}>Sem jogos para este filtro.</div>
      )}
    </div>
  )
}

// ── TAB: GRUPOS + STANDINGS ───────────────────────────────────────────────────

function GroupsTab({ standings }) {
  if (!standings || standings.length === 0) {
    return <div style={{ color: "#555", textAlign: "center", padding: "40px 0" }}>A carregar classificações...</div>
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {standings.map(group => (
        <div key={group.group_name} style={{
          background: group.group_name === "K" ? "rgba(0,87,168,0.15)" : "rgba(255,255,255,0.04)",
          border: group.group_name === "K" ? "1px solid rgba(0,87,168,0.4)" : "1px solid rgba(255,255,255,0.07)",
          borderRadius: "8px", padding: "10px 12px",
        }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#999", marginBottom: "8px", letterSpacing: "0.08em" }}>
            GRUPO {group.group_name} {group.group_name === "K" && "🇵🇹"}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ color: "#555", fontSize: "10px" }}>
                <th style={{ textAlign: "left", paddingBottom: "4px", fontWeight: 600 }}>Equipa</th>
                <th style={{ textAlign: "center", width: 22, fontWeight: 600 }}>J</th>
                <th style={{ textAlign: "center", width: 22, fontWeight: 600 }}>V</th>
                <th style={{ textAlign: "center", width: 22, fontWeight: 600 }}>E</th>
                <th style={{ textAlign: "center", width: 22, fontWeight: 600 }}>D</th>
                <th style={{ textAlign: "center", width: 28, fontWeight: 600 }}>GD</th>
                <th style={{ textAlign: "center", width: 28, fontWeight: 600 }}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {(group.standings || []).map((row, i) => {
                const isQualified = i < 2
                const isPT = row.team_name === "Portugal"
                return (
                  <tr key={row.team_name} style={{
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    background: isPT ? "rgba(0,87,168,0.1)" : "transparent",
                  }}>
                    <td style={{ padding: "5px 0", display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{
                        width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                        background: isQualified ? "#2ecc71" : "rgba(255,255,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "8px", fontWeight: 700, color: isQualified ? "#000" : "#666",
                      }}>{i + 1}</span>
                      {flag(row.team_name)} <span style={{ color: isPT ? "#6fa8dc" : "#ddd", fontWeight: isPT ? 700 : 400 }}>{toPT(row.team_name)}</span>
                    </td>
                    <td style={{ textAlign: "center", color: "#aaa" }}>{row.played ?? 0}</td>
                    <td style={{ textAlign: "center", color: "#aaa" }}>{row.won ?? 0}</td>
                    <td style={{ textAlign: "center", color: "#aaa" }}>{row.drawn ?? 0}</td>
                    <td style={{ textAlign: "center", color: "#aaa" }}>{row.lost ?? 0}</td>
                    <td style={{ textAlign: "center", color: row.goal_difference > 0 ? "#2ecc71" : row.goal_difference < 0 ? "#e74c3c" : "#aaa" }}>
                      {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference ?? 0}
                    </td>
                    <td style={{ textAlign: "center", color: "#fff", fontWeight: 700 }}>{row.points ?? 0}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ fontSize: "9px", color: "#444", marginTop: "6px" }}>
            🟢 Top 2 qualificam-se · os 8 melhores 3ºs também avançam
          </div>
        </div>
      ))}
    </div>
  )
}

// ── TAB: ELIMINATÓRIAS ────────────────────────────────────────────────────────

function KnockoutMatchCard({ match }) {
  const t1    = match.home_team || match.t1_label || "A determinar"
  const t2    = match.away_team || match.t2_label || "A determinar"
  const isPT  = hasPortugal(t1, t2)
  const tv    = getTv(match.home_team, match.away_team)
  const live  = match.status === "live" || match.phase === "IN_PLAY"
  const past  = match.status === "finished" || match.phase === "FT"

  return (
    <div style={{
      background: isPT ? "rgba(0,87,168,0.2)" : "rgba(255,255,255,0.05)",
      border: isPT ? "1px solid rgba(0,87,168,0.5)" : live ? "1px solid rgba(200,0,0,0.5)" : "1px solid rgba(255,255,255,0.1)",
      borderRadius: "7px", padding: "8px 10px", width: 168, flexShrink: 0,
    }}>
      <div style={{ fontSize: "9px", color: "#555", marginBottom: "5px", fontVariantNumeric: "tabular-nums" }}>
        {match.kickoff_utc ? `${fmtShort(match.kickoff_utc)} ${toLocalHour(match.kickoff_utc)}` : "A definir"}
        {match.stadium ? ` · ${match.stadium}` : ""}
      </div>
      <div style={{ fontSize: "12px", color: "#ddd", lineHeight: "1.8" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{t1 === "A determinar" ? <span style={{ color: "#444" }}>{t1}</span> : <>{flag(t1)} <span style={{ fontWeight: isPT && t1 === "Portugal" ? 700 : 400 }}>{toPT(t1)}</span></>}</span>
          {past && <span style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>{match.home_score}</span>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{t2 === "A determinar" ? <span style={{ color: "#444" }}>{t2}</span> : <>{flag(t2)} <span style={{ fontWeight: isPT && t2 === "Portugal" ? 700 : 400 }}>{toPT(t2)}</span></>}</span>
          {past && <span style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>{match.away_score}</span>}
        </div>
      </div>
      {live && <StatusBadge match={match} />}
      <div style={{ display: "flex", gap: "3px", marginTop: "5px", flexWrap: "wrap" }}>
        {tv.map(t => <TVBadge key={t} canal={t} />)}
      </div>
    </div>
  )
}

function fmtShort(kickoff_utc) {
  const d = new Date(kickoff_utc)
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", timeZone: "Europe/Lisbon" })
}

function RoundColumn({ title, matches, color = "#666" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
      <div style={{
        fontSize: "10px", fontWeight: 700, color, letterSpacing: "0.08em",
        textAlign: "center", paddingBottom: "5px",
        borderBottom: `1px solid ${color}44`,
      }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {matches.map((m, i) => <KnockoutMatchCard key={m.id || i} match={m} />)}
      </div>
    </div>
  )
}

function KnockoutTab({ matches }) {
  const r32  = matches.filter(m => m.round === "R32")
  const r16  = matches.filter(m => m.round === "R16")
  const qf   = matches.filter(m => m.round === "QF")
  const sf   = matches.filter(m => m.round === "SF")
  const fin  = matches.filter(m => m.round === "final")
  const thrd = matches.filter(m => m.round === "3rd")

  return (
    <div>
      <div style={{ fontSize: "11px", color: "#555", marginBottom: "10px" }}>← Scroll para ver todas as fases →</div>
      <div style={{ overflowX: "auto", paddingBottom: "16px", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", minWidth: "max-content", padding: "0 2px" }}>
          {r32.length  > 0 && <RoundColumn title="16-AVOS"      matches={r32}  color="#777" />}
          {r16.length  > 0 && <RoundColumn title="OITAVOS"      matches={r16}  color="#999" />}
          {qf.length   > 0 && <RoundColumn title="QUARTOS"      matches={qf}   color="#bbb" />}
          {sf.length   > 0 && <RoundColumn title="MEIAS-FINAIS" matches={sf}   color="#FFD700" />}
          {(fin.length > 0 || thrd.length > 0) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
              {fin.length > 0  && <><div style={{ fontSize: "10px", fontWeight: 700, color: "#e74c3c", textAlign: "center", paddingBottom: "5px", borderBottom: "1px solid #e74c3c44" }}>FINAL</div>
                {fin.map((m, i)  => <KnockoutMatchCard key={m.id || i} match={m} />)}</>}
              {thrd.length > 0 && <><div style={{ fontSize: "10px", fontWeight: 700, color: "#666", textAlign: "center", marginTop: "8px", paddingBottom: "5px", borderBottom: "1px solid #66644" }}>3º LUGAR</div>
                {thrd.map((m, i) => <KnockoutMatchCard key={m.id || i} match={m} />)}</>}
            </div>
          )}
          {r32.length === 0 && r16.length === 0 && (
            <div style={{ color: "#444", fontSize: "13px", padding: "40px 20px" }}>
              Fase a eliminar começa em 28 de Junho.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── TAB: TV PT ────────────────────────────────────────────────────────────────

function TvTab() {
  return (
    <div style={{ color: "#ccc", fontSize: "13px" }}>
      <div style={{ fontWeight: 700, color: "#fff", marginBottom: "12px" }}>Onde ver em Portugal</div>
      {Object.entries(TV_COLORS).map(([canal, s]) => (
        <div key={canal} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "9px" }}>
          <TVBadge canal={canal} />
          <span style={{ fontSize: "12px" }}>{{
            "RTP1": "Sinal aberto · RTP Play (grátis)",
            "SIC":  "Sinal aberto · SIC Opto (grátis)",
            "TVI":  "Sinal aberto · TVI Player (grátis)",
            "LV":   "LiveModeTV YouTube · 34 jogos grátis incl. todos de Portugal",
            "SPTV": "Sport TV · Todos os 104 jogos (subscrição)",
          }[canal]}</span>
        </div>
      ))}
      <div style={{ marginTop: "16px", padding: "12px", background: "rgba(0,87,168,0.15)", borderRadius: "8px", border: "1px solid rgba(0,87,168,0.3)", lineHeight: "2.2" }}>
        <div style={{ fontWeight: 700, color: "#6fa8dc", marginBottom: "6px" }}>🇵🇹 Portugal -- Grupo K</div>
        <div>17 Jun · Portugal vs RD Congo · <TVBadge canal="SIC" /></div>
        <div>23 Jun · Portugal vs Uzbequistão · <TVBadge canal="TVI" /></div>
        <div>28 Jun · Colômbia vs Portugal · <TVBadge canal="RTP1" /></div>
      </div>
      <div style={{ marginTop: "10px", fontSize: "11px", color: "#555", lineHeight: "1.6" }}>
        Horários em hora de Portugal Continental (WEST · UTC+1). Fase a eliminar: canais a confirmar oficialmente.
      </div>
    </div>
  )
}

// ── LOADING / ERROR STATES ────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "12px" }}>
      <div style={{ fontSize: "32px" }}>⚽</div>
      <div style={{ color: "#555", fontSize: "13px" }}>A carregar dados...</div>
    </div>
  )
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{ background: "rgba(200,0,0,0.1)", border: "1px solid rgba(200,0,0,0.3)", borderRadius: "8px", padding: "12px 16px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#e55", fontSize: "12px" }}>⚠ {message}</span>
      <button onClick={onRetry} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#aaa", fontSize: "11px", padding: "4px 10px", borderRadius: "5px", cursor: "pointer" }}>Tentar novamente</button>
    </div>
  )
}

// ── ROOT ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab]         = useState("fixtures")
  const [porOnly, setPorOnly] = useState(false)
  const [data, setData]       = useState(null)
  const [error, setError]     = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  async function loadData() {
    setError(null)
    try {
      // live.json is fetched and written by the GitHub Actions workflow
      // It lives at /live.json in the deployed site (served from /public in dev)
      const base = import.meta.env.BASE_URL
      const res = await fetch(`${base}live.json?t=${Date.now()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setLastUpdate(new Date(json.fetched_at))
    } catch (e) {
      setError("Não foi possível carregar os dados ao vivo. Erro: " + e )
    }
  }

  useEffect(() => {
    loadData()
    // Re-fetch every 5 minutes (the file itself only updates every 15min on the server)
    const interval = setInterval(loadData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const matches   = data?.matches   || []
  const standings = data?.standings || []

  const tabs = [
    { id: "fixtures",  label: "Calendário" },
    { id: "groups",    label: "Grupos" },
    { id: "knockout",  label: "Eliminatórias" },
    { id: "tv",        label: "TV PT" },
  ]

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
      `}</style>
      <div style={{
        minHeight: "100vh", background: "#0a0a0f", color: "#e0e0e0",
        fontFamily: "'Inter', -apple-system, sans-serif",
        maxWidth: "480px", margin: "0 auto", paddingBottom: "40px",
      }}>
        {/* HEADER */}
        <div style={{
          padding: "16px 16px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          position: "sticky", top: 0, background: "#0a0a0f", zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <div>
              <div style={{ fontSize: "17px", fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>⚽ Mundial 2026</div>
              <div style={{ fontSize: "10px", color: "#444", marginTop: "1px" }}>
                {lastUpdate
                  ? `Atualizado ${lastUpdate.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`
                  : "11 Jun – 19 Jul · USA / CAN / MEX"}
              </div>
            </div>
            <button onClick={() => setPorOnly(!porOnly)} style={{
              padding: "5px 11px", borderRadius: "20px", border: "none", cursor: "pointer",
              background: porOnly ? "#0057A8" : "rgba(255,255,255,0.08)",
              color: porOnly ? "#fff" : "#777",
              fontSize: "12px", fontWeight: 600,
            }}>🇵🇹 {porOnly ? "Só PT" : "Portugal"}</button>
          </div>
          <div style={{ display: "flex", gap: "3px" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: "6px 0", borderRadius: "6px", border: "none", cursor: "pointer",
                background: tab === t.id ? "rgba(255,255,255,0.12)" : "transparent",
                color: tab === t.id ? "#fff" : "#555",
                fontSize: tab === t.id ? "11px" : "10px",
                fontWeight: tab === t.id ? 700 : 400,
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "12px 16px" }}>
          {error && <ErrorBanner message={error} onRetry={loadData} />}
          {!data && !error
            ? <LoadingScreen />
            : <>
                {tab === "fixtures"  && <FixturesTab  matches={matches}   porOnly={porOnly} />}
                {tab === "groups"    && <GroupsTab    standings={standings} />}
                {tab === "knockout"  && <KnockoutTab  matches={matches} />}
                {tab === "tv"        && <TvTab />}
              </>
          }
        </div>
      </div>
    </>
  )
}
