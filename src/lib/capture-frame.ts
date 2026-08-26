/** Capture a JPEG data URL from a video element. */
export function captureVideoFrame(
  video: HTMLVideoElement,
  options?: { quality?: number; maxSide?: number; mirror?: boolean },
): string {
  const quality = options?.quality ?? 0.92;
  const maxSide = options?.maxSide ?? 1280;
  const mirror = options?.mirror ?? true;

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) {
    throw new Error("Video is not ready");
  }

  const scale = Math.min(1, maxSide / Math.max(vw, vh));
  const width = Math.max(1, Math.round(vw * scale));
  const height = Math.max(1, Math.round(vh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas unavailable");
  }

  if (mirror) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}
