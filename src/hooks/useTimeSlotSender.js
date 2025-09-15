import { useCallback, useState } from "react";
import { planningStore } from "../lib/planningStore";

/**
 * Hook d’envoi de créneaux via la store (createCreneau), on envoi les créneaux UN PAR UN pour check les erreurs individuelles de chaque créneau.
 *
 * @param {Object} options
 * @param {boolean} options.enableSend - false => DRY-RUN (aucun appel API)
 * @returns {{ send: (slots)=>Promise<{successes:any[],failures:any[]}>, submitting: boolean, result: any, reset: ()=>void }}
 */
export default function useTimeSlotSender({ enableSend = false } = {}) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const send = useCallback(async (slots = []) => {
    if (!slots.length) {
      const empty = { successes: [], failures: [] };
      setResult(empty);
      return empty;
    }

    // DRY-RUN: pas d'appel API
    if (!enableSend) {
      console.log("[DRY-RUN] %d créneau(x) prêt(s) (store non appelée):", slots.length, slots);
      const dry = { successes: [], failures: [] };
      setResult(dry);
      return dry;
    }

    setSubmitting(true);
    try {
      const { createCreneau } = planningStore.getState(); // la store fait axios + headers/token
      const successes = [];
      const failures = [];

      // Envoi séquentiel un par un
      for (const dto of slots) {
        try {
          const data = await createCreneau(dto);
          successes.push({ data, dto });
        } catch (err) {
          const status = err?.response?.status || 0;
          const error = err?.response?.data || { message: err?.message || "Erreur inconnue" };
          failures.push({ status, error, dto });
        }
      }

      const res = { successes, failures };
      setResult(res);
      return res;
    } finally {
      setSubmitting(false);
    }
  }, [enableSend]);

  const reset = useCallback(() => setResult(null), []);

  return { send, submitting, result, reset };
}
