import React, { useState } from "react";
import {
  Upload,
  Sparkles,
  Gamepad2,
  FileText,
  Palette,
  Play,
  Bot,
  HelpCircle,
  BookOpen,
  Settings,
  Download,
  Smartphone,
  CheckCircle,
  X,
  Info,
  ShieldCheck
} from "lucide-react";
import { AvatarConfig, GameMode } from "../types";
import { parseDocumentFile } from "../utils/documentParser";

interface SetupScreenProps {
  onGenerateAI: (sourceText: string, questionCount: number) => Promise<void>;
  onUsePreset: (category: string) => void;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  avatarConfig: AvatarConfig;
  setAvatarConfig: React.Dispatch<React.SetStateAction<AvatarConfig>>;
  questionCount: number;
  setQuestionCount: (count: number) => void;
  isLoading: boolean;
  showToast: (msg: string, type?: "error" | "success" | "info") => void;
  deferredInstallPrompt?: any;
  isStandalone?: boolean;
  onInstallApp?: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onGenerateAI,
  onUsePreset,
  gameMode,
  setGameMode,
  avatarConfig,
  setAvatarConfig,
  questionCount,
  setQuestionCount,
  isLoading,
  showToast,
  deferredInstallPrompt,
  isStandalone = false,
  onInstallApp,
}) => {
  const [sourceText, setSourceText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    showToast(`Extracting content from ${file.name}...`, "info");

    try {
      const extractedText = await parseDocumentFile(file);
      if (!extractedText.trim()) {
        showToast("Could not extract readable text from file.", "error");
      } else {
        setSourceText(extractedText);
        showToast("Document imported successfully!", "success");
      }
    } catch (err: any) {
      showToast("Error reading document: " + err.message, "error");
    } finally {
      setIsExtracting(false);
      e.target.value = "";
    }
  };

  const handleGenerateClick = () => {
    if (!sourceText.trim()) {
      showToast("Please paste notes or upload a document first!", "error");
      return;
    }
    onGenerateAI(sourceText, questionCount);
  };

  return (
    <div className="w-full max-w-xl mx-auto min-h-screen p-4 md:p-6 flex flex-col justify-start bg-slate-950 text-white relative">
      
      {/* Top Header Bar with Settings & PWA Button */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-4 h-4 animate-pulse" />
          </div>
          <span className="text-xs font-bold text-slate-300">AI Quiz Multiverse</span>
        </div>

        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-blue-400" />
          <span>Pengaturan & PWA</span>
          {deferredInstallPrompt && (
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
          )}
        </button>
      </div>

      {/* Title Banner */}
      <div className="text-center my-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Powered by Google Gemini AI</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
          AI Quiz Multiverse
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Turn your study notes & documents into playable, action-packed arcade mini-games!
        </p>
      </div>

      {/* Main Form Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-2xl space-y-4 backdrop-blur-md mt-2">
        
        {/* Upload & Notes Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              1. Source Material
            </label>
            <label className="cursor-pointer text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 font-semibold">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
              <input
                type="file"
                accept=".txt,.md,.csv,.json,.pdf,.docx"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isExtracting || isLoading}
              />
            </label>
          </div>

          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            disabled={isExtracting || isLoading}
            placeholder="Paste your study notes, textbook summary, article, or upload a document (.pdf, .docx, .txt)..."
            className="w-full h-28 md:h-32 bg-slate-950/80 text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 text-xs md:text-sm resize-none shadow-inner transition-colors font-mono placeholder:text-slate-600"
          />
        </div>

        {/* Quick Demo Presets */}
        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            Or pick a sample topic preset:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onUsePreset("general")}
              className="py-1.5 px-2 bg-slate-800 hover:bg-indigo-900/40 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:text-indigo-200 transition-colors text-center truncate"
            >
              🌍 General Trivia
            </button>
            <button
              type="button"
              onClick={() => onUsePreset("space")}
              className="py-1.5 px-2 bg-slate-800 hover:bg-indigo-900/40 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:text-indigo-200 transition-colors text-center truncate"
            >
              🚀 Astronomy & Space
            </button>
            <button
              type="button"
              onClick={() => onUsePreset("programming")}
              className="py-1.5 px-2 bg-slate-800 hover:bg-indigo-900/40 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:text-indigo-200 transition-colors text-center truncate"
            >
              💻 Web Tech
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-purple-400" />
            2. Select Game Mode
          </label>
          <select
            value={gameMode}
            onChange={(e) => setGameMode(e.target.value as GameMode)}
            className="w-full bg-slate-950 text-white text-xs md:text-sm p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-bold"
          >
            <option value="normal">📝 Normal Quiz (Classic Options)</option>
            <option value="runner">🚀 Drop Runner (Catch falling answer in 4 lanes)</option>
            <option value="flappy">🐦 Flappy Quiz (Fly up/down into answer blocks)</option>
            <option value="dash">⬛ Dash Jump (Jump over/into answer obstacles)</option>
            <option value="shooter">🛸 Space Shooter (Move lanes & shoot laser blasts)</option>
          </select>
        </div>

        {/* Customize Avatar (For minigames) */}
        {gameMode !== "normal" && (
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-pink-400" />
              3. Customize Arcade Avatar
            </label>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Shape</span>
                <select
                  value={avatarConfig.shape}
                  onChange={(e) =>
                    setAvatarConfig((prev) => ({
                      ...prev,
                      shape: e.target.value as any,
                    }))
                  }
                  className="w-full bg-slate-900 text-white text-xs p-2 rounded-lg border border-slate-700 focus:outline-none"
                >
                  <option value="triangle">Triangle</option>
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Color</span>
                <div className="relative h-8 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                  <input
                    type="color"
                    value={avatarConfig.color}
                    onChange={(e) =>
                      setAvatarConfig((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="absolute -top-3 -left-3 w-20 h-20 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Face Expression</span>
                <select
                  value={avatarConfig.face}
                  onChange={(e) =>
                    setAvatarConfig((prev) => ({
                      ...prev,
                      face: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-900 text-white text-xs p-2 rounded-lg border border-slate-700 focus:outline-none"
                >
                  <option value="">No Face</option>
                  <option value="(•‿•)">(•‿•)</option>
                  <option value="(>_<)">(&gt;_&lt;)</option>
                  <option value="(⌐■_■)">(⌐■_■)</option>
                  <option value="(T_T)">(T_T)</option>
                  <option value="ʕ•ᴥ•ʔ">ʕ•ᴥ•ʔ</option>
                  <option value="(O_O)">(O_O)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Question Count */}
        <div className="flex items-center justify-between pt-1">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            Questions Count
          </label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="bg-slate-950 text-white text-xs p-2 rounded-lg border border-slate-800 focus:outline-none font-bold"
          >
            <option value={5}>5 Questions</option>
            <option value={10}>10 Questions</option>
            <option value={15}>15 Questions</option>
          </select>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-4 space-y-2 bg-blue-950/30 border border-blue-500/30 rounded-xl">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-blue-300 font-bold animate-pulse">
              Gemini AI is crafting your arcade quiz...
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {!isLoading && (
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleGenerateClick}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-black text-sm md:text-base shadow-lg shadow-blue-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" style={{ animationDuration: "3s" }} />
              <span>Generate AI Quiz with Gemini</span>
            </button>

            <button
              type="button"
              onClick={() => onUsePreset("general")}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Play Default Trivia Quiz Immediately</span>
            </button>
          </div>
        )}
      </div>

      {/* Settings & PWA Installation Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Pengaturan & PWA</h3>
                  <p className="text-xs text-slate-400">Kelola preferensi & install aplikasi ke perangkat</p>
                </div>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PWA Section */}
            <div className="space-y-4">
              
              {/* Card PWA Install */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">Aplikasi PWA (Progressive Web App)</h4>
                      <p className="text-[11px] text-slate-400">Mainkan tanpa browser frame & dapat diakses secara offline.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs">
                  <span className="text-slate-400 font-semibold">Status Aplikasi:</span>
                  {isStandalone ? (
                    <span className="inline-flex items-center gap-1 font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" /> Terpasang (Standalone)
                    </span>
                  ) : deferredInstallPrompt ? (
                    <span className="inline-flex items-center gap-1 font-extrabold text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-[11px] animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Siap Di-install
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full text-[11px]">
                      Browser Web
                    </span>
                  )}
                </div>

                {/* Install Action Button */}
                {isStandalone ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>AI Quiz Multiverse sudah terpasang di perangkat Anda. Anda dapat membukanya langsung dari Home Screen atau Menu Aplikasi.</span>
                  </div>
                ) : deferredInstallPrompt ? (
                  <button
                    onClick={() => {
                      if (onInstallApp) onInstallApp();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Aplikasi AI Quiz Multiverse</span>
                  </button>
                ) : (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-2 text-slate-300">
                    <div className="font-bold text-blue-400 flex items-center gap-1.5">
                      <Info className="w-4 h-4" /> Cara Menginstall Secara Manual:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                      <li><strong>Desktop Chrome / Edge:</strong> Klik menu titik tiga <span className="font-bold text-white">⋮</span> di kanan atas $\rightarrow$ <strong>"Install AI Quiz Multiverse"</strong></li>
                      <li><strong>iPhone / iPad (Safari):</strong> Klik tombol Share <span className="font-bold text-white">⎘</span> $\rightarrow$ <strong>"Add to Home Screen"</strong></li>
                      <li><strong>Android Chrome:</strong> Klik menu titik tiga <span className="font-bold text-white">⋮</span> $\rightarrow$ <strong>"Install app"</strong></li>
                    </ul>
                  </div>
                )}
              </div>

              {/* System & Engine Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Sistem & AI Engine</div>
                <div className="flex items-center justify-between text-slate-400 py-1 border-b border-slate-900">
                  <span>AI Model:</span>
                  <span className="font-bold text-blue-400">Google Gemini 1.5 Flash</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 py-1 border-b border-slate-900">
                  <span>Service Worker:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Aktif (Offline Ready)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400 py-1">
                  <span>Versi PWA:</span>
                  <span className="font-mono text-slate-300 font-bold">v1.0.0</span>
                </div>
              </div>

            </div>

            {/* Footer Close */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
