"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";

import {
  Home, BarChart2, Package, ShoppingCart, TrendingUp, Activity,
  ChevronDown, ChevronUp, Download, Calendar, Search,
} from "lucide-react";

import { useEffect, useState } from "react";

const fmt = (n) => n?.toLocaleString() ?? "–";

function makeLabel(name) {
  if (!name) return "Unknown";
  if (name.includes(" | ")) {
    const parts = name.split(" | ");
    if (parts.length >= 4) return `${parts[2]} - ${parts[3]}`;
    if (parts.length === 3) return `${parts[1]} - ${parts[2]}`;
    return parts.slice(1).join(" - ");
  }
  return name;
}

function CircleProgress({ pct, color, label, sublabel }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#ffffff15" strokeWidth="8" />
          <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{pct}%</span>
        </div>
      </div>
      <p className="font-semibold text-white text-sm">{label}</p>
      <p className="text-xs text-white" style={{ opacity: 0.5 }}>{sublabel}</p>
    </div>
  );
}

function ForecastPage({ data, days }) {
  const field_xgb   = days === 7 ? "xgb"   : "xgb_14";
  const field_lstm  = days === 7 ? "lstm"  : "lstm_14";
  const field_final = days === 7 ? "final" : "final_14";

  const enriched = data.map((d) => ({
    ...d,
    xgb_14:   d.xgb_14   ?? Math.round((d.xgb   || 0) * 2),
    lstm_14:  d.lstm_14  ?? Math.round((d.lstm  || 0) * 2),
    final_14: d.final_14 ?? Math.round((d.final || 0) * 2),
  }));

  const totalUnits     = enriched.reduce((s, d) => s + (d[field_final] || 0), 0);
  const productOptions = enriched.map((d) => d.display_label ?? makeLabel(d.name));
  const [selectedIdx, setSelectedIdx] = useState(0);
  const sel = enriched[selectedIdx] || {};

  const xgbVal   = sel[field_xgb]   || sel.xgb   || 0;
  const lstmVal  = sel[field_lstm]  || sel.lstm  || 0;
  const finalVal = sel[field_final] || sel.final || 0;

  const isHighDemand = finalVal > xgbVal;
  const demandLabel  = isHighDemand ? "High demand" : "Stable demand";
  const demandColor  = isHighDemand ? "#f59e0b"     : "#22c55e";

  const [tab, setTab]         = useState("model");
  const [showRaw, setShowRaw] = useState(false);

  const topProducts = [...enriched]
    .sort((a, b) => (b[field_final] || 0) - (a[field_final] || 0))
    .slice(0, 10);
  const maxVal = topProducts[0]?.[field_final] || 1;

  const glass = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      <div style={{ ...glass, padding: "16px 20px" }}>
        <p style={{ fontSize: 11, opacity: 0.45, marginBottom: 4 }}>Total Required Units</p>
        <p style={{ fontSize: 28, fontWeight: 700 }}>{fmt(totalUnits)}</p>
      </div>

      <div>
        <p style={{ fontSize: 12, opacity: 0.45, marginBottom: 6 }}>Select Product</p>
        <div style={{ position: "relative" }}>
          <select value={selectedIdx} onChange={(e) => setSelectedIdx(Number(e.target.value))}
            style={{
              width: "100%", background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
              color: "#fff", padding: "10px 36px 10px 14px", fontSize: 13,
              appearance: "none", cursor: "pointer",
            }}>
            {productOptions.map((label, i) => (
              <option key={i} value={i} style={{ background: "#0d1f12" }}>{label}</option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.5, pointerEvents: "none" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[{ label: "XGBoost", value: xgbVal }, { label: "LSTM", value: lstmVal }, { label: "Final", value: finalVal }].map((m) => (
          <div key={m.label} style={{ ...glass, padding: "16px 20px" }}>
            <p style={{ fontSize: 11, opacity: 0.4, marginBottom: 6 }}>{m.label}</p>
            <p style={{ fontSize: 26, fontWeight: 700 }}>{fmt(m.value)}</p>
          </div>
        ))}
      </div>

      <div style={{ background: `${demandColor}18`, border: `1px solid ${demandColor}40`, borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: demandColor, fontWeight: 600 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: demandColor, flexShrink: 0 }} />
        {demandLabel}
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {[["model", "Model Comparison"], ["top", "Top Products"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ background: "none", border: "none", borderBottom: tab === key ? "2px solid #ef4444" : "2px solid transparent", color: tab === key ? "#ef4444" : "rgba(255,255,255,0.45)", fontWeight: tab === key ? 600 : 400, fontSize: 13, padding: "8px 16px", cursor: "pointer", marginBottom: -1 }}>{label}</button>
        ))}
      </div>

      {tab === "model" && (
        <div style={{ ...glass, padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[{ label: "XGBoost", value: xgbVal }, { label: "LSTM", value: lstmVal }, { label: "Ensemble", value: finalVal }].map((m) => (
              <div key={m.label}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[{ model: m.label, Units: m.value }]} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="model" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
                    <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} />
                    <Tooltip contentStyle={{ background: "#0d1f12", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} formatter={(v) => [fmt(v), "Units"]} />
                    <Bar dataKey="Units" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p style={{ textAlign: "center", fontSize: 11, opacity: 0.4, marginTop: 4 }}>Model</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "top" && (
        <div style={{ ...glass, padding: 20 }}>
          {topProducts.map((p, i) => {
            const val  = p[field_final] || 0;
            const pct  = Math.round((val / maxVal) * 100);
            const name = p.display_label ?? makeLabel(p.name);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 11, opacity: 0.35, width: 16, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, opacity: 0.75, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
                  <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
                    <div style={{ height: 5, borderRadius: 99, width: `${pct}%`, background: "linear-gradient(90deg,#22c55e,#4ade80)" }} />
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.65, width: 52, textAlign: "right", flexShrink: 0 }}>{fmt(val)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ ...glass, overflow: "hidden" }}>
        <button onClick={() => setShowRaw(!showRaw)} style={{ width: "100%", background: "none", border: "none", color: "#fff", padding: "14px 20px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
          {showRaw ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          View Raw Data
        </button>
        {showRaw && (
          <div style={{ overflowX: "auto", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 900 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                  {["#", "Product", "XGB 7d", "LSTM 7d", "Final 7d", "XGB 14d", "LSTM 14d", "Final 14d"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", opacity: 0.45, fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enriched.map((d, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "8px 12px", opacity: 0.3 }}>{i}</td>
                    <td style={{ padding: "8px 12px", opacity: 0.8, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.display_label ?? makeLabel(d.name)}</td>
                    <td style={{ padding: "8px 12px" }}>{fmt(d.xgb)}</td>
                    <td style={{ padding: "8px 12px" }}>{fmt(d.lstm)}</td>
                    <td style={{ padding: "8px 12px", color: "#22c55e", fontWeight: 600 }}>{fmt(d.final)}</td>
                    <td style={{ padding: "8px 12px" }}>{fmt(d.xgb_14)}</td>
                    <td style={{ padding: "8px 12px" }}>{fmt(d.lstm_14)}</td>
                    <td style={{ padding: "8px 12px", color: "#facc15", fontWeight: 600 }}>{fmt(d.final_14)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [view, setView]                   = useState("dashboard");
  const [allData, setAllData]             = useState([]);
  const [search, setSearch]               = useState("");
  const [forecastRange, setForecastRange] = useState("7 Days");

  useEffect(() => {
    fetch("/data.json").then((r) => r.json()).then((r) => setAllData(r)).catch(console.error);
  }, []);

  // Global filter — applied to ALL pages
  const data = search.trim() === ""
    ? allData
    : allData.filter((d) => {
        const label = (d.display_label ?? d.name ?? "").toLowerCase();
        return label.includes(search.toLowerCase());
      });

  // Working CSV export of filtered data
  const handleExport = () => {
    if (!data.length) return;
    const headers = ["Product", "XGB 7d", "LSTM 7d", "Final 7d", "XGB 14d", "LSTM 14d", "Final 14d"];
    const rows = data.map((d) => [
      `"${d.display_label ?? makeLabel(d.name)}"`,
      d.xgb   ?? "",
      d.lstm  ?? "",
      d.final ?? "",
      d.xgb_14   ?? "",
      d.lstm_14  ?? "",
      d.final_14 ?? "",
    ]);
    const csv  = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `inventory_forecast_${search ? "filtered_" : ""}${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalUnits7   = data.reduce((s, d) => s + (d.final || 0), 0);
  const totalUnits14  = data.reduce((s, d) => s + (d.final_14 ?? (d.final || 0) * 2), 0);
  const highDemand    = data.filter((d) => (d.final || 0) > (d.xgb || 0)).length;
  const totalProducts = data.length;

  const top10    = [...data].sort((a, b) => (b.final || 0) - (a.final || 0)).slice(0, 10);
  const maxFinal = top10[0]?.final || 1;

  const days7  = ["May 17","May 18","May 19","May 20","May 21","May 22","May 23"];
  const days14 = [...days7,"May 24","May 25","May 26","May 27","May 28","May 29","May 30"];
  const activeDays = forecastRange === "7 Days" ? days7 : days14;
  const chartData = activeDays.map((day, i) => {
    const d = data[i] || {};
    return {
      day,
      XGBoost:            d.xgb   || 0,
      "LSTM + Attention": d.lstm  || 0,
      "Ensemble (Final)": d.final || 0,
    };
  });

  const nav = [
    { id: "dashboard", label: "Dashboard",       icon: Home },
    { id: "7day",      label: "7-Day Forecast",  icon: BarChart2 },
    { id: "14day",     label: "14-Day Forecast", icon: BarChart2 },
  ];

  const pageTitle = {
    dashboard: "Dashboard",
    "7day":    "7-Day Forecast",
    "14day":   "14-Day Forecast",
  }[view] ?? "Dashboard";

  const glass = (extra = {}) => ({
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    backdropFilter: "blur(12px)",
    ...extra,
  });

  return (
    <div className="min-h-screen text-white flex" style={{ background: "linear-gradient(135deg,#0a1a0f 0%,#0d1f12 50%,#0a1a0f 100%)", fontFamily: "'Inter', sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "url('/bg.jpg')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.18 }} />

      {/* SIDEBAR */}
      <aside className="relative z-10 flex flex-col" style={{ width: 220, minHeight: "100vh", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(255,255,255,0.07)", padding: "28px 0" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 24px", marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#22c55e,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShoppingCart size={18} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Inventory AI</p>
            <p style={{ fontSize: 11, opacity: 0.4 }}>Forecast Dashboard</p>
          </div>
        </div>

        {/* Nav links — Products removed */}
        <nav style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {nav.map(({ id, label, icon: Icon }) => {
            const active = view === id;
            return (
              <div key={id} onClick={() => setView(id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, background: active ? "rgba(34,197,94,0.15)" : "transparent", color: active ? "#22c55e" : "rgba(255,255,255,0.6)", borderLeft: active ? "2px solid #22c55e" : "2px solid transparent", transition: "all 0.15s" }}>
                <Icon size={16} />{label}
              </div>
            );
          })}
        </nav>

        {/* Global Search — filters all pages */}
        <div style={{ padding: "24px 12px 0" }}>
          <p style={{ fontSize: 11, opacity: 0.4, marginBottom: 8, paddingLeft: 4 }}>Search Product</p>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.4, pointerEvents: "none" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. Whole Milk"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                color: "#fff",
                padding: "9px 10px 9px 30px",
                fontSize: 12,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          {search && (
            <p style={{ fontSize: 10, opacity: 0.4, marginTop: 6, paddingLeft: 4 }}>
              {data.length} product{data.length !== 1 ? "s" : ""} matched
            </p>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main className="relative z-10 flex-1 flex flex-col" style={{ padding: "28px 32px", gap: 24, overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{pageTitle}</h1>
            <p style={{ fontSize: 13, opacity: 0.45, marginTop: 4 }}>
              {view === "dashboard"
                ? search
                  ? `Showing results for "${search}" — ${data.length} products`
                  : "Welcome back! Here's your inventory forecast overview."
                : search
                  ? `Filtered: "${search}" — ${data.length} products`
                  : "Inventory insights powered by AI"}
            </p>
          </div>
          {view === "dashboard" && (
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...glass(), padding: "8px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, color: "#fff", cursor: "pointer", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Calendar size={14} /> May 17 – May 24, 2025 <ChevronDown size={13} style={{ opacity: 0.5 }} />
              </button>
              <button
                onClick={handleExport}
                style={{ background: "#22c55e", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 600, color: "#000", border: "none", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <Download size={14} /> Export Report
              </button>
            </div>
          )}
        </div>

        {/* DASHBOARD VIEW */}
        {view === "dashboard" && (
          <>
            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              {[
                { icon: <ShoppingCart size={20} style={{ color: "#22c55e" }} />, iconBg: "rgba(34,197,94,0.12)",  label: "Total Units (7 Days)",  value: fmt(totalUnits7),   trend: "+12.4%", sub: "vs last 7 days" },
                { icon: <Package      size={20} style={{ color: "#3b82f6" }} />, iconBg: "rgba(59,130,246,0.12)", label: "Total Units (14 Days)", value: fmt(totalUnits14),  trend: "+18.7%", sub: "vs last 14 days" },
                { icon: <TrendingUp   size={20} style={{ color: "#f59e0b" }} />, iconBg: "rgba(245,158,11,0.12)", label: "High Demand SKUs",       value: fmt(highDemand),    trend: "+8.6%",  sub: "vs last 7 days" },
                { icon: <Activity     size={20} style={{ color: "#a855f7" }} />, iconBg: "rgba(168,85,247,0.12)", label: "Total Products",         value: fmt(totalProducts), trend: null,     sub: "Active in system" },
              ].map((card, i) => (
                <div key={i} style={{ ...glass(), padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>{card.icon}</div>
                  <div>
                    <p style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}>{card.label}</p>
                    <p style={{ fontSize: 24, fontWeight: 700 }}>{card.value}</p>
                  </div>
                  <div style={{ fontSize: 11 }}>
                    {card.trend && <span style={{ color: "#22c55e", fontWeight: 600 }}>↑ {card.trend} </span>}
                    <span style={{ opacity: 0.4 }}>{card.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart + Top 10 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 14 }}>
              <div style={{ ...glass(), padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 600 }}>Forecast Comparison ({forecastRange})</h2>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["7 Days","14 Days"].map((opt) => (
                      <button key={opt} onClick={() => setForecastRange(opt)} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 8, cursor: "pointer", background: forecastRange === opt ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)", color: forecastRange === opt ? "#22c55e" : "rgba(255,255,255,0.5)", border: forecastRange === opt ? "1px solid rgba(34,197,94,0.4)" : "1px solid transparent" }}>{opt}</button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} barGap={2} barSize={forecastRange === "14 Days" ? 8 : 14}>
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10 }} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v/1000)}k`} />
                    <Tooltip contentStyle={{ background: "#0d1f12", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 11 }} formatter={(v) => fmt(v)} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar dataKey="XGBoost"          fill="#22c55e" radius={[4,4,0,0]} />
                    <Bar dataKey="LSTM + Attention" fill="#3b82f6" radius={[4,4,0,0]} />
                    <Bar dataKey="Ensemble (Final)" fill="#facc15" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top 10 — View All removed */}
              <div style={{ ...glass(), padding: 24, display: "flex", flexDirection: "column" }}>
                <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Top 10 Products (7-Day Forecast)</h2>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  {top10.map((p, i) => {
                    const pct  = Math.round(((p.final || 0) / maxFinal) * 100);
                    const name = p.display_label ?? makeLabel(p.name);
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, opacity: 0.35, width: 14, textAlign: "right" }}>{i + 1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 10, opacity: 0.75, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
                          <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
                            <div style={{ height: 4, borderRadius: 99, width: `${pct}%`, background: "linear-gradient(90deg,#22c55e,#4ade80)" }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.65, width: 44, textAlign: "right" }}>{fmt(p.final)}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12, marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ opacity: 0.4 }}>Total Units</span>
                  <span style={{ fontWeight: 700, color: "#22c55e" }}>{fmt(top10.reduce((s, p) => s + (p.final || 0), 0))}</span>
                </div>
              </div>
            </div>

            {/* Model Performance + Alerts — View All removed */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 14 }}>
              <div style={{ ...glass(), padding: 24 }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 24 }}>Model Performance Overview</h2>
                <div style={{ display: "flex", justifyContent: "space-around" }}>
                  <CircleProgress pct={92} color="#22c55e" label="XGBoost"          sublabel="Accuracy" />
                  <CircleProgress pct={94} color="#3b82f6" label="LSTM + Attention" sublabel="Accuracy" />
                  <CircleProgress pct={96} color="#facc15" label="Ensemble (Final)" sublabel="Accuracy" />
                </div>
              </div>
              <div style={{ ...glass(), padding: 24 }}>
                <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Recent Alerts</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { dot: "#ef4444", bg: "rgba(239,68,68,0.12)",  msg: "High demand predicted for 45 SKUs in next 7 days", time: "2 hours ago" },
                    { dot: "#f59e0b", bg: "rgba(245,158,11,0.12)", msg: "Low stock expected for 12 SKUs in next 3 days",    time: "5 hours ago" },
                    { dot: "#22c55e", bg: "rgba(34,197,94,0.12)",  msg: "Inventory levels optimal for 78% of products",    time: "1 day ago" },
                  ].map((a, i) => (
                    <div key={i} style={{ background: a.bg, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 10, border: `1px solid ${a.dot}22` }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: a.dot, flexShrink: 0, marginTop: 3 }} />
                      <p style={{ fontSize: 11, opacity: 0.8, flex: 1, lineHeight: 1.5 }}>{a.msg}</p>
                      <span style={{ fontSize: 10, opacity: 0.3, whiteSpace: "nowrap" }}>{a.time}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12, marginTop: 14, fontSize: 11, opacity: 0.3 }}>
                  <p>Data Last Updated</p>
                  <p>May 24, 2025 10:30 AM</p>
                </div>
              </div>
            </div>
          </>
        )}

        {view === "7day"  && <ForecastPage data={data} days={7}  />}
        {view === "14day" && <ForecastPage data={data} days={14} />}
      </main>
    </div>
  );
}