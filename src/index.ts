export { FaceAuthClient } from "./api/face-auth-client";
export type {
  ApiSuccess,
  AuthUser,
  FaceAuthClientOptions,
} from "./api/face-auth-client";

export { FaceAuthCapture } from "./components/FaceAuthCapture";
export type {
  FaceAuthCaptureProps,
  FaceAuthMode,
} from "./components/FaceAuthCapture";

export { useCamera } from "./hooks/useCamera";
export { captureVideoFrame } from "./lib/capture-frame";
