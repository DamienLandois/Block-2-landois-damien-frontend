import { useMemo, useState, useEffect, useRef } from "react";

// utils
const isoStart = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const k = (d.getDay() + 6) % 7; // 0=lundi..6=dimanche
  d.setDate(d.getDate() - k);
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d; };
const mergeRanges = (ranges) => {
  if (!ranges?.length) return [];
  const sorted = ranges
    .map((r) => ({ start: new Date(r.start), end: new Date(r.end), id: r.id }))
    .sort((a, b) => a.start - b.start);
  const out = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = out[out.length - 1];
    const cur = sorted[i];
    if (cur.start <= last.end) {
      if (cur.end > last.end) last.end = cur.end;
    } else {
      out.push(cur);
    }
  }
  return out;
};
const addAndMerge = (ranges, range) => mergeRanges([...(ranges || []), range]);

export default function WeekCalendar({
  anchorDate,
  startHour = 6,
  endHour = 21,
  selectable = true,
  onWeekSlotsChange,
  existingSlots = [],        // verts
  onExistingSlotClick,
}) {
  if (!anchorDate) {
    return (
      <div className="week-calendar">
        <div className="week-calendar__empty">Sélectionnez un jour dans le calendrier.</div>
      </div>
    );
  }

  const weekStart = useMemo(() => isoStart(anchorDate), [anchorDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const grid = useMemo(() => {
    const list = [];
    for (let h = startHour; h <= endHour; h++) {
      list.push({ kind: "full", hour: h });      // HH:00
      if (h < endHour) list.push({ kind: "half", hour: h }); // HH:30
    }
    return list;
  }, [startHour, endHour]);

  // Sélections locales (admin)
  const [dayRanges, setDayRanges] = useState(() => Array.from({ length: 7 }, () => []));
  useEffect(() => { setDayRanges(Array.from({ length: 7 }, () => [])); }, [weekStart]); // reset à chaque nouvelle semaine

  // Drag
  const [drag, setDrag] = useState(null); // { day, start, hover }

  const slotDate = (day, idx) => {
    const base = weekDays[day];
    const s = grid[idx];
    const H = s.hour;
    const M = s.kind === "half" ? 30 : 0;
    const d = new Date(base);
    d.setHours(H, M, 0, 0);
    return d;
  };

  const dragHit = (day, idx) => {
    if (!drag || day !== drag.day) return false;
    const a = Math.min(drag.start, drag.hover ?? drag.start);
    const b = Math.max(drag.start, drag.hover ?? drag.start);
    return idx >= a && idx <= b;
  };

  const savedHit = (day, idx) => {
    const t = slotDate(day, idx).getTime();
    const ranges = dayRanges[day] || [];
    return ranges.some(({ start, end }) => t >= start.getTime() && t < end.getTime());
  };

  // existants (verts)
  const existByDay = useMemo(() => {
    if (!existingSlots?.length) return Array.from({ length: 7 }, () => []);
    const start = weekStart.getTime();
    const end = addDays(weekStart, 7).getTime();
    const perDay = Array.from({ length: 7 }, () => []);
    for (const h of existingSlots) {
      const s = Date.parse(h.startTime);
      const e = Date.parse(h.endTime);
      if (!Number.isFinite(s) || !Number.isFinite(e)) continue;
      if (s < start || s >= end) continue;
      const day = (new Date(s).getDay() + 6) % 7;
      perDay[day].push({ id: h.id, start: new Date(s), end: new Date(e) });
    }
    return perDay.map((r) => r.sort((a, b) => a.start - b.start));
  }, [existingSlots, weekStart]);

  const existHit = (day, idx) => {
    const t = slotDate(day, idx).getTime();
    const ranges = existByDay[day] || [];
    return ranges.some(({ start, end }) => t >= start.getTime() && t < end.getTime());
  };
  const existGet = (day, idx) => {
    const t = slotDate(day, idx).getTime();
    const ranges = existByDay[day] || [];
    return ranges.find(({ start, end }) => t >= start.getTime() && t < end.getTime()) || null;
  };

  // interactions
  const onDown = (day, idx, e) => {
    const hit = existGet(day, idx);
    if (hit && onExistingSlotClick) {
      onExistingSlotClick({
        id: hit.id,
        startTime: hit.start.toISOString(),
        endTime: hit.end.toISOString(),
      });
      return;
    }
    if (!selectable) return;
    e.preventDefault();
    setDrag({ day, start: idx, hover: idx });
  };
  const onEnter = (day, idx) => {
    if (!selectable || !drag || day !== drag.day) return;
    setDrag((d) => ({ ...d, hover: idx }));
  };
  const onUp = (day) => {
    if (!selectable || !drag || day !== drag.day) { setDrag(null); return; }
    const a = Math.min(drag.start, drag.hover ?? drag.start);
    const b = Math.max(drag.start, drag.hover ?? drag.start);
    const start = slotDate(day, a);
    const end = new Date(slotDate(day, b).getTime() + 30 * 60 * 1000);
    setDayRanges((prev) => {
      const next = prev.slice();
      next[day] = addAndMerge(prev[day], { start, end });
      return next;
    });
    setDrag(null);
  };

  // notify parent (création)
  const cbRef = useRef(onWeekSlotsChange);
  useEffect(() => { cbRef.current = onWeekSlotsChange; }, [onWeekSlotsChange]);
  useEffect(() => {
    if (!cbRef.current) return;
    const dtos = [];
    for (let i = 0; i < 7; i++) {
      const ranges = (dayRanges[i] || []).slice().sort((a, b) => a.start - b.start);
      for (const r of ranges) dtos.push({ startTime: r.start.toISOString(), endTime: r.end.toISOString(), isActive: true });
    }
    cbRef.current(dtos);
  }, [dayRanges]);

    // Couleurs : rouge pour la sélection locale, vert pour existants
    const colorDrag = "rgba(59, 130, 246, 0.35)"; // bleu sélection
    const colorSave = "rgba(59, 130, 246, 0.18)"; // bleu doux
    const colorAvail = "rgba(34, 197, 94, 0.20)"; // vert disponibilité
    const fmt = (d) =>
        d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "").replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className={`week-calendar${selectable ? " selectable" : ""}`}>
      <div className="week-calendar__header">
        <div className="range">
          {fmt(weekDays[0])} {weekDays[0].getDate()} — {fmt(weekDays[6])} {weekDays[6].getDate()}
        </div>
      </div>

      <div className="week-calendar__days">
        <div className="day-head empty" />
        {weekDays.map((d, i) => (
          <div key={i} className="day-head">
            <div className="day-name">{fmt(d)}</div>
            <div className="day-date">{d.getDate()}</div>
          </div>
        ))}
        <div className="day-head empty" />
      </div>

      <div className="week-calendar__grid">
        {/* gauche */}
        <div className="col time-left">
          {grid.map((s, i) => (
            <div key={i} className={`slot ${s.kind === "half" ? "slot--half" : "slot--full"}`}>
              {s.kind === "full" ? <span className="label-left">{String(s.hour).padStart(2, "0")}:00</span> : null}
            </div>
          ))}
        </div>

        {/* 7 jours */}
        {weekDays.map((d, di) => (
          <div key={di} className="col day-col" aria-label={d.toDateString()} onMouseUp={() => onUp(di)}>
            {grid.map((s, i) => {
              const dragging = dragHit(di, i);
              const saved = savedHit(di, i);
              const avail = existHit(di, i);
              const cls = [
                "slot",
                s.kind === "half" ? "slot--half" : "slot--full",
                dragging ? "slot--dragging" : "",
                saved ? "slot--saved" : "",
                avail ? "slot--available" : "",
              ].join(" ").trim();
              const bg = dragging ? colorDrag : saved ? colorSave : avail ? colorAvail : undefined;

              return (
                <div
                  key={i}
                  role={selectable ? "button" : undefined}
                  className={cls}
                  data-time={`${String(s.hour).padStart(2, "0")}:${s.kind === "half" ? "30" : "00"}`}
                  onMouseDown={(e) => onDown(di, i, e)}
                  onMouseEnter={() => onEnter(di, i)}
                  style={{ backgroundColor: bg, transition: dragging ? "none" : "background-color 80ms linear" }}
                  title={avail ? "Cliquer pour éditer ce créneau" : undefined}
                />
              );
            })}
          </div>
        ))}

        {/* droite */}
        <div className="col time-right">
          {grid.map((s, i) => (
            <div key={i} className={`slot ${s.kind === "half" ? "slot--half" : "slot--full"}`}>
              {s.kind === "half" ? <span className="label-right">{String(s.hour).padStart(2, "0")}:30</span> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}