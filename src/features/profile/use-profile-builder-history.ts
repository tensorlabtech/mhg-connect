"use client";

import { useCallback, useRef, useState } from "react";

import type { ProfileDocument } from "@/features/profile/profile-document-types";

type HistoryState = {
  future: ProfileDocument[];
  past: ProfileDocument[];
  present: ProfileDocument;
};

export function useProfileBuilderHistory(initialDocument: ProfileDocument) {
  const [history, setHistory] = useState<HistoryState>({
    future: [],
    past: [],
    present: initialDocument,
  });
  const coalesceRef = useRef<{ key: string; time: number } | null>(null);

  const update = useCallback((next: ProfileDocument, coalesceKey?: string) => {
    setHistory((current) => {
      if (current.present === next) return current;
      const now = Date.now();
      const coalescing =
        coalesceKey &&
        coalesceRef.current?.key === coalesceKey &&
        now - coalesceRef.current.time < 900;
      coalesceRef.current = coalesceKey
        ? { key: coalesceKey, time: now }
        : null;
      return {
        future: [],
        past: coalescing
          ? current.past
          : [...current.past.slice(-49), current.present],
        present: next,
      };
    });
  }, []);

  const undo = useCallback(() => {
    coalesceRef.current = null;
    setHistory((current) => {
      const previous = current.past.at(-1);
      if (!previous) return current;
      return {
        future: [current.present, ...current.future],
        past: current.past.slice(0, -1),
        present: previous,
      };
    });
  }, []);

  const redo = useCallback(() => {
    coalesceRef.current = null;
    setHistory((current) => {
      const next = current.future[0];
      if (!next) return current;
      return {
        future: current.future.slice(1),
        past: [...current.past, current.present],
        present: next,
      };
    });
  }, []);

  const replace = useCallback((next: ProfileDocument) => {
    coalesceRef.current = null;
    setHistory({
      future: [],
      past: [],
      present: next,
    });
  }, []);

  return {
    canRedo: history.future.length > 0,
    canUndo: history.past.length > 0,
    document: history.present,
    redo,
    replace,
    undo,
    update,
  };
}
