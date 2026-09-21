import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SEED_DNA } from "@/data/studio/seed";
import type { BrandDna, Collection, Concept } from "@/data/studio/types";
import { studioClientError } from "@/lib/studio-error";
import {
  listStudioFn,
  saveStudioCollectionsFn,
  saveStudioConceptFn,
  saveStudioDnaFn,
} from "@/lib/studio-fn";
import type { JobSnapshot } from "@/lib/studio-jobs";

type StudioState = {
  ready: boolean;
  concepts: Concept[];
  setConcepts: (next: Concept[]) => void;
  persist: (concept: Concept) => Promise<void>;
  dna: BrandDna;
  setDna: (next: BrandDna) => void;
  collections: Collection[];
  setCollections: (next: Collection[]) => void;
  jobs: JobSnapshot[];
  error: string | null;
};

const StudioContext = createContext<StudioState | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [concepts, setConceptsState] = useState<Concept[]>([]);
  const [dna, setDnaState] = useState<BrandDna>(SEED_DNA);
  const [collections, setCollectionsState] = useState<Collection[]>([]);
  const [jobs, setJobs] = useState<JobSnapshot[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    listStudioFn()
      .then((r) => {
        if (!live) return;
        setConceptsState(r.concepts);
        setDnaState(r.dna);
        setCollectionsState(r.collections);
        setJobs(r.jobs ?? []);
      })
      .catch((e: unknown) => {
        if (!live) return;
        setError(studioClientError(e, "خواندن آرشیو شکست خورد."));
      })
      .finally(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, []);

  const persist = useCallback(async (concept: Concept) => {
    setConceptsState((prev) => {
      const i = prev.findIndex((c) => c.id === concept.id);
      if (i < 0) return [concept, ...prev];
      const next = [...prev];
      next[i] = concept;
      return next;
    });
    try {
      await saveStudioConceptFn({ data: { concept } });
    } catch (e: unknown) {
      setError(studioClientError(e, "ذخیرهٔ کانسپت شکست خورد."));
    }
  }, []);

  const setConcepts = useCallback((next: Concept[]) => {
    setConceptsState(next);
  }, []);

  const setDna = useCallback((next: BrandDna) => {
    setDnaState(next);
    void saveStudioDnaFn({ data: { dna: next } }).catch((e: unknown) => {
      setError(studioClientError(e, "ذخیرهٔ دی‌ان‌ای شکست خورد."));
    });
  }, []);

  const setCollections = useCallback((next: Collection[]) => {
    setCollectionsState(next);
    void saveStudioCollectionsFn({ data: { collections: next } }).catch((e: unknown) => {
      setError(studioClientError(e, "ذخیرهٔ کالکشن شکست خورد."));
    });
  }, []);

  const value = useMemo(
    () => ({
      ready,
      concepts,
      setConcepts,
      persist,
      dna,
      setDna,
      collections,
      setCollections,
      jobs,
      error,
    }),
    [ready, concepts, setConcepts, persist, dna, setDna, collections, setCollections, jobs, error],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio(): StudioState {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be inside StudioProvider");
  return ctx;
}
