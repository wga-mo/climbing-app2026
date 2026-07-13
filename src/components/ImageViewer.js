"use client";

import { useEffect } from "react";
import {
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

export default function ImageViewer({
  src,
  alt = "",
  open,
  onClose,
}) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !src) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black"
      onContextMenu={(event) => event.preventDefault()}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 rounded bg-white px-3 py-2 text-sm shadow"
      >
        Close
      </button>

      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={5}
        centerOnInit
        centerZoomedOut
        limitToBounds
        disablePadding
        smooth
        wheel={{
          step: 0.004,
        }}
        doubleClick={{
          mode: "zoomIn",
          step: 0.4,
        }}
        pinch={{
          step: 3,
        }}
        panning={{
          velocityDisabled: true,
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute bottom-4 right-4 z-20 flex flex-col overflow-hidden rounded bg-white shadow">
              <button
                type="button"
                onClick={() => zoomIn(0.25)}
                className="border-b px-4 py-2 text-lg hover:bg-gray-100"
                aria-label="Zoom in"
              >
                +
              </button>

              <button
                type="button"
                onClick={() => zoomOut(0.25)}
                className="border-b px-4 py-2 text-lg hover:bg-gray-100"
                aria-label="Zoom out"
              >
                −
              </button>

              <button
                type="button"
                onClick={() => resetTransform()}
                className="px-3 py-2 text-xs hover:bg-gray-100"
              >
                Reset
              </button>
            </div>

            <TransformComponent
              wrapperClass="!h-screen !w-screen"
              contentClass="!h-screen !w-screen"
            >
              <div className="flex h-screen w-screen items-center justify-center p-4">
                <img
                  src={src}
                  alt={alt}
                  className="block max-h-full max-w-full select-none object-contain"
                  draggable={false}
                  onDragStart={(event) => event.preventDefault()}
                  onContextMenu={(event) => event.preventDefault()}
                />
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}