import React, { useState, useRef } from 'react';
import { Upload, FileCode, Play, AlertCircle, RefreshCw } from 'lucide-react';

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' }
];

export default function CodeInput({
  code,
  setCode,
  language,
  setLanguage,
  docStyle,
  setDocStyle,
  filename,
  setFilename,
  onGenerate,
  isLoading
}) {
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'file'
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const detectLanguage = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    const mapping = {
      'py': 'python',
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'java': 'java',
      'cpp': 'cpp',
      'cc': 'cpp',
      'h': 'cpp',
      'hpp': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'sql': 'sql',
      'sh': 'bash'
    };
    return mapping[ext] || 'python';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
      setFilename(file.name);
      setLanguage(detectLanguage(file.name));
      setActiveTab('text'); // change to text tab so they can edit it
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
      {/* Selector de Entrada */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
            activeTab === 'text'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          Editor de Texto
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
            activeTab === 'file'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          Cargar Archivo
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4">
        {/* Editor de Código / Drag-Drop */}
        <div className="flex-1 flex flex-col min-h-[300px]">
          {activeTab === 'text' ? (
            <div className="relative flex-1 flex flex-col">
              {filename && (
                <div className="flex items-center justify-between bg-slate-850 px-3 py-1.5 rounded-t-xl border-t border-x border-slate-800 text-xxs text-slate-400">
                  <span className="flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5 text-violet-400" />
                    {filename}
                  </span>
                  <button
                    onClick={() => {
                      setFilename('');
                      setCode('');
                    }}
                    className="hover:text-rose-400 transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              )}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Escribe o pega tu código aquí..."
                className={`flex-1 w-full bg-slate-950/60 text-slate-200 font-mono text-sm p-4 border border-slate-850 focus:outline-none focus:border-violet-500/80 focus:ring-1 focus:ring-violet-500/30 resize-none custom-scrollbar ${
                  filename ? 'rounded-b-xl border-t-0' : 'rounded-xl'
                }`}
              />
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer p-8 text-center transition-all duration-300 ${
                dragOver
                  ? 'border-violet-500 bg-violet-600/5 shadow-inner'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".py,.js,.jsx,.ts,.tsx,.html,.css,.java,.cpp,.cc,.h,.hpp,.cs,.go,.rs,.sql,.sh,.json"
              />
              <div className="bg-slate-800/50 p-4 rounded-full border border-slate-700/50 mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-300">Arrastra tu archivo aquí</p>
              <p className="text-xs text-slate-500 mt-1">O haz clic para explorar en tu equipo</p>
              <p className="text-xxs text-slate-600 mt-3 max-w-xs">
                Soporta Python, JavaScript, TypeScript, Java, C++, C#, Go, Rust, HTML, CSS, SQL, y Bash.
              </p>
            </div>
          )}
        </div>

        {/* Parámetros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Lenguaje */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Lenguaje</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value} className="bg-slate-900">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nombre de Archivo opcional */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Nombre de Archivo (Opcional)</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="ej. calculate.py"
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Estilo de Documentación */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Tipo de Documentación</label>
            <select
              value={docStyle}
              onChange={(e) => setDocStyle(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
            >
              <option value="inline" className="bg-slate-900">Comentarios Internos (Docstrings)</option>
              <option value="external" className="bg-slate-900">Guía Externa (Markdown)</option>
              <option value="both" className="bg-slate-900">Ambas Generaciones</option>
            </select>
          </div>
        </div>

        {/* Botón de Acción */}
        <button
          onClick={onGenerate}
          disabled={isLoading || !code.trim()}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 uppercase transition-all duration-300 ${
            isLoading || !code.trim()
              ? 'bg-slate-800 text-slate-600 border border-slate-850 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 border border-indigo-500/25 active:scale-98'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              Documentando...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-white" />
              Generar Documentación
            </>
          )}
        </button>
      </div>
    </div>
  );
}
