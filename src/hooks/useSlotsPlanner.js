import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { planningStore } from "../lib/planningStore";

// utils
const isoStart = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const k = (d.getDay() + 6) % 7; // 0=Lun..6=Dim
  d.setDate(d.getDate() - k);
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d; };
const pad2 = (n) => String(n).padStart(2, "0");
const fmt = (date) => `${pad2(date.getHours())}h${pad2(date.getMinutes())}`;
const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const isAdmin = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return false;
    return String(JSON.parse(raw)?.role || "").toUpperCase() === "ADMIN";
  } catch { return false; }
};

const replicate = (base, count) => {
  if (!count || count < 1) return base;
  const out = [];
  for (let w = 0; w < count; w++) {
    const off = 7 * w;
    for (const s of base) {
      const a = new Date(s.startTime);
      const b = new Date(s.endTime);
      a.setDate(a.getDate() + off);
      b.setDate(b.getDate() + off);
      out.push({ startTime: a.toISOString(), endTime: b.toISOString(), isActive: s.isActive ?? true });
    }
  }
  return out;
};

export default function useSlotsPlanner() {
  // rôle
  const [admin, setAdmin] = useState(() => isAdmin());
  useEffect(() => {
    const onStorage = (e) => { if (e.key === "user") setAdmin(isAdmin()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // état
  const [date, setDate] = useState(() => new Date());
  const [list, setList] = useState([]);            // sélections d'une semaine (création)
  const [repeat, setRepeat] = useState(1);
  const [edit, setEdit] = useState(null);          // {id,startTime,endTime}
  const [sendLoading, setSendLoading] = useState(false);
  const [sendResult, setSendResult] = useState(null); // {successes, failures}
  const [resetTick, setResetTick] = useState(0);   // remount signal pour WeekCalendar

  // store (lecture réactive)
  const { creneaux, getCreneaux, deleteCreneau, updateCreneau } = planningStore();

  // refresh centralisé
  const refresh = useCallback(async () => {
    const fn = planningStore.getState().getCreneaux;
    await fn();
  }, []);

  // charge TOUS les créneaux au montage
  useEffect(() => { refresh(); }, [refresh]);

  // key de remount (lundi ISO de la semaine)
  const key = useMemo(() => isoStart(date).toISOString(), [date]);

  // nettoyage des créneaux passés (admin, 1x)
  const cleanedRef = useRef(false);
  useEffect(() => {
    if (!admin || cleanedRef.current) return;
    const now = Date.now();
    const old = (creneaux || []).filter((c) => {
      const end = Date.parse(c?.endTime);
      const active = c?.isActive; const available = (active === undefined) ? true : !!active;
      return available && Number.isFinite(end) && end < now && c?.id;
    });
    if (!old.length) { cleanedRef.current = true; return; }
    (async () => {
      const del = planningStore.getState().deleteCreneau;
      for (const c of old) { try { await del(c.id); } catch {} }
      await refresh();
      cleanedRef.current = true;
    })();
  }, [admin, creneaux, refresh]);

  // existants verts pour la semaine visible
  const existing = useMemo(() => {
    const now = Date.now();
    const start = isoStart(date).getTime();
    const end = addDays(isoStart(date), 7).getTime();
    const list = (creneaux || []).filter((c) => {
      const s = Date.parse(c?.startTime), e = Date.parse(c?.endTime);
      if (!Number.isFinite(s) || !Number.isFinite(e)) return false;
      const active = c?.isActive; const available = (active === undefined) ? true : !!active;
      return available && e >= now && s >= start && s < end;
    });
    return list.map((c) => ({ id: c.id, startTime: c.startTime, endTime: c.endTime }));
  }, [creneaux, date]);

  // reset sur changement de semaine
  useEffect(() => { setList([]); setEdit(null); setSendResult(null); }, [key]);

  // callbacks
  const onChange = useCallback((dtos) => { setList(dtos); }, []);
  const onExistClick = useCallback((slot) => { if (admin) setEdit(slot); }, [admin]);

  // résumé texte
  const startWeek = useMemo(() => {
    if (!list.length) return null;
    const min = new Date(Math.min(...list.map((s) => Date.parse(s.startTime))));
    return isoStart(min);
  }, [list]);

  const baseWeek = useMemo(() => {
    if (!startWeek) return [];
    const next = addDays(startWeek, 7);
    return list.filter((s) => {
      const d = new Date(s.startTime);
      return d >= startWeek && d < next;
    });
  }, [list, startWeek]);

  const summary = useMemo(() => {
    const groups = Array.from({ length: 7 }, () => []);
    for (const s of baseWeek) {
      const d = new Date(s.startTime);
      const idx = (d.getDay() + 6) % 7;
      groups[idx].push(s);
    }
    return groups.map((arr, i) => {
      const ordered = [...arr].sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));
      const ranges = ordered.map((x) => `${fmt(new Date(x.startTime))} → ${fmt(new Date(x.endTime))}`);
      return { day: dayNames[i], ranges };
    });
  }, [baseWeek]);

  // création (batch) — refetch + reset sélection + remount WeekCalendar
  const onSend = useCallback(async (slots) => {
    if (!slots?.length) { setSendResult({ successes: [], failures: [] }); return; }
    setSendLoading(true);
    const successes = []; const failures = [];
    try {
      const create = planningStore.getState().createCreneau;
      for (const dto of slots) {
        try { const data = await create(dto); successes.push({ dto, data }); }
        catch (err) {
          failures.push({
            dto,
            status: err?.response?.status || 0,
            error: err?.response?.data || { message: err?.message || "Erreur inconnue" },
          });
        }
      }
      setSendResult({ successes, failures });
      await refresh();
      // 🔴 RESET: vider la sélection locale et enlever la couleur (remount)
      setList([]);
      setResetTick((x) => x + 1);
    } finally {
      setSendLoading(false);
    }
  }, [refresh]);

  // édition
  const onEditCancel = () => setEdit(null);
  const onEditSave = async ({ startIso, endIso }) => {
    if (!edit?.id) return;
    const update = planningStore.getState().updateCreneau;
    await update(edit.id, { startTime: startIso, endTime: endIso, isActive: true });
    await refresh();
    setEdit(null);
  };
  const onEditDelete = async () => {
    if (!edit?.id) return;
    const del = planningStore.getState().deleteCreneau;
    await del(edit.id);
    await refresh();
    setEdit(null);
  };

  // listes finales (répétitions)
  const sendList = useMemo(() => replicate(baseWeek, repeat), [baseWeek, repeat]);

  return {
    admin,
    date, setDate,
    key,
    resetTick,                 // <- pour forcer le remount du WeekCalendar
    list, onChange,
    repeat, setRepeat,
    existing,
    summary,
    sendList, onSend, sendLoading, sendResult,
    edit, onExistClick, onEditSave, onEditDelete, onEditCancel,
  };
}