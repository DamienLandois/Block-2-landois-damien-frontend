import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { planningStore } from "../lib/planningStore";

// --------- utils ----------
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isAdmin = () => {
  try { const raw = localStorage.getItem("user"); if (!raw) return false;
    return String(JSON.parse(raw)?.role || "").toUpperCase() === "ADMIN";
  } catch { return false; }
};
// undefined ou null => actif
const isAvailable = (active) => (active === undefined || active === null) ? true : !!active;

// Filtre une liste complète en ne gardant que les créneaux de la semaine de `anchor`
const filterWeek = (all, anchor) => {
  const now = Date.now();
  const ws = isoStart(anchor).getTime();
  const we = addDays(isoStart(anchor), 7).getTime();
  return (all || [])
    .filter((c) => {
      const s = Date.parse(c?.startTime);
      const e = Date.parse(c?.endTime);
      if (!Number.isFinite(s) || !Number.isFinite(e)) return false;
      return isAvailable(c?.isActive) && e >= now && s >= ws && s < we;
    })
    .map((c) => ({ id: c.id, startTime: c.startTime, endTime: c.endTime }));
};
// --------------------------

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
  const [list, setList] = useState([]);            // sélections d'une semaine (à créer)
  const [repeat, setRepeat] = useState(1);
  const [edit, setEdit] = useState(null);          // {id,startTime,endTime}
  const [sendLoading, setSendLoading] = useState(false);
  const [sendResult, setSendResult] = useState(null); // {successes, failures}
  const [resetTick, setResetTick] = useState(0);   // remount signal pour WeekCalendar

  // créneaux existants de la semaine en mémoire locale uniquement
  const [existing, setExisting] = useState([]);    // [{id,startTime,endTime}]

  // key (lundi ISO de la semaine)
  const key = useMemo(() => isoStart(date).toISOString(), [date]);

  // refresh: fetch tous les créneaux depuis l'API (via store) puis ne garder que la semaine affichée
  const cleanedRef = useRef(false); // nettoyage des passés: une seule fois (admin)
  const refreshWeek = useCallback(async (anchor) => {
    const api = planningStore.getState();

    // 1) fetch complet
    await api.getCreneaux();
    let all = planningStore.getState().creneaux || [];

    // 2) (optionnel) nettoyage des créneaux passés une seule fois si admin
    if (admin && !cleanedRef.current) {
      const now = Date.now();
      const outdated = all.filter((c) => {
        const e = Date.parse(c?.endTime);
        return isAvailable(c?.isActive) && Number.isFinite(e) && e < now && c?.id;
      });
      if (outdated.length) {
        for (const c of outdated) { try { await api.deleteCreneau(c.id); } catch {} }
        await api.getCreneaux(); // refetch après delete
        all = planningStore.getState().creneaux || [];
      }
      cleanedRef.current = true;
    }

    // 3) ne garder que la semaine affichée (en mémoire locale)
    setExisting(filterWeek(all, anchor));
  }, [admin]);

  // chargement initial et à chaque changement de semaine (clic Calendar)
  useEffect(() => { refreshWeek(date); }, [refreshWeek, key, date]);

  // reset sélection quand on change de semaine
  useEffect(() => { setList([]); setEdit(null); setSendResult(null); }, [key]);

  // callbacks pour WeekCalendar
  const onChange = useCallback((dtos) => { setList(dtos); }, []);
  const onExistClick = useCallback((slot) => { if (admin) setEdit(slot); }, [admin]);

  // résumé texte (pour le tableau)
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

  // réplication N semaines
  const replicate = useCallback((base, count) => {
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
  }, []);
  const sendList = useMemo(() => replicate(baseWeek, repeat), [baseWeek, repeat, replicate]);

  // création (batch) — ≤ 3 req/s + retry/backoff 429 — puis refetch limité à la semaine
  const onSend = useCallback(async (slots) => {
    if (!slots?.length) { setSendResult({ successes: [], failures: [] }); return; }
    setSendLoading(true);
    const successes = []; const failures = [];

    // pacing 3 req/s
    const maxQps = 3;
    const minDelay = Math.ceil(1000 / maxQps) + 20; // ~353ms
    let lastSentAt = 0;

    // backoff 429
    const maxRetries = 5;
    const maxBackoff = 5000;
    const baseBackoff = 1000;

    try {
      const create = planningStore.getState().createCreneau;

      for (let i = 0; i < slots.length; i++) {
        const dto = slots[i];

        // pacing
        const now = Date.now();
        const elapsed = now - lastSentAt;
        if (elapsed < minDelay) await sleep(minDelay - elapsed);

        let attempt = 0;
        while (true) {
          try {
            const data = await create(dto);
            successes.push({ dto, data });
            lastSentAt = Date.now();
            break;
          } catch (err) {
            const status = err?.response?.status || 0;

            if (status === 429 && attempt < maxRetries) {
              const ra = err?.response?.headers?.["retry-after"] || err?.response?.headers?.["Retry-After"];
              let waitMs = 0;
              if (ra) {
                const sec = Number(ra);
                if (Number.isFinite(sec) && sec > 0) waitMs = sec * 1000;
              }
              if (!waitMs) waitMs = Math.min(maxBackoff, baseBackoff * Math.pow(2, attempt));
              await sleep(waitMs);
              attempt += 1;
              continue;
            }

            failures.push({
              dto,
              status,
              error: err?.response?.data || { message: err?.message || "Erreur inconnue" },
            });
            lastSentAt = Date.now();
            break;
          }
        }
      }

      setSendResult({ successes, failures });

      // petite marge puis refetch ciblé semaine
      await sleep(100);
      await refreshWeek(date);

      // reset sélection locale + remount pour enlever le bleu
      setList([]);
      setResetTick((x) => x + 1);
    } finally {
      setSendLoading(false);
    }
  }, [date, refreshWeek]);

  // édition (admin) — puis refetch ciblé semaine
  const onEditCancel = () => setEdit(null);
  const onEditSave = async ({ startIso, endIso }) => {
    if (!edit?.id) return;
    const update = planningStore.getState().updateCreneau;
    await update(edit.id, { startTime: startIso, endTime: endIso, isActive: true });
    await refreshWeek(date);
    setEdit(null);
  };
  const onEditDelete = async () => {
    if (!edit?.id) return;
    const del = planningStore.getState().deleteCreneau;
    await del(edit.id);
    await refreshWeek(date);
    setEdit(null);
  };

  return {
    admin,
    date, setDate,
    key,
    resetTick,
    list, onChange,
    repeat, setRepeat,
    existing,            // <- déjà filtré à la semaine en mémoire locale
    summary,
    sendList, onSend, sendLoading, sendResult,
    edit, onExistClick, onEditSave, onEditDelete, onEditCancel,
  };
}
