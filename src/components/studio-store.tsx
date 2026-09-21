import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SEED_COLLECTIONS, SEED_CONCEPTS, SEED_DNA } from "@/data/studio/seed";
import type { BrandDna, Collection, Concept } from "@/data/studio/types";
import { studioClientError } from "@/lib/studio-error";
import {
  listStudioFn,
  saveStudioCollectionsFn,
  saveStudioConceptFn,
  saveStudioDnaFn,
} from "@/lib/studio-fn";
import type { JobSnapshot } from "@/lib/studio-jobs";

export type StudioSnapshot = {
  concepts: Concept[];
  dna: BrandDna;
  collections: Collection[];
  jobs: JobSnapshot[];
};

type StudioState = StudioSnapshot & {
  ready: boolean;
  setConcepts: (next: Concept[]) => void;
  persist: (concept: Concept) => Promise<void>;
  setDna: (next: BrandDna) => void;
  setCollections: (next: Collection[]) => void;
  error: string | null;
};

const EMPTY: StudioSnapshot = {
  concepts: SEED_CONCEPTS,
  dna: SEED_DNA,
  collections: SEED_COLLECTIONS,
  jobs: [],
};

const StudioContext = createContext<StudioState | null>(null);

export function StudioProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: StudioSnapshot | null;
}) {
  const start = initial && initial.concepts.length ? initial : EMPTY;
  const [ready, setReady] = useState(Boolean(initial?.concepts.length));
  const [concepts, setConceptsState] = useState<Concept[]>(start.concepts);
  const [dna, setDnaState] = useState<BrandDna>(start.dna);
  const [collections, setCollectionsState] = useState<Collection[]>(start.collections);
  const [jobs, setJobs] = useState<JobSnapshot[]>(start.jobs);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial?.concepts.length) {
      setReady(true);
      return;
    }
    let live = true;
    listStudioFn()
      .then((r) => {
        if (!live) return;
        if (r.concepts.length) {
          setConceptsState(r.concepts);
          setDnaState(r.dna);
          setCollectionsState(r.collections);
          setJobs(r.jobs ?? []);
        }
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
  }, [initial]);

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
