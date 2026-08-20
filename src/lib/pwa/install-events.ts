/**
 * Capture `beforeinstallprompt` as soon as this module loads.
 * Chrome often fires the event before React effects attach; missing it means
 * the Install button never appears even though the sheet can still open.
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type Listener = () => void;

let captured: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<Listener>();
let hooked = false;

function emit() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  });
}

function hookWindow() {
  if (hooked || typeof window === "undefined") return;
  hooked = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    captured = e as BeforeInstallPromptEvent;
    emit();
  });

  window.addEventListener("appinstalled", () => {
    installed = true;
    captured = null;
    emit();
  });
}

hookWindow();

export function subscribePwaInstallEvents(listener: Listener): () => void {
  hookWindow();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCapturedInstallPrompt(): BeforeInstallPromptEvent | null {
  return captured;
}

export function takeCapturedInstallPrompt(): BeforeInstallPromptEvent | null {
  const event = captured;
  captured = null;
  emit();
  return event;
}

export function wasAppInstalledEvent(): boolean {
  return installed;
}
