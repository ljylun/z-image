import React, { useState } from 'react';
import { Settings, Zap, Image as ImageIcon, Download, Share2, Loader2, RefreshCw, Terminal, Box } from 'lucide-react';
import { generateImage } from './services/api';

// Types for the application state
interface GenSettings {
  prompt: string;
  height: number;
  width: number;
  steps: number;
  guidanceScale: number;
  seed: number;
  useFlashAttn3: boolean;
}

const App: React.FC = () => {
  const [settings, setSettings] = useState<GenSettings>({
    prompt: "Young Chinese woman in red Hanfu, intricate embroidery. Impeccable makeup, red floral forehead pattern. Elaborate high bun, golden phoenix headdress, red flowers, beads. Holds round folding fan with lady, trees, bird. Neon lightning-bolt lamp (⚡️), bright yellow glow, above extended left palm. Soft-lit outdoor night background, silhouetted tiered pagoda (西安大雁塔), blurred colorful distant lights.",
    height: 1024,
    width: 1024,
    steps: 9,
    guidanceScale: 0.0,
    seed: 42,
    useFlashAttn3: true,
  });

  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'preview' | 'logs'>('preview');

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const handleGenerate = async () => {
    setLoading(true);
    addLog(`Starting generation with seed ${settings.seed}...`);
    try {
      // In a real environment, this connects to the python backend provided in the file list
      const result = await generateImage(settings);
      setGeneratedImage(result);
      addLog("Generation successful.");
      setActiveTab('preview');
    } catch (error) {
      console.error(error);
      addLog("Error: Failed to connect to backend. Make sure the Docker container is running on port 8000.");
      // Fallback for demo purposes if backend isn't actually running in this preview environment
      if (process.env.NODE_ENV !== 'production') {
        addLog("DEMO MODE: Returning placeholder image since backend is unreachable.");
        setGeneratedImage(`https://picsum.photos/${settings.width}/${settings.height}?random=${Date.now()}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `z-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Controls */}
      <aside className="w-full md:w-96 bg-white border-r border-zinc-200 flex-shrink-0 flex flex-col h-screen overflow-y-auto z-10">
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-red-600 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-500 bg-clip-text text-transparent">
              Z-Image Turbo
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-mono">CUDA 12.4 / Flash Attn 3</p>
        </div>

        <div className="p-6 space-y-8 flex-grow">

          {/* Prompt Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700 flex items-center justify-between">
              Prompt
              <span className="text-xs text-zinc-500">{settings.prompt.length} chars</span>
            </label>
            <textarea
              className="w-full h-32 bg-white border border-zinc-300 rounded-xl p-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none transition-all"
              placeholder="Describe your imagination..."
              value={settings.prompt}
              onChange={(e) => setSettings({ ...settings, prompt: e.target.value })}
            />
          </div>

          {/* Settings Grid */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 pb-2 border-b border-zinc-200">
              <Settings className="w-4 h-4" />
              Generation Parameters
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Width</label>
                <input
                  type="number"
                  step={64}
                  value={settings.width}
                  onChange={(e) => setSettings({ ...settings, width: Number(e.target.value) })}
                  className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-sm focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Height</label>
                <input
                  type="number"
                  step={64}
                  value={settings.height}
                  onChange={(e) => setSettings({ ...settings, height: Number(e.target.value) })}
                  className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-sm focus:border-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Inference Steps</label>
                  <span className="text-xs text-zinc-400">{settings.steps}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={settings.steps}
                  onChange={(e) => setSettings({ ...settings, steps: Number(e.target.value) })}
                  className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Guidance Scale</label>
                  <span className="text-xs text-zinc-400">{settings.guidanceScale.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.1}
                  value={settings.guidanceScale}
                  onChange={(e) => setSettings({ ...settings, guidanceScale: Number(e.target.value) })}
                  className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Seed</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={settings.seed}
                  onChange={(e) => setSettings({ ...settings, seed: Number(e.target.value) })}
                  className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-sm focus:border-zinc-500 focus:outline-none"
                />
                <button
                  onClick={() => setSettings({ ...settings, seed: Math.floor(Math.random() * 999999) })}
                  className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors border border-zinc-300"
                >
                  <RefreshCw className="w-4 h-4 text-zinc-600" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
              <label className="text-sm text-zinc-700">Flash Attention 3</label>
              <button
                onClick={() => setSettings(s => ({ ...s, useFlashAttn3: !s.useFlashAttn3 }))}
                className={`w-10 h-5 rounded-full relative transition-colors ${settings.useFlashAttn3 ? 'bg-red-600' : 'bg-zinc-300'}`}
              >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.useFlashAttn3 ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-200 bg-zinc-50">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${loading
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/20 active:scale-[0.98]'
              }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
            {loading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col h-screen relative bg-zinc-100">

        {/* Header Tabs */}
        <div className="absolute top-6 left-6 right-6 z-20 flex justify-center pointer-events-none">
          <div className="bg-white/80 backdrop-blur-md border border-zinc-200 p-1 rounded-full pointer-events-auto flex gap-1 shadow-lg">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-zinc-200 text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              <ImageIcon className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'logs' ? 'bg-zinc-200 text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              <Terminal className="w-4 h-4" />
              Logs & Docker
            </button>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center p-6 md:p-12 overflow-hidden">
          {activeTab === 'preview' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {generatedImage ? (
                <div className="relative group max-w-full max-h-full aspect-square">
                  <img
                    src={generatedImage}
                    alt="Generated output"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-zinc-200"
                  />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={handleDownload} className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur text-white rounded-lg border border-white/10 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur text-white rounded-lg border border-white/10 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-400">
                  <div className="w-24 h-24 mb-6 rounded-2xl border-2 border-dashed border-zinc-300 flex items-center justify-center">
                    <Box className="w-10 h-10 opacity-50" />
                  </div>
                  <p className="text-lg font-medium text-zinc-600">Ready to Imagine</p>
                  <p className="text-sm opacity-50 mt-2">Configure settings and press Generate</p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-4xl h-full bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col font-mono text-sm shadow-2xl">
              <div className="bg-zinc-100 px-4 py-2 border-b border-zinc-200 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                <span className="ml-2 text-zinc-500 text-xs">backend-logs — bash — 80x24</span>
              </div>
              <div className="flex-grow p-4 overflow-y-auto space-y-2 text-zinc-600">
                <div className="text-zinc-500 mb-4">
                  # Docker Container Status: <span className="text-green-600">Running</span><br />
                  # GPU: <span className="text-blue-600">NVIDIA A100-SXM4-40GB</span> (Simulated)<br />
                  # CUDA: <span className="text-blue-600">12.4</span> | Diffusers: <span className="text-blue-600">v0.29.0.dev0</span>
                </div>
                {logs.length === 0 && <span className="opacity-30">Waiting for events...</span>}
                {logs.map((log, i) => (
                  <div key={i} className="border-l-2 border-zinc-200 pl-3 py-1">
                    <span className="text-zinc-400 mr-2">{log.split(']')[0]}]</span>
                    <span className="text-zinc-700">{log.split(']')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;