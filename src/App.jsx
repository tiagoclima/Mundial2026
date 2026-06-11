import { useState, useEffect, useRef } from "react"

// ── STATIC DATA ───────────────────────────────────────────────────────────────

const TV_COLORS = {
  "RTP1": { bg: "#006400", text: "#fff" },
  "SIC":  { bg: "#FF6B00", text: "#fff" },
  "TVI":  { bg: "#0057A8", text: "#fff" },
  "LV":   { bg: "#1DB954", text: "#fff" },
  "SPTV": { bg: "#8B0000", text: "#fff" },
}

const TV_BY_TEAMS = {
  "Mexico|South Africa":            ["SPTV","LV","TVI"],
  "Canada|Bosnia-Herzegovina":      ["SPTV","LV","SIC"],
  "Brazil|Morocco":                 ["SPTV","LV"],
  "Germany|Curaçao":                ["SPTV","LV"],
  "Spain|Cabo Verde":               ["SPTV","LV"],
  "France|Senegal":                 ["SPTV","LV","RTP1"],
  "Portugal|Congo DR":              ["SPTV","LV","SIC"],
  "Switzerland|Bosnia-Herzegovina": ["SPTV","LV","RTP1"],
  "Brazil|Haiti":                   ["SPTV","LV"],
  "Germany|Côte d'Ivoire":          ["SPTV","LV","TVI"],
  "Netherlands|Sweden":             ["SPTV"],
  "Spain|Saudi Arabia":             ["SPTV","LV"],
  "Argentina|Austria":              ["SPTV","LV"],
  "Portugal|Uzbekistan":            ["SPTV","LV","TVI"],
  "Scotland|Brazil":                ["SPTV"],
  "Morocco|Haiti":                  ["SPTV"],
  "Ecuador|Germany":                ["SPTV","LV","SIC"],
  "Norway|France":                  ["SPTV","TVI"],
  "Colombia|Portugal":              ["SPTV","LV","RTP1"],
}
const DEFAULT_TV = ["SPTV"]
function getTv(t1, t2) { return TV_BY_TEAMS[`${t1}|${t2}`] || DEFAULT_TV }

const BASE = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/"
const FLAG_URLS = {
  "Mexico":             BASE+"1f1f2-1f1fd.svg",
  "South Africa":       BASE+"1f1ff-1f1e6.svg",
  "Korea Republic":     BASE+"1f1f0-1f1f7.svg",
  "Czech Republic":     BASE+"1f1e8-1f1ff.svg",
  "Czechia":            BASE+"1f1e8-1f1ff.svg",
  "Canada":             BASE+"1f1e8-1f1e6.svg",
  "Bosnia-Herzegovina": BASE+"1f1e7-1f1e6.svg",
  "Qatar":              BASE+"1f1f6-1f1e6.svg",
  "Switzerland":        BASE+"1f1e8-1f1ed.svg",
  "Brazil":             BASE+"1f1e7-1f1f7.svg",
  "Morocco":            BASE+"1f1f2-1f1e6.svg",
  "Haiti":              BASE+"1f1ed-1f1f9.svg",
  "USA":                BASE+"1f1fa-1f1f8.svg",
  "Paraguay":           BASE+"1f1f5-1f1fe.svg",
  "Australia":          BASE+"1f1e6-1f1fa.svg",
  "Turkey":             BASE+"1f1f9-1f1f7.svg",
  "Germany":            BASE+"1f1e9-1f1ea.svg",
  "Curaçao":            BASE+"1f1e8-1f1fc.svg",
  "Côte d'Ivoire":     BASE+"1f1e8-1f1ee.svg",
  "Ecuador":            BASE+"1f1ea-1f1e8.svg",
  "Netherlands":        BASE+"1f1f3-1f1f1.svg",
  "Japan":              BASE+"1f1ef-1f1f5.svg",
  "Sweden":             BASE+"1f1f8-1f1ea.svg",
  "Tunisia":            BASE+"1f1f9-1f1f3.svg",
  "Belgium":            BASE+"1f1e7-1f1ea.svg",
  "Egypt":              BASE+"1f1ea-1f1ec.svg",
  "IR Iran":            BASE+"1f1ee-1f1f7.svg",
  "New Zealand":        BASE+"1f1f3-1f1ff.svg",
  "Spain":              BASE+"1f1ea-1f1f8.svg",
  "Cabo Verde":         BASE+"1f1e8-1f1fb.svg",
  "Saudi Arabia":       BASE+"1f1f8-1f1e6.svg",
  "Uruguay":            BASE+"1f1fa-1f1fe.svg",
  "France":             BASE+"1f1eb-1f1f7.svg",
  "Senegal":            BASE+"1f1f8-1f1f3.svg",
  "Iraq":               BASE+"1f1ee-1f1f6.svg",
  "Norway":             BASE+"1f1f3-1f1f4.svg",
  "Argentina":          BASE+"1f1e6-1f1f7.svg",
  "Algeria":            BASE+"1f1e9-1f1ff.svg",
  "Austria":            BASE+"1f1e6-1f1f9.svg",
  "Jordan":             BASE+"1f1ef-1f1f4.svg",
  "Portugal":           BASE+"1f1f5-1f1f9.svg",
  "Uzbekistan":         BASE+"1f1fa-1f1ff.svg",
  "Colombia":           BASE+"1f1e8-1f1f4.svg",
  "England":            BASE+"1f3f4-e0067-e0062-e0065-e006e-e0067-e007f.svg",
  "Croatia":            BASE+"1f1ed-1f1f7.svg",
  "Ghana":              BASE+"1f1ec-1f1ed.svg",
  "Panama":             BASE+"1f1f5-1f1e6.svg",
  "Congo DR":           BASE+"1f1e8-1f1e9.svg",
  "Scotland":           BASE+"1f3f4-e0067-e0062-e0073-e0063-e0074-e007f.svg",
}

function Flag({ name, size=14 }) {
  const url = FLAG_URLS[name]
  if (!url) return null
  return <img src={url} alt={name} width={size} height={size} style={{display:"inline-block",verticalAlign:"middle",marginRight:2,flexShrink:0}} loading="lazy"/>
}
const PT_NAMES = {
  "Mexico":"México","South Africa":"África do Sul","Korea Republic":"Coreia do Sul",
  "Czechia":"Rep. Checa","Czech Republic":"Rep. Checa","Canada":"Canadá",
  "Bosnia-Herzegovina":"Bósnia-Herz.","Qatar":"Qatar","Switzerland":"Suíça",
  "Brazil":"Brasil","Morocco":"Marrocos","Haiti":"Haiti","Scotland":"Escócia",
  "USA":"EUA","Paraguay":"Paraguai","Australia":"Austrália","Turkey":"Turquia",
  "Germany":"Alemanha","Curaçao":"Curaçau","Côte d'Ivoire":"C. do Marfim",
  "Ecuador":"Equador","Netherlands":"P. Baixos","Japan":"Japão","Sweden":"Suécia",
  "Tunisia":"Tunísia","Belgium":"Bélgica","Egypt":"Egito","IR Iran":"Irão",
  "New Zealand":"Nova Zelândia","Spain":"Espanha","Cabo Verde":"Cabo Verde",
  "Saudi Arabia":"A. Saudita","Uruguay":"Uruguai","France":"França","Senegal":"Senegal",
  "Iraq":"Iraque","Norway":"Noruega","Argentina":"Argentina","Algeria":"Argélia",
  "Austria":"Áustria","Jordan":"Jordânia","Portugal":"Portugal","Uzbekistan":"Uzbequistão",
  "Colombia":"Colômbia","England":"Inglaterra","Croatia":"Croácia","Ghana":"Gana",
  "Panama":"Panamá","Congo DR":"RD Congo",
}
function toPT(n) { return PT_NAMES[n] || n }
function flag(n) { return FLAGS[n] || "" }
function hasPortugal(t1,t2) { return t1==="Portugal"||t2==="Portugal" }

// ── BRACKET STATIC DATA ────────────────────────────────────────────────────────
// Source: eliminatorias.json + UTC offsets converted to Lisbon (WEST=UTC+1)
const BRACKET_MATCHES = {
  73: {num:73,round:"R32",team1:"2A",    team2:"2B",           date:"28/06",hora:"20:00",ground:"Los Angeles"},
  74: {num:74,round:"R32",team1:"1E",    team2:"3A/B/C/D/F",   date:"29/06",hora:"21:30",ground:"Boston"},
  75: {num:75,round:"R32",team1:"1F",    team2:"2C",           date:"30/06",hora:"02:00",ground:"Monterrey"},
  76: {num:76,round:"R32",team1:"1C",    team2:"2F",           date:"29/06",hora:"18:00",ground:"Houston"},
  77: {num:77,round:"R32",team1:"1I",    team2:"3C/D/F/G/H",   date:"30/06",hora:"22:00",ground:"Nova Iorque"},
  78: {num:78,round:"R32",team1:"2E",    team2:"2I",           date:"01/07",hora:"01:00",ground:"Dallas"},
  79: {num:79,round:"R32",team1:"1A",    team2:"3C/E/F/H/I",   date:"01/07",hora:"02:00",ground:"Cidade do México"},
  80: {num:80,round:"R32",team1:"1L",    team2:"3E/H/I/J/K",   date:"01/07",hora:"17:00",ground:"Atlanta"},
  81: {num:81,round:"R32",team1:"1D",    team2:"3B/E/F/I/J",   date:"02/07",hora:"02:00",ground:"S. Francisco"},
  82: {num:82,round:"R32",team1:"1G",    team2:"3A/E/H/I/J",   date:"01/07",hora:"21:00",ground:"Seattle"},
  83: {num:83,round:"R32",team1:"2K",    team2:"2L",           date:"03/07",hora:"00:00",ground:"Toronto"},
  84: {num:84,round:"R32",team1:"1H",    team2:"2J",           date:"02/07",hora:"20:00",ground:"Los Angeles"},
  85: {num:85,round:"R32",team1:"1B",    team2:"3E/F/G/I/J",   date:"03/07",hora:"04:00",ground:"Vancouver"},
  86: {num:86,round:"R32",team1:"1J",    team2:"2H",           date:"03/07",hora:"23:00",ground:"Miami"},
  87: {num:87,round:"R32",team1:"1K",    team2:"3D/E/I/J/L",   date:"04/07",hora:"02:30",ground:"Kansas City"},
  88: {num:88,round:"R32",team1:"2D",    team2:"2G",           date:"03/07",hora:"19:00",ground:"Dallas"},
  89: {num:89,round:"R16",team1:"V74",   team2:"V77",          date:"04/07",hora:"22:00",ground:"Filadélfia"},
  90: {num:90,round:"R16",team1:"V73",   team2:"V75",          date:"04/07",hora:"18:00",ground:"Houston"},
  91: {num:91,round:"R16",team1:"V76",   team2:"V78",          date:"05/07",hora:"21:00",ground:"Nova Iorque"},
  92: {num:92,round:"R16",team1:"V79",   team2:"V80",          date:"06/07",hora:"01:00",ground:"Cidade do México"},
  93: {num:93,round:"R16",team1:"V83",   team2:"V84",          date:"06/07",hora:"20:00",ground:"Dallas"},
  94: {num:94,round:"R16",team1:"V81",   team2:"V82",          date:"07/07",hora:"02:00",ground:"Seattle"},
  95: {num:95,round:"R16",team1:"V86",   team2:"V88",          date:"07/07",hora:"17:00",ground:"Atlanta"},
  96: {num:96,round:"R16",team1:"V85",   team2:"V87",          date:"08/07",hora:"02:00",ground:"Vancouver"},
  97: {num:97,round:"QF", team1:"V89",   team2:"V90",          date:"09/07",hora:"21:00",ground:"Boston"},
  98: {num:98,round:"QF", team1:"V93",   team2:"V94",          date:"10/07",hora:"20:00",ground:"Los Angeles"},
  99: {num:99,round:"QF", team1:"V91",   team2:"V92",          date:"11/07",hora:"22:00",ground:"Miami"},
 100: {num:100,round:"QF",team1:"V95",   team2:"V96",          date:"12/07",hora:"02:00",ground:"Kansas City"},
 101: {num:101,round:"SF",team1:"V97",   team2:"V98",          date:"14/07",hora:"20:00",ground:"Dallas"},
 102: {num:102,round:"SF",team1:"V99",   team2:"V100",         date:"15/07",hora:"20:00",ground:"Atlanta"},
 103: {num:103,round:"3rd",team1:"P101", team2:"P102",         date:"18/07",hora:"22:00",ground:"Miami"},
 104: {num:104,round:"final",team1:"V101",team2:"V102",        date:"19/07",hora:"20:00",ground:"Nova Iorque"},
}

// Tree structure: which two matches feed each subsequent match
// [top_child, bottom_child]
const BRACKET_TREE = {
  89:[74,77], 90:[73,75], 91:[76,78], 92:[79,80],
  93:[83,84], 94:[81,82], 95:[86,88], 96:[85,87],
  97:[89,90], 98:[93,94], 99:[91,92], 100:[95,96],
  101:[97,98], 102:[99,100],
  104:[101,102],
}

// Layout: R32 slots 0-15 (top to bottom), paired into R16 slots 0-7, etc.
// Order maps slot index to match number
const SLOT_ORDER = {
  R32: [74,76,77,78,  79,80,81,82,  73,75,83,84,  85,86,87,88],
  R16: [89,91,92,90,  93,94,95,96],  // must match R32 pairs
  QF:  [97,99,98,100],
  SF:  [101,102],
  Final:[104],
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function toLocalHour(kickoff_utc) {
  if (!kickoff_utc) return "--:--"
  return new Date(kickoff_utc).toLocaleTimeString("pt-PT",{hour:"2-digit",minute:"2-digit",timeZone:"Europe/Lisbon"})
}
function toLocalDate(kickoff_utc) {
  if (!kickoff_utc) return ""
  return new Date(kickoff_utc).toLocaleDateString("pt-PT",{weekday:"short",day:"numeric",month:"short",timeZone:"Europe/Lisbon"})
}
function toDateKey(kickoff_utc) {
  if (!kickoff_utc) return ""
  return new Date(kickoff_utc).toLocaleDateString("pt-PT",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:"Europe/Lisbon"})
}
function fmtShort(kickoff_utc) {
  if (!kickoff_utc) return ""
  return new Date(kickoff_utc).toLocaleDateString("pt-PT",{day:"2-digit",month:"2-digit",timeZone:"Europe/Lisbon"})
}

// ── COMPONENTS ────────────────────────────────────────────────────────────────
function TVBadge({ canal }) {
  const s = TV_COLORS[canal] || {bg:"#444",text:"#fff"}
  const style = {
    background:s.bg, color:s.text, fontSize:"9px", fontWeight:700,
    padding:"1px 5px", borderRadius:"3px", letterSpacing:"0.03em",
    whiteSpace:"nowrap", textDecoration:"none", display:"inline-block",
  }
  if (canal==="LV") return <a href="https://youtube.com/@livemodetv_pt" target="_blank" rel="noopener noreferrer" style={style}>{canal}</a>
  return <span style={style}>{canal}</span>
}

function StatusBadge({ match }) {
  const {status,phase,home_score,away_score,phase: ph} = match
  const isLive = status==="live"||ph==="1H"||ph==="HT"||ph==="2H"||ph==="ET1"||ph==="ET2"||ph==="PEN"
  const isDone = status==="completed"||ph==="FT"||ph==="FT_PEN"
  if (isLive) return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:"#f00",animation:"pulse 1s infinite"}}/>
      <span style={{color:"#f55",fontSize:"10px",fontWeight:700}}>{ph||"AO VIVO"}</span>
      <span style={{color:"#fff",fontWeight:700,fontSize:"13px"}}>{home_score}–{away_score}</span>
    </span>
  )
  if (isDone) return <span style={{color:"#aaa",fontSize:"13px",fontWeight:700}}>{home_score}–{away_score}{match.home_pen!=null?` (${match.home_pen}p–${match.away_pen}p)`:""}</span>
  return null
}

function MatchRow({ match }) {
  const t1=match.home_team, t2=match.away_team
  const isPT=hasPortugal(t1,t2)
  const tv=getTv(t1,t2)
  const hora=toLocalHour(match.kickoff_utc)
  const isDone=match.status==="completed"||match.phase==="FT"||match.phase==="FT_PEN"
  const isLive=match.status==="live"||match.phase==="1H"||match.phase==="HT"||match.phase==="2H"||match.phase==="ET1"||match.phase==="ET2"||match.phase==="PEN"
  const past=isDone

  // Determine winner for bold -- home wins if home_score > away_score, etc.
  const s1=match.home_score ?? null
  const s2=match.away_score ?? null
  const homePen=match.home_pen ?? null
  const awayPen=match.away_pen ?? null
  const homeWins = isDone && s1!=null && s2!=null && (
    homePen!=null ? homePen > awayPen : s1 > s2
  )
  const awayWins = isDone && s1!=null && s2!=null && (
    homePen!=null ? awayPen > homePen : s2 > s1
  )

  return (
    <div style={{
      background:isPT?"rgba(0,87,168,0.15)":isLive?"rgba(200,0,0,0.08)":"rgba(255,255,255,0.04)",
      border:isPT?"1px solid rgba(0,87,168,0.5)":isLive?"1px solid rgba(200,0,0,0.4)":"1px solid rgba(255,255,255,0.07)",
      borderRadius:"8px",padding:"8px 10px",marginBottom:"5px",opacity:past&&!isPT?0.55:1,
    }}>
      {/* Meta row: time + group + stadium */}
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
        {isLive
          ? <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#f00",animation:"pulse 1s infinite",flexShrink:0}}/>
              <span style={{color:"#f55",fontSize:"10px",fontWeight:700}}>{match.phase||"AO VIVO"}</span>
            </span>
          : <span style={{fontSize:"10px",color:"#777",fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap"}}>{hora}</span>
        }
        {match.group_name&&<span style={{fontSize:"9px",background:"rgba(255,255,255,0.1)",color:"#aaa",padding:"1px 4px",borderRadius:"3px",fontWeight:600}}>G{match.group_name}</span>}
        {match.stadium&&<span style={{fontSize:"9px",color:"#555",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📍 {match.stadium}</span>}
      </div>

      {/* Teams + score + TV */}
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        {/* Teams column */}
        <div style={{flex:1,minWidth:0}}>
          {/* Home team */}
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
            <Flag name={t1}/>
            <span style={{fontSize:"13px",color:"#eee",fontWeight:homeWins||isPT&&t1==="Portugal"?700:400}}>{toPT(t1)}</span>
            {isDone&&s1!=null&&<span style={{fontSize:"13px",color:"#fff",fontWeight:homeWins?700:400,marginLeft:"auto",paddingLeft:8}}>{s1}{homePen!=null?` (${homePen}p)`:""}</span>}
          </div>
          {/* Away team */}
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <Flag name={t2}/>
            <span style={{fontSize:"13px",color:"#eee",fontWeight:awayWins||isPT&&t2==="Portugal"?700:400}}>{toPT(t2)}</span>
            {isDone&&s2!=null&&<span style={{fontSize:"13px",color:"#fff",fontWeight:awayWins?700:400,marginLeft:"auto",paddingLeft:8}}>{s2}{awayPen!=null?` (${awayPen}p)`:""}</span>}
          </div>
          {/* Live score */}
          {isLive&&s1!=null&&(
            <div style={{fontSize:"15px",fontWeight:700,color:"#fff",marginTop:2}}>{s1} – {s2}</div>
          )}
        </div>

        {/* TV badges -- vertical stack */}
        <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end",flexShrink:0}}>
          {tv.map(t=><TVBadge key={t} canal={t}/>)}
        </div>
      </div>
    </div>
  )
}

// ── TAB: FIXTURES ─────────────────────────────────────────────────────────────
function FixturesTab({ matches, porOnly }) {
  const [filterGroup,setFilterGroup]=useState("ALL")
  const groups=["A","B","C","D","E","F","G","H","I","J","K","L"]
  const filtered=matches.filter(m=>{
    if(m.round!=="group")return false
    if(porOnly&&!hasPortugal(m.home_team,m.away_team))return false
    if(filterGroup!=="ALL"&&m.group_name!==filterGroup)return false
    return true
  })
  const byDate={}
  filtered.forEach(m=>{const k=toDateKey(m.kickoff_utc);if(!byDate[k])byDate[k]=[];byDate[k].push(m)})
  const todayKey=toDateKey(new Date().toISOString())
  return (
    <div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
        {["ALL",...groups].map(g=>(
          <button key={g} onClick={()=>setFilterGroup(g)} style={{
            padding:"3px 9px",borderRadius:"20px",border:"none",cursor:"pointer",
            fontSize:"11px",fontWeight:600,
            background:filterGroup===g?(g==="K"?"#0057A8":"rgba(255,255,255,0.9)"):"rgba(255,255,255,0.08)",
            color:filterGroup===g?(g==="K"?"#fff":"#000"):"#888",
          }}>{g==="ALL"?"Todos":`G${g}`}</button>
        ))}
      </div>
      {Object.keys(byDate).map(dk=>(
        <div key={dk}>
          <div style={{fontSize:"11px",fontWeight:700,color:dk===todayKey?"#4CAF50":"#666",letterSpacing:"0.06em",textTransform:"uppercase",margin:"10px 0 5px",paddingBottom:4,borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:6}}>
            {toLocalDate(byDate[dk][0].kickoff_utc)}
            {dk===todayKey&&<span style={{background:"#4CAF50",color:"#000",fontSize:"9px",padding:"1px 5px",borderRadius:"3px"}}>HOJE</span>}
          </div>
          {byDate[dk].map((m,i)=><MatchRow key={m.id||i} match={m}/>)}
        </div>
      ))}
      {Object.keys(byDate).length===0&&<div style={{textAlign:"center",color:"#555",padding:"40px 0",fontSize:"13px"}}>Sem jogos para este filtro.</div>}
    </div>
  )
}

// ── TAB: GRUPOS ───────────────────────────────────────────────────────────────
function GroupsTab({ standings }) {
  if(!standings||standings.length===0) return <div style={{color:"#555",textAlign:"center",padding:"40px 0"}}>A carregar classificações...</div>
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {standings.map(group=>(
        <div key={group.group_name} style={{
          background:group.group_name==="K"?"rgba(0,87,168,0.15)":"rgba(255,255,255,0.04)",
          border:group.group_name==="K"?"1px solid rgba(0,87,168,0.4)":"1px solid rgba(255,255,255,0.07)",
          borderRadius:"8px",padding:"10px 12px",
        }}>
          <div style={{fontSize:"11px",fontWeight:700,color:"#999",marginBottom:8,letterSpacing:"0.08em"}}>
            GRUPO {group.group_name} {group.group_name==="K"&&<Flag name="Portugal" size={12}/>}
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
            <thead>
              <tr style={{color:"#555",fontSize:"10px"}}>
                <th style={{textAlign:"left",paddingBottom:4,fontWeight:600}}>Equipa</th>
                <th style={{textAlign:"center",width:22,fontWeight:600}}>J</th>
                <th style={{textAlign:"center",width:22,fontWeight:600}}>V</th>
                <th style={{textAlign:"center",width:22,fontWeight:600}}>E</th>
                <th style={{textAlign:"center",width:22,fontWeight:600}}>D</th>
                <th style={{textAlign:"center",width:28,fontWeight:600}}>GD</th>
                <th style={{textAlign:"center",width:28,fontWeight:600}}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {(group.standings||[]).map((row,i)=>{
                const isQ=i<2
                const isPT=row.team_name==="Portugal"
                return (
                  <tr key={row.team_name} style={{borderTop:"1px solid rgba(255,255,255,0.05)",background:isPT?"rgba(0,87,168,0.1)":"transparent"}}>
                    <td style={{padding:"5px 0",display:"flex",alignItems:"center",gap:5}}>
                      <span style={{width:14,height:14,borderRadius:"50%",flexShrink:0,background:isQ?"#2ecc71":"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"8px",fontWeight:700,color:isQ?"#000":"#666"}}>{i+1}</span>
                      <Flag name={row.team_name}/><span style={{color:isPT?"#6fa8dc":"#ddd",fontWeight:isPT?700:400}}>{toPT(row.team_name)}</span>
                    </td>
                    <td style={{textAlign:"center",color:"#aaa"}}>{row.played??0}</td>
                    <td style={{textAlign:"center",color:"#aaa"}}>{row.won??0}</td>
                    <td style={{textAlign:"center",color:"#aaa"}}>{row.drawn??0}</td>
                    <td style={{textAlign:"center",color:"#aaa"}}>{row.lost??0}</td>
                    <td style={{textAlign:"center",color:row.goal_difference>0?"#2ecc71":row.goal_difference<0?"#e74c3c":"#aaa"}}>
                      {row.goal_difference>0?`+${row.goal_difference}`:row.goal_difference??0}
                    </td>
                    <td style={{textAlign:"center",color:"#fff",fontWeight:700}}>{row.points??0}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{fontSize:"9px",color:"#444",marginTop:6}}>● Top 2 qualificam-se · os 8 melhores 3ºs também avançam</div>
        </div>
      ))}
    </div>
  )
}

// ── TAB: ELIMINATÓRIAS -- SVG BRACKET ─────────────────────────────────────────

// Card dimensions
const CW = 158  // card width
const CH = 62   // card height
const GAP_Y = 10 // vertical gap between cards in same round
const COL_GAP = 48 // horizontal gap between rounds

// For each round, how many cards and their vertical positions
// We lay out R32 (16 cards) as the leftmost column
// Each subsequent round has half the cards, vertically centered between their pair

function getCardY(round, slotIdx) {
  // R32: 16 slots, each slot = CH + GAP_Y
  const unit = CH + GAP_Y
  if (round === "R32") return slotIdx * unit
  if (round === "R16") {
    // Each R16 card is centered between its 2 R32 children
    // R16 slot i is between R32 slots 2i and 2i+1
    const top = getCardY("R32", slotIdx*2)
    const bot = getCardY("R32", slotIdx*2+1) + CH
    return (top + bot) / 2 - CH/2
  }
  if (round === "QF") {
    const top = getCardY("R16", slotIdx*2)
    const bot = getCardY("R16", slotIdx*2+1) + CH
    return (top + bot) / 2 - CH/2
  }
  if (round === "SF") {
    const top = getCardY("QF", slotIdx*2)
    const bot = getCardY("QF", slotIdx*2+1) + CH
    return (top + bot) / 2 - CH/2
  }
  if (round === "Final") {
    const top = getCardY("SF", 0)
    const bot = getCardY("SF", 1) + CH
    return (top + bot) / 2 - CH/2
  }
  return 0
}

const ROUNDS = ["R32","R16","QF","SF","Final"]
const ROUND_LABELS = {R32:"16-AVOS",R16:"OITAVOS",QF:"QUARTOS",SF:"MEIAS",Final:"FINAL"}
const ROUND_COLORS = {R32:"#666",R16:"#888",QF:"#aaa",SF:"#FFD700",Final:"#e74c3c"}

// Slot order: which match num goes in each vertical slot per round
const SLOTS = {
  R32: [74,76,77,78, 79,80,81,82, 73,75,83,84, 85,86,87,88],
  R16: [89,91,92,90, 93,94,95,96],
  QF:  [97,99,98,100],
  SF:  [101,102],
  Final:[104],
}

// Map match num -> slot index per round
function buildSlotMap() {
  const m = {}
  Object.entries(SLOTS).forEach(([round, nums]) => {
    nums.forEach((num,idx) => { m[num] = { round, idx } })
  })
  return m
}
const SLOT_MAP = buildSlotMap()

function getColX(round) {
  const idx = ROUNDS.indexOf(round)
  return idx * (CW + COL_GAP)
}

// Total SVG dimensions
const TOTAL_H = 16 * (CH + GAP_Y) + 60  // header space
const TOTAL_W = ROUNDS.length * (CW + COL_GAP) + 20
const HEADER_H = 28

function BracketCard({ matchNum, apiMatches, x, y }) {
  const static_m = BRACKET_MATCHES[matchNum]
  if (!static_m) return null

  // Try to get live data from API
  const api_m = apiMatches.find(m => m.match_number === matchNum)

  const t1 = api_m?.home_team || null
  const t2 = api_m?.away_team || null
  const score1 = api_m?.home_score
  const score2 = api_m?.away_score
  const isDone = api_m?.status === "completed" || api_m?.phase === "FT" || api_m?.phase === "FT_PEN"
  const isLive = api_m?.status === "live"
  const isPT = t1==="Portugal"||t2==="Portugal"

  const label1 = t1 ? `$<Flag name={t1}/> ${toPT(t1)}` : static_m.team1
  const label2 = t2 ? `$<Flag name={t2}/> ${toPT(t2)}` : static_m.team2
  const isTeamLabel1 = !t1
  const isTeamLabel2 = !t2

  const borderCol = isPT ? "rgba(0,87,168,0.6)" : isLive ? "rgba(200,0,0,0.5)" : "rgba(255,255,255,0.12)"
  const bgCol = isPT ? "rgba(0,87,168,0.18)" : "rgba(255,255,255,0.05)"

  return (
    <foreignObject x={x} y={y} width={CW} height={CH}>
      <div xmlns="http://www.w3.org/1999/xhtml" style={{
        background:bgCol, border:`1px solid ${borderCol}`,
        borderRadius:6, padding:"5px 7px", height:CH,
        boxSizing:"border-box", overflow:"hidden",
        fontFamily:"'Inter',-apple-system,sans-serif",
      }}>
        <div style={{fontSize:"8px",color:"#555",marginBottom:3,display:"flex",justifyContent:"space-between"}}>
          <span>#{matchNum} · {static_m.date} {static_m.hora}</span>
          {isLive&&<span style={{color:"#f55",fontWeight:700}}>AO VIVO</span>}
        </div>
        {/* Team 1 */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
          <span style={{fontSize:"11px",color:isTeamLabel1?"#555":"#ddd",fontWeight:isPT&&t1==="Portugal"?700:400,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:110}}>
            {label1}
          </span>
          {isDone||isLive ? <span style={{fontSize:"12px",color:"#fff",fontWeight:700,marginLeft:4}}>{score1??""}</span> : null}
        </div>
        {/* Team 2 */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:"11px",color:isTeamLabel2?"#555":"#ddd",fontWeight:isPT&&t2==="Portugal"?700:400,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:110}}>
            {label2}
          </span>
          {isDone||isLive ? <span style={{fontSize:"12px",color:"#fff",fontWeight:700,marginLeft:4}}>{score2??""}</span> : null}
        </div>
        <div style={{fontSize:"8px",color:"#444",marginTop:3}}>📍 {static_m.ground}</div>
      </div>
    </foreignObject>
  )
}

function KnockoutTab({ matches }) {
  // Build connector lines: for each round > R32, draw lines from children to parent
  const lines = []
  const lineKey = useRef(0)

  ROUNDS.forEach((round, rIdx) => {
    if (rIdx === 0) return // R32 has no children to connect from
    const slots = SLOTS[round]
    slots.forEach((matchNum, slotIdx) => {
      const children = BRACKET_TREE[matchNum]
      if (!children) return
      const [childA, childB] = children
      const slotA = SLOT_MAP[childA]
      const slotB = SLOT_MAP[childB]
      if (!slotA || !slotB) return

      const prevRound = ROUNDS[rIdx-1]
      const xRight = getColX(prevRound) + CW  // right edge of child cards
      const yA = HEADER_H + getCardY(slotA.round, slotA.idx) + CH/2
      const yB = HEADER_H + getCardY(slotB.round, slotB.idx) + CH/2
      const xLeft = getColX(round)
      const yParent = HEADER_H + getCardY(round, slotIdx) + CH/2
      const xMid = xRight + COL_GAP/2

      lines.push(
        <g key={`line-${matchNum}`} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none">
          <path d={`M${xRight},${yA} H${xMid} V${yParent} H${xLeft}`}/>
          <path d={`M${xRight},${yB} H${xMid} V${yParent} H${xLeft}`}/>
        </g>
      )
    })
  })

  // 3rd place card -- positioned below Final
  const finalY = HEADER_H + getCardY("Final", 0)
  const thirdY = finalY + CH + 30
  const finalX = getColX("Final")

  return (
    <div>
      <div style={{fontSize:"11px",color:"#555",marginBottom:8}}>← Scroll para ver todas as fases →</div>
      <div style={{overflowX:"auto",overflowY:"auto",WebkitOverflowScrolling:"touch",paddingBottom:16}}>
        <svg width={TOTAL_W} height={TOTAL_H + 110} style={{display:"block"}}>
          {/* Round headers */}
          {ROUNDS.map(round=>(
            <g key={`hdr-${round}`}>
              <text
                x={getColX(round) + CW/2} y={18}
                textAnchor="middle" fill={ROUND_COLORS[round]}
                fontSize="10" fontWeight="700" fontFamily="Inter,-apple-system,sans-serif"
                letterSpacing="1"
              >{ROUND_LABELS[round]}</text>
              <line x1={getColX(round)} y1={22} x2={getColX(round)+CW} y2={22} stroke={ROUND_COLORS[round]+"44"} strokeWidth="1"/>
            </g>
          ))}

          {/* Connector lines */}
          {lines}

          {/* Match cards */}
          {ROUNDS.map(round=>
            SLOTS[round].map((matchNum,slotIdx)=>(
              <BracketCard
                key={matchNum}
                matchNum={matchNum}
                apiMatches={matches}
                x={getColX(round)}
                y={HEADER_H + getCardY(round, slotIdx)}
              />
            ))
          )}

          {/* 3rd place */}
          <text x={finalX+CW/2} y={thirdY-8} textAnchor="middle" fill="#666" fontSize="9" fontWeight="700" fontFamily="Inter,-apple-system,sans-serif" letterSpacing="1">3º LUGAR</text>
          <BracketCard matchNum={103} apiMatches={matches} x={finalX} y={thirdY}/>
        </svg>
      </div>
    </div>
  )
}

// ── TAB: TV PT ────────────────────────────────────────────────────────────────
function TvTab() {
  return (
    <div style={{color:"#ccc",fontSize:"13px"}}>
      <div style={{fontWeight:700,color:"#fff",marginBottom:12}}>Onde ver em Portugal</div>
      {Object.entries(TV_COLORS).map(([canal,s])=>(
        <div key={canal} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
          <TVBadge canal={canal}/>
          <span style={{fontSize:"12px"}}>{{
            "RTP1":"Sinal aberto · RTP Play (grátis)",
            "SIC":"Sinal aberto · SIC Opto (grátis)",
            "TVI":"Sinal aberto · TVI Player (grátis)",
            "LV":"LiveModeTV YouTube · 34 jogos grátis incl. todos de Portugal",
            "SPTV":"Sport TV · Todos os 104 jogos (subscrição)",
          }[canal]}</span>
        </div>
      ))}
      <div style={{marginTop:16,padding:12,background:"rgba(0,87,168,0.15)",borderRadius:8,border:"1px solid rgba(0,87,168,0.3)",lineHeight:2.2}}>
        <div style={{fontWeight:700,color:"#6fa8dc",marginBottom:6}}>Portugal -- Grupo K</div>
        <div>17 Jun · Portugal vs RD Congo · <TVBadge canal="SIC"/></div>
        <div>23 Jun · Portugal vs Uzbequistão · <TVBadge canal="TVI"/></div>
        <div>28 Jun · Colômbia vs Portugal · <TVBadge canal="RTP1"/></div>
      </div>
      <div style={{marginTop:10,fontSize:"11px",color:"#555",lineHeight:1.6}}>
        Horários em hora de Portugal Continental (WEST · UTC+1). Fase a eliminar: canais a confirmar oficialmente.
      </div>
    </div>
  )
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]=useState("fixtures")
  const [porOnly,setPorOnly]=useState(false)
  const [data,setData]=useState(null)
  const [error,setError]=useState(null)
  const [lastUpdate,setLastUpdate]=useState(null)

  async function loadData() {
    setError(null)
    try {
      const base=import.meta.env.BASE_URL
      const res=await fetch(`${base}live.json?t=${Date.now()}`)
      if(!res.ok) throw new Error(`HTTP ${res.status}`)
      const json=await res.json()
      setData(json)
      setLastUpdate(new Date(json.fetched_at))
    } catch(e) {
      setError("Não foi possível carregar os dados ao vivo.")
    }
  }

  useEffect(()=>{
    loadData()
    const iv=setInterval(loadData,5*60*1000)
    return ()=>clearInterval(iv)
  },[])

  const matches=data?.matches||[]
  const standings=data?.standings||[]

  const tabs=[
    {id:"fixtures",label:"Calendário"},
    {id:"groups",label:"Grupos"},
    {id:"knockout",label:"Eliminatórias"},
    {id:"tv",label:"TV PT"},
  ]

  return (
    <>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0a0a0f}
        ::-webkit-scrollbar{height:4px;width:4px}
        ::-webkit-scrollbar-thumb{background:#333;border-radius:2px}
      `}</style>
      <div style={{minHeight:"100vh",background:"#0a0a0f",color:"#e0e0e0",fontFamily:"'Inter',-apple-system,sans-serif",maxWidth:"480px",margin:"0 auto",paddingBottom:40}}>
        <div style={{padding:"16px 16px 10px",borderBottom:"1px solid rgba(255,255,255,0.07)",position:"sticky",top:0,background:"#0a0a0f",zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <div>
              <div style={{fontSize:"17px",fontWeight:800,letterSpacing:"-0.02em",color:"#fff"}}><img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26bd.svg" alt="football" width="18" height="18" style={{display:"inline-block",verticalAlign:"middle",marginRight:4}}/> Mundial 2026</div>
              <div style={{fontSize:"10px",color:"#444",marginTop:1}}>
                {lastUpdate?`Atualizado ${lastUpdate.toLocaleTimeString("pt-PT",{hour:"2-digit",minute:"2-digit"})}`:"11 Jun – 19 Jul · USA / CAN / MEX"}
              </div>
            </div>
            <button onClick={()=>setPorOnly(!porOnly)} style={{padding:"5px 11px",borderRadius:"20px",border:"none",cursor:"pointer",background:porOnly?"#0057A8":"rgba(255,255,255,0.08)",color:porOnly?"#fff":"#777",fontSize:"12px",fontWeight:600}}>
              <Flag name="Portugal" size={13}/> {porOnly?"Só PT":"Portugal"}
            </button>
          </div>
          <div style={{display:"flex",gap:3}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"6px 0",borderRadius:"6px",border:"none",cursor:"pointer",background:tab===t.id?"rgba(255,255,255,0.12)":"transparent",color:tab===t.id?"#fff":"#555",fontSize:tab===t.id?"11px":"10px",fontWeight:tab===t.id?700:400}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{padding:"12px 16px"}}>
          {error&&(
            <div style={{background:"rgba(200,0,0,0.1)",border:"1px solid rgba(200,0,0,0.3)",borderRadius:8,padding:"12px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:"#e55",fontSize:"12px"}}>⚠ {error}</span>
              <button onClick={loadData} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"#aaa",fontSize:"11px",padding:"4px 10px",borderRadius:5,cursor:"pointer"}}>Tentar novamente</button>
            </div>
          )}
          {!data&&!error?(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:12}}>
              <div style={{fontSize:"32px"}}>⚽</div>
              <div style={{color:"#555",fontSize:"13px"}}>A carregar dados...</div>
            </div>
          ):(
            <>
              {tab==="fixtures"  &&<FixturesTab matches={matches} porOnly={porOnly}/>}
              {tab==="groups"    &&<GroupsTab standings={standings}/>}
              {tab==="knockout"  &&<KnockoutTab matches={matches}/>}
              {tab==="tv"        &&<TvTab/>}
            </>
          )}
        </div>
      </div>
    </>
  )
}
