import { useEffect, useState } from "react";

const COLS = [
  ["/atelier/ring.jpg", "/atelier/necklace.jpg", "/atelier/watch.jpg"],
  ["/atelier/earring.jpg", "/atelier/bracelet.jpg", "/atelier/object.jpg"],
  ["/atelier/object.jpg", "/atelier/ring.jpg", "/atelier/necklace.jpg"],
];
const SPEED = [0.12, 0.28, 0.18];

export function ParallaxStills() {
  const [y, setY] = useState(0);

  useEffect(() => {
    const scroller = document.getElementById("desk");
    if (!scroller) return;
    const onScroll = () => setY(scroller.scrollTop);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="za-para" aria-hidden>
      {COLS.map((col, i) => (
        <div key={i} className="za-para-col" style={{ transform: `translate3d(0, ${-y * SPEED[i]}px, 0)` }}>
          {col.map((src) => (
            <img key={src + i} src={src} alt="" />
          ))}
        </div>
      ))}
    </div>
  );
}
