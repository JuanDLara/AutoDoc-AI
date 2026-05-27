import React from 'react';
import { BookOpen, Cpu } from 'lucide-react';

export default function Navbar({ models, selectedModel, setSelectedModel, backendStatus }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/25">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 via-indigo-200 to-emerald-400 bg-clip-text text-transparent">
            AutoDoc AI
          </h1>
          <p className="text-xs text-slate-400">Documentación Inteligente de Código</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Estado de conexión */}
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 text-xs">
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${backendStatus === 'online' ? 'bg-emerald-500 shadow-emerald-500/50 shadow-sm' : 'bg-rose-500 shadow-rose-500/50'}`} />
          <span className="text-slate-300 font-medium capitalize">Ollama: {backendStatus}</span>
        </div>

        {/* Selector de Modelo */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-sm text-slate-200">
          <Cpu className="w-4 h-4 text-violet-400" />
          <span className="text-slate-400 text-xs hidden sm:inline">Modelo:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-transparent border-none text-slate-200 focus:outline-none focus:ring-0 cursor-pointer font-medium"
          >
            {models.map((model) => (
              <option key={model} value={model} className="bg-slate-900 text-slate-200">
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
