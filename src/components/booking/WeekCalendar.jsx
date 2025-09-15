import { useMemo, useState, useEffect } from "react";

// Utils (ISO week: lundi)
const startOfISOWeek = (d) => {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (date.getDay() + 6) % 7; // 0 = lundi .. 6 = dimanche
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
};
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const pad2 = (n) => String(n).padStart(2, "0");

// Construit DTO pour UNE semaine (jours cochés + intervalle) à partir d'une plage baseStart/baseEnd
const buildTimeSlotPayloadsForWeek = ({ weekStart, selectedDays, baseStart, baseEnd, intervalMin }) => {
  if (!weekStart || !baseStart || !baseEnd) return [];
  const startTotal = baseStart.getHours() * 60 + baseStart.getMinutes();
  const endTotal   = baseEnd.getHours()   * 60 + baseEnd.getMinutes();
  if (endTotal <= startTotal) return [];

  const payloads = [];
  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    if (!selectedDays[dayIdx]) continue;
    const baseDay = addDays(weekStart, dayIdx);
    for (let cur = startTotal; cur + intervalMin <= endTotal; cur += intervalMin) {
      const sH = Math.floor(cur / 60), sM = cur % 60;
      const eT = cur + intervalMin, eH = Math.floor(eT / 60), eM = eT % 60;
      const start = new Date(baseDay); start.setHours(sH, sM, 0, 0);
      const end   = new Date(baseDay); end.setHours(eH, eM, 0, 0);
      payloads.push({ startTime: start.toISOString(), endTime: end.toISOString(), isActive: true });
    }
  }
  return payloads;
};

export default function WeekCalendar({
  anchorDate,
  startHour = 6,
  endHour = 21,
  selectable = true,
  onSlotsChange, // ← renvoie les DTO générés pour la SEMAINE COURANTE uniquement
}) {
  if (!anchorDate) {
    return (
      <div className="week-calendar">
        <div className="week-calendar__empty">Sélectionnez un jour dans le calendrier.</div>
      </div>
    );
  }

  const weekStart = useMemo(() => startOfISOWeek(anchorDate), [anchorDate]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  // Grille 30 min
  const slots = useMemo(() => {
    const s = [];
    for (let h = startHour; h <= endHour; h++) {
      s.push({ kind: "full", hour: h });         // HH:00
      if (h < endHour) s.push({ kind: "half", hour: h }); // HH:30
    }
    return s;
  }, [startHour, endHour]);

  // Drag-to-select (snap 00/30 ⇒ si on clique entre deux lignes, on snap au-dessus)
  const [drag, setDrag] = useState(null); // { dayIndex, startIdx, hoverIdx }
  const [baseStart, setBaseStart] = useState(null);
  const [baseEnd, setBaseEnd] = useState(null);

  const slotStartDate = (dayIdx, slotIdx) => {
    const base = days[dayIdx];
    const s = slots[slotIdx];
    const H = s.hour;
    const M = s.kind === "half" ? 30 : 0;
    const d = new Date(base);
    d.setHours(H, M, 0, 0);
    return d;
  };

  const isSelected = (dayIdx, slotIdx) => {
    if (!drag || dayIdx !== drag.dayIndex) return false;
    const a = Math.min(drag.startIdx, drag.hoverIdx ?? drag.startIdx);
    const b = Math.max(drag.startIdx, drag.hoverIdx ?? drag.startIdx);
    return slotIdx >= a && slotIdx <= b;
  };

  const handleDown = (dayIdx, slotIdx, e) => {
    if (!selectable) return;
    e.preventDefault();
    setDrag({ dayIndex: dayIdx, startIdx: slotIdx, hoverIdx: slotIdx });
  };

  const handleEnter = (dayIdx, slotIdx) => {
    if (!selectable || !drag) return;
    if (dayIdx !== drag.dayIndex) return; // monojour
    setDrag((d) => ({ ...d, hoverIdx: slotIdx }));
  };

  const handleUp = (dayIdx) => {
    if (!selectable || !drag) return;
    if (dayIdx !== drag.dayIndex) { setDrag(null); return; }
    const a = Math.min(drag.startIdx, drag.hoverIdx ?? drag.startIdx);
    const b = Math.max(drag.startIdx, drag.hoverIdx ?? drag.startIdx);
    const start = slotStartDate(drag.dayIndex, a);
    const end = new Date(slotStartDate(drag.dayIndex, b).getTime() + 30 * 60 * 1000); // borne suivante
    setBaseStart(start);
    setBaseEnd(end);
    setDrag(null);
  };

  // Options (jours cochés / intervalle) —> affectent la génération des slots
  const [selectedDays, setSelectedDays] = useState([true, true, true, true, true, false, false]); // Lun..Dim
  const [intervalMin, setIntervalMin] = useState(30);

  // Recalcule et notifie le parent à chaque changement pertinent
  useEffect(() => {
    const payloads = buildTimeSlotPayloadsForWeek({
      weekStart, selectedDays, baseStart, baseEnd, intervalMin,
    });
    onSlotsChange?.(payloads);
  }, [weekStart, selectedDays, baseStart, baseEnd, intervalMin, onSlotsChange]);

  const fmtDayShort = (d) =>
    d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "").replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className={`week-calendar${selectable ? " selectable" : ""}`}>
      <div className="week-calendar__header">
        <div className="range">
          {fmtDayShort(days[0])} {days[0].getDate()} — {fmtDayShort(days[6])} {days[6].getDate()}
          {baseStart && baseEnd && (
            <span style={{ marginLeft: 8 }}>
              • Plage : {pad2(baseStart.getHours())}:{pad2(baseStart.getMinutes())} → {pad2(baseEnd.getHours())}:{pad2(baseEnd.getMinutes())}
            </span>
          )}
        </div>
      </div>

      {/* En-têtes jours */}
      <div className="week-calendar__days">
        <div className="day-head empty" />
        {days.map((d, i) => (
          <div key={i} className="day-head">
            <div className="day-name">{fmtDayShort(d)}</div>
            <div className="day-date">{d.getDate()}</div>
          </div>
        ))}
        <div className="day-head empty" />
      </div>

      {/* Grille (labels gauche/droite + 7 colonnes) */}
      <div className="week-calendar__grid">
        <div className="col time-left">
          {slots.map((s, i) => (
            <div key={i} className={`slot ${s.kind === "half" ? "slot--half" : "slot--full"}`}>
              {s.kind === "full" ? <span className="label-left">{String(s.hour).padStart(2, "0")}:00</span> : null}
            </div>
          ))}
        </div>

        {days.map((d, di) => (
          <div
            key={di}
            className="col day-col"
            aria-label={d.toDateString()}
            onMouseUp={() => handleUp(di)}
          >
            {slots.map((s, i) => (
              <div
                key={i}
                role={selectable ? "button" : undefined}
                className={[
                  "slot",
                  s.kind === "half" ? "slot--half" : "slot--full",
                  isSelected(di, i) ? "slot--selected" : "",
                ].join(" ").trim()}
                data-time={`${String(s.hour).padStart(2, "0")}:${s.kind === "half" ? "30" : "00"}`}
                onMouseDown={(e) => handleDown(di, i, e)}
                onMouseEnter={() => handleEnter(di, i)}
              />
            ))}
          </div>
        ))}

        <div className="col time-right">
          {slots.map((s, i) => (
            <div key={i} className={`slot ${s.kind === "half" ? "slot--half" : "slot--full"}`}>
              {s.kind === "half" ? <span className="label-right">{String(s.hour).padStart(2, "0")}:30</span> : null}
            </div>
          ))}
        </div>
      </div>

      {/* Options (jours / intervalle) */}
      <div className="week-calendar__controls" style={{ marginTop: 10 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <strong>Jours :</strong>
            {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((lbl, i) => (
              <label key={lbl} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={!!selectedDays[i]}
                  onChange={() =>
                    setSelectedDays((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                  }
                /> {lbl}
              </label>
            ))}
          </div>

          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            Intervalle
            <select value={intervalMin} onChange={(e) => setIntervalMin(parseInt(e.target.value, 10))}>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>60 min</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}