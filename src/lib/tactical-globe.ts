/**
 * Canvas 2D orthographic globe — outlines + sparse red nodes.
 * Deps: d3-geo, topojson-client
 * Land: https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json
 */
import { geoGraticule, geoOrthographic, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";

export type LngLat = { lng: number; lat: number } | [number, number];

export type TacticalGlobeOptions = {
  canvas: HTMLCanvasElement;
  land?: FeatureCollection<Geometry>;
  dots?: LngLat[];
  density?: number;
  autoRotate?: boolean;
};

const LAND_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json";
const STEP_DEG = 0.2;
const DRAG_GAIN = 0.35;
const MOMENTUM = 0.92;
const RESUME_MS = 2000;
const PHI_MAX = 60;
const NODE_R = 1.5;

/** Seeded sparse sample. Replace with live coords when the host has them. */
export const SAMPLE_DOTS: { lng: number; lat: number }[] = [
  { lng: -74.01, lat: 40.71 },
  { lng: -0.13, lat: 51.51 },
  { lng: 2.35, lat: 48.86 },
  { lng: 13.41, lat: 52.52 },
  { lng: 37.62, lat: 55.76 },
  { lng: 35.22, lat: 31.77 },
  { lng: 51.39, lat: 35.69 },
  { lng: 55.27, lat: 25.2 },
  { lng: 67.0, lat: 24.86 },
  { lng: 77.21, lat: 28.61 },
  { lng: 88.36, lat: 22.57 },
  { lng: 100.5, lat: 13.76 },
  { lng: 103.82, lat: 1.35 },
  { lng: 106.85, lat: -6.21 },
  { lng: 114.17, lat: 22.32 },
  { lng: 121.47, lat: 31.23 },
  { lng: 126.98, lat: 37.57 },
  { lng: 139.69, lat: 35.69 },
  { lng: 151.21, lat: -33.87 },
  { lng: 174.76, lat: -36.85 },
  { lng: -43.17, lat: -22.91 },
  { lng: -46.63, lat: -23.55 },
  { lng: -58.38, lat: -34.6 },
  { lng: -70.67, lat: -33.45 },
  { lng: -77.04, lat: -12.05 },
  { lng: -99.13, lat: 19.43 },
  { lng: -118.24, lat: 34.05 },
  { lng: -122.42, lat: 37.77 },
  { lng: -123.12, lat: 49.28 },
  { lng: -87.63, lat: 41.88 },
  { lng: 3.06, lat: 36.75 },
  { lng: 31.24, lat: 30.04 },
  { lng: 32.58, lat: 0.35 },
  { lng: 18.42, lat: -33.92 },
  { lng: 28.05, lat: -26.2 },
  { lng: 36.82, lat: -1.29 },
  { lng: -17.47, lat: 14.72 },
  { lng: 12.5, lat: 41.9 },
  { lng: 23.73, lat: 37.98 },
  { lng: 28.98, lat: 41.01 },
  { lng: 4.9, lat: 52.37 },
  { lng: 12.57, lat: 55.68 },
  { lng: 18.07, lat: 59.33 },
  { lng: 24.94, lat: 60.17 },
  { lng: -9.14, lat: 38.72 },
  { lng: -3.7, lat: 40.42 },
  { lng: 8.54, lat: 47.38 },
  { lng: 21.01, lat: 52.23 },
  { lng: 14.44, lat: 50.08 },
  { lng: 19.04, lat: 47.5 },
];

function pair(d: LngLat): [number, number] {
  return Array.isArray(d) ? d : [d.lng, d.lat];
}

export async function loadLand(): Promise<FeatureCollection<Geometry>> {
  const topo = (await fetch(LAND_URL).then((r) => r.json())) as Topology;
  return feature(topo, topo.objects.land) as unknown as FeatureCollection<Geometry>;
}

export function mountTacticalGlobe(opts: TacticalGlobeOptions) {
  const canvas = opts.canvas;
  const ctx2 = canvas.getContext("2d");
  if (!ctx2) return { destroy() {}, setDots(_next: LngLat[]) {} };
  const ctx = ctx2;

  let dots = opts.dots ?? SAMPLE_DOTS;
  const density = opts.density ?? 1;
  const reduced =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  let auto = opts.autoRotate !== false && !reduced;

  let land = opts.land ?? null;
  let lambda = 20;
  let phi = -12;
  let vLambda = 0;
  let vPhi = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let resumeAt = 0;
  let raf = 0;
  let width = 0;
  let height = 0;
  let projection: GeoProjection = geoOrthographic();
  const graticule = geoGraticule().step([20, 20]);
  const path = geoPath(projection, ctx);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const radius = Math.min(width, height) / 2 - 18;
    projection = geoOrthographic()
      .scale(radius)
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .rotate([lambda, phi, 0]);
    path.projection(projection);
  }

  function render() {
    projection.rotate([lambda, phi, 0]);
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    path({ type: "Sphere" });
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    path(graticule());
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (land) {
      ctx.beginPath();
      path(land);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.fillStyle = "#FF0000";
    ctx.shadowColor = "rgba(255,0,0,0.4)";
    ctx.shadowBlur = 10;
    dots.forEach((dot, i) => {
      if (i % density !== 0) return;
      const p = projection(pair(dot));
      if (!p) return;
      ctx.beginPath();
      ctx.arc(p[0], p[1], NODE_R, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }

  function tick() {
    if (document.hidden) {
      raf = 0;
      return;
    }
    const now = performance.now();
    if (!dragging) {
      if (Math.abs(vLambda) > 0.02 || Math.abs(vPhi) > 0.02) {
        lambda += vLambda;
        phi = Math.max(-PHI_MAX, Math.min(PHI_MAX, phi + vPhi));
        vLambda *= MOMENTUM;
        vPhi *= MOMENTUM;
      } else if (auto && now >= resumeAt) {
        lambda += STEP_DEG;
      }
    }
    render();
    raf = requestAnimationFrame(tick);
  }

  function onDown(e: PointerEvent) {
    dragging = true;
    auto = false;
    vLambda = 0;
    vPhi = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  }

  function onMove(e: PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    vLambda = -dx * DRAG_GAIN;
    vPhi = dy * DRAG_GAIN;
    lambda += vLambda;
    phi = Math.max(-PHI_MAX, Math.min(PHI_MAX, phi + vPhi));
  }

  function onUp(e: PointerEvent) {
    dragging = false;
    resumeAt = performance.now() + RESUME_MS;
    auto = opts.autoRotate !== false && !reduced;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement ?? canvas);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  const onVis = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      raf = requestAnimationFrame(tick);
    }
  };
  document.addEventListener("visibilitychange", onVis);

  const io = new IntersectionObserver((entries) => {
    const on = entries.some((e) => e.isIntersecting);
    if (!on) {
      cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    if (!raf) raf = requestAnimationFrame(tick);
  });
  io.observe(canvas.parentElement ?? canvas);

  resize();
  raf = requestAnimationFrame(tick);

  if (!land) {
    loadLand()
      .then((fc) => {
        land = fc;
        render();
      })
      .catch(() => {
        /* keep graticule + nodes if land fails */
      });
  }

  return {
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      document.removeEventListener("visibilitychange", onVis);
    },
    setDots(next: LngLat[]) {
      dots = next;
    },
  };
}
