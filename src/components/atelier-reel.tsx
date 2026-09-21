import { useState } from "react";

const SRC = "/atelier/showreel.mp4";

export function AtelierReel() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="za-reel" onClick={() => setOpen(true)} aria-label="پخش فیلم آتلیه">
        <video src={SRC} muted loop playsInline autoPlay preload="metadata" />
        <span>پخش</span>
      </button>
      {open ? (
        <div className="za-reel-pop" role="dialog" aria-label="فیلم آتلیه">
          <button type="button" className="za-reel-dismiss" onClick={() => setOpen(false)} aria-label="بستن" />
          <div className="za-reel-frame">
            <button type="button" className="za-reel-x" onClick={() => setOpen(false)} aria-label="بستن">
              ×
            </button>
            <video src={SRC} controls autoPlay playsInline />
          </div>
        </div>
      ) : null}
    </>
  );
}
