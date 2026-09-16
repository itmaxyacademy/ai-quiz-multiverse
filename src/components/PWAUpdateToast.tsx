import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sparkles, RefreshCw, X } from "lucide-react";
import { APP_VERSION, fetchRemoteVersion, isDeviceOnline } from "../version";

interface PWAUpdateToastProps {
  onDismiss?: () => void;
}

export function PWAUpdateToast({ onDismiss }: PWAUpdateToastProps) {
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [newVersion, setNewVersion] = useState<string>("");
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const autoUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerUpdate = useCallback((worker?: ServiceWorker | null, targetVersion?: string) => {
    setIsUpdating(true);
    const versionKey = targetVersion || "latest";

    // Guard against repeated reloads in the same session
    try {
      sessionStorage.setItem(`pwa_auto_updated_${versionKey}`, "true");
    } catch {
      // ignore storage errors
    }

    const targetWorker = worker || waitingWorker;
    if (targetWorker) {
      console.log("[PWA Update] Posting SKIP_WAITING to waiting worker in AI Quiz Multiverse...");
      targetWorker.postMessage({ type: "SKIP_WAITING" });
    } else if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          console.log("[PWA Update] Found waiting worker in registration, posting SKIP_WAITING...");
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        } else {
          console.log("[PWA Update] No waiting worker found, reloading directly...");
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }

    // Safety fallback reload
    setTimeout(() => {
      window.location.reload();
    }, 2500);
  }, [waitingWorker]);

  const scheduleAutoUpdate = useCallback((detectedVersion: string, worker?: ServiceWorker | null) => {
    try {
      const alreadyAttempted = sessionStorage.getItem(`pwa_auto_updated_${detectedVersion}`);
      if (alreadyAttempted) {
        console.log(`[PWA Update] Already auto-updated to ${detectedVersion} in this session. Skipping.`);
        return;
      }
    } catch {
      // ignore storage errors
    }

    setNewVersion(detectedVersion);
    setShowToast(true);
    setIsUpdating(true);

    if (autoUpdateTimerRef.current) {
      clearTimeout(autoUpdateTimerRef.current);
    }

    // Auto-update after 1200ms delay so user sees notification
    autoUpdateTimerRef.current = setTimeout(() => {
      triggerUpdate(worker, detectedVersion);
    }, 1200);
  }, [triggerUpdate]);

  const checkForWaitingWorker = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          console.log('[PWA Update] Detected waiting worker, triggering auto-update...');
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          setWaitingWorker(reg.waiting);
          scheduleAutoUpdate('latest', reg.waiting);
        }
      });
    }
  }, [scheduleAutoUpdate]);

  const checkVersionFromServer = useCallback(async () => {
    if (!isDeviceOnline()) {
      return;
    }

    // 1. Trigger Service Worker update check
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.update().catch((err) => {
          console.debug("[PWA Update] Service worker update check failed:", err);
        });
      });
    }

    // 2. Fetch remote version.json
    const remote = await fetchRemoteVersion();
    if (remote && remote.version && remote.version !== APP_VERSION) {
      console.log(`[PWA Update] New version detected online: remote ${remote.version} vs local ${APP_VERSION}`);
      scheduleAutoUpdate(remote.version, null);
    }
  }, [scheduleAutoUpdate]);

  useEffect(() => {
    // 1. Listen for SW waiting / updatefound event
    const handleUpdateAvailable = (e: Event) => {
      const customEvent = e as CustomEvent<{ registration: ServiceWorkerRegistration }>;
      const reg = customEvent.detail?.registration;
      if (reg?.waiting) {
        setWaitingWorker(reg.waiting);
        scheduleAutoUpdate(newVersion || "baru", reg.waiting);
      }
      checkVersionFromServer();
    };

    window.addEventListener("pwa-update-available", handleUpdateAvailable);
    checkForWaitingWorker();

    // 2. Initial check when online
    if (isDeviceOnline()) {
      checkVersionFromServer();
    }

    // 3. Online event listener
    const handleOnline = () => {
      console.log("[PWA Update] Device is back online, checking for updates...");
      checkVersionFromServer();
    };
    window.addEventListener("online", handleOnline);

    // 4. Tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isDeviceOnline()) {
        checkVersionFromServer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 5. Periodic check every 10 minutes when online
    const intervalId = setInterval(() => {
      if (isDeviceOnline()) {
        checkVersionFromServer();
      }
    }, 10 * 60 * 1000);

    return () => {
      window.removeEventListener("pwa-update-available", handleUpdateAvailable);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
      if (autoUpdateTimerRef.current) {
        clearTimeout(autoUpdateTimerRef.current);
      }
    };
  }, [checkVersionFromServer, newVersion, scheduleAutoUpdate]);

  if (!showToast) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-label="Notifikasi Pembaruan Otomatis AI Quiz Multiverse"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-500/30 p-4 animate-in slide-in-from-bottom-5 duration-300 text-slate-100 ring-1 ring-white/10"
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-500/20 shrink-0">
          <Sparkles size={20} className="animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Pembaruan Otomatis</span>
              {newVersion && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  v{newVersion}
                </span>
              )}
            </h4>
            <button
              onClick={() => {
                if (autoUpdateTimerRef.current) {
                  clearTimeout(autoUpdateTimerRef.current);
                }
                setShowToast(false);
                onDismiss?.();
              }}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup Notifikasi"
            >
              <X size={15} />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Versi baru AI Quiz Multiverse terdeteksi saat online. Menerapkan pembaruan dan memuat ulang secara otomatis...
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-xs font-semibold">
              <RefreshCw size={13} className="animate-spin text-blue-400" />
              <span>Memperbarui otomatis...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress line indicator */}
      <div className="mt-3 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
        <div className="bg-blue-500 h-full rounded-full animate-pulse w-full duration-1000" />
      </div>
    </aside>
  );
}
