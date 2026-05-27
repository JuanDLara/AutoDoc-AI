import React, { useState, useEffect } from 'react';
import { Copy, Download, Check, Columns, FileText, Code2, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';

/* ─────────────────────────────────────────────────────────
   Barra de Progreso con estimación de tiempo
───────────────────────────────────────────────────────── */
function ProgressBar({ stats }) {
  const { progress, timeRemaining, speed, status } = stats;

  if (!progress || progress === 0) return null;

  const isComplete = progress >= 100;

  const formatTime = (secs) => {
    if (secs === null || secs === undefined) return null;
    if (secs <= 0) return '< 1 s';
    if (secs < 60) return `~${secs} s`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `~${m}m ${s}s`;
  };

  return (
    <div
      className={`mx-4 mt-3 mb-1 rounded-xl border overflow-hidden transition-all duration-500 ${
        isComplete
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-violet-500/30 bg-violet-500/5'
      }`}
    >
      {/* Info Superior */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 gap-3">
        {/* Estado */}
        <div className="flex items-center gap-2 overflow-hidden">
          {isComplete ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          ) : (
            <div className="w-3.5 h-3.5 flex-shrink-0 relative">
              <div className="absolute inset-0 rounded-full bg-violet-400/30 animate-ping" />
              <div className="relative w-3.5 h-3.5 rounded-full bg-violet-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
          )}
          <span
            className={`text-xs font-medium truncate ${
              isComplete ? 'text-emerald-400' : 'text-slate-300'
            }`}
          >
            {status || (isComplete ? '¡Documentación completada!' : 'Procesando...')}
          </span>
        </div>

        {/* Métricas */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {!isComplete && speed > 0 && (
            <div className="flex items-center gap-1 text-xxs text-slate-500">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400 font-semibold">{speed.toLocaleString()}</span>
              <span>chars/s</span>
            </div>
          )}
          {!isComplete && formatTime(timeRemaining) && (
            <div className="flex items-center gap-1 text-xxs text-slate-500">
              <Clock className="w-3 h-3 text-sky-400" />
              <span className="text-sky-400 font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          )}
          {/* Porcentaje */}
          <span
            className={`text-xs font-bold tabular-nums min-w-[2.5rem] text-right ${
              isComplete ? 'text-emerald-400' : 'text-violet-300'
            }`}
          >
            {isComplete ? '100%' : `${progress}%`}
          </span>
        </div>
      </div>

      {/* Track de la barra */}
      <div className="h-1.5 w-full bg-slate-800/60">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-500'
          }`}
          style={{ width: `${Math.min(100, progress)}%` }}
        >
          {/* Efecto de brillo animado */}
          {!isComplete && (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)', animation: 'shimmer 1.5s infinite' }}
            />
          )}
        </div>
      </div>

      {/* Separador inferior invisible para padding */}
      <div className="h-1" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Componente Principal OutputView
───────────────────────────────────────────────────────── */
export default function OutputView({
  documentedCode,
  markdownGuide,
  language,
  filename,
  isGeneratingInline,
  isGeneratingExternal,
  generationStats
}) {
  const [activeTab, setActiveTab] = useState('inline');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedGuide, setCopiedGuide] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [documentedCode, activeTab]);

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (content, defaultName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDocName = () => {
    if (!filename) return `code_documentado.${getFileExtension()}`;
    const parts = filename.split('.');
    if (parts.length === 1) return `${filename}_doc`;
    const ext = parts.pop();
    return `${parts.join('.')}_doc.${ext}`;
  };

  const getGuideName = () => {
    if (!filename) return 'guia_documentacion.md';
    const parts = filename.split('.');
    return `${parts[0]}_doc.md`;
  };

  const getFileExtension = () => {
    const mapping = { python: 'py', javascript: 'js', typescript: 'ts', java: 'java', cpp: 'cpp', csharp: 'cs', go: 'go', rust: 'rs', html: 'html', css: 'css', sql: 'sql', bash: 'sh' };
    return mapping[language] || 'txt';
  };

  const getPrismLangClass = () => {
    const mapping = { python: 'language-python', javascript: 'language-javascript', typescript: 'language-typescript', java: 'language-java', cpp: 'language-cpp', csharp: 'language-csharp', go: 'language-go', rust: 'language-rust', html: 'language-html', css: 'language-css', sql: 'language-sql', bash: 'language-bash' };
    return mapping[language] || 'language-none';
  };

  const renderMarkdown = (md) => {
    if (!md) return '';
    try { return { __html: marked.parse(md) }; } catch (e) { return { __html: md }; }
  };

  const hasOutput = documentedCode || markdownGuide;
  const isGenerating = isGeneratingInline || isGeneratingExternal;
  const showProgress = generationStats && generationStats.progress > 0;

  // Placeholder vacío
  if (!hasOutput && !isGenerating && !showProgress) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[400px] shadow-xl">
        <div className="bg-slate-800/40 p-5 rounded-full border border-slate-700/50 mb-4 animate-pulse">
          <Code2 className="w-10 h-10 text-violet-500" />
        </div>
        <h3 className="text-base font-bold text-slate-300">Esperando Código</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-2">
          Pega tu código en el panel izquierdo y haz clic en "Generar Documentación" para procesarlo con el LLM.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl h-full min-h-[500px]">

      {/* ── Barra de Pestañas ── */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/40 p-2 gap-2 flex-shrink-0">
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('inline')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'inline' ? 'bg-slate-800 text-violet-400 border border-slate-700/50 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Código Documentado
            {isGeneratingInline && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />}
          </button>
          <button
            onClick={() => setActiveTab('external')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'external' ? 'bg-slate-800 text-violet-400 border border-slate-700/50 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Guía Markdown
            {isGeneratingExternal && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />}
          </button>
          <button
            onClick={() => setActiveTab('split')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold hidden md:flex items-center gap-1.5 transition-all ${
              activeTab === 'split' ? 'bg-slate-800 text-violet-400 border border-slate-700/50 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Vista Dividida
          </button>
        </div>
      </div>

      {/* ── Barra de Progreso ── */}
      {showProgress && <ProgressBar stats={generationStats} />}

      {/* ── Contenido Principal ── */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-950/20">

        {/* PANEL CÓDIGO INLINE */}
        {(activeTab === 'inline' || activeTab === 'split') && (
          <div className={`flex-1 flex flex-col min-h-0 min-w-0 ${activeTab === 'split' ? 'border-r border-slate-800' : ''}`}>
            <div className="bg-slate-950/30 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-semibold flex-shrink-0">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-xxs truncate">
                <Code2 className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                <span className="truncate">{getDocName()}</span>
              </span>
              {documentedCode && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => copyToClipboard(documentedCode, setCopiedCode)} className="hover:text-slate-200 p-1 rounded transition-colors" title="Copiar">
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => downloadFile(documentedCode, getDocName(), 'text/plain')} className="hover:text-slate-200 p-1 rounded transition-colors" title="Descargar">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto p-4 custom-scrollbar min-h-0">
              {documentedCode ? (
                <pre className="m-0 font-mono text-sm leading-relaxed">
                  <code className={getPrismLangClass()}>{documentedCode}</code>
                </pre>
              ) : isGeneratingInline ? (
                <div className="flex flex-col gap-2 mt-4">
                  <div className="h-4 bg-slate-800/80 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-slate-800/80 rounded animate-pulse w-1/2" />
                  <div className="h-4 bg-slate-800/80 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-slate-800/80 rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-slate-800/60 rounded animate-pulse w-4/5 mt-1" />
                  <div className="h-4 bg-slate-800/60 rounded animate-pulse w-1/3" />
                  <span className="text-xs text-slate-500 font-medium mt-3 italic">Escribiendo código documentado...</span>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                  No se generó documentación interna
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANEL GUÍA MARKDOWN */}
        {(activeTab === 'external' || activeTab === 'split') && (
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            <div className="bg-slate-950/30 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-semibold flex-shrink-0">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-xxs truncate">
                <FileText className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                <span className="truncate">{getGuideName()}</span>
              </span>
              {markdownGuide && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => copyToClipboard(markdownGuide, setCopiedGuide)} className="hover:text-slate-200 p-1 rounded transition-colors" title="Copiar">
                    {copiedGuide ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => downloadFile(markdownGuide, getGuideName(), 'text/markdown')} className="hover:text-slate-200 p-1 rounded transition-colors" title="Descargar">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto p-6 custom-scrollbar min-h-0">
              {markdownGuide ? (
                <article
                  className="prose prose-invert max-w-none text-slate-300 prose-headings:text-slate-100 prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:leading-relaxed prose-a:text-violet-400 hover:prose-a:text-violet-300 prose-code:text-violet-300 prose-code:bg-slate-800/40 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-xs prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl prose-li:my-1 prose-strong:text-slate-200"
                  dangerouslySetInnerHTML={renderMarkdown(markdownGuide)}
                />
              ) : isGeneratingExternal ? (
                <div className="flex flex-col gap-2 mt-4">
                  <div className="h-6 bg-slate-800/80 rounded animate-pulse w-1/3 mb-2" />
                  <div className="h-4 bg-slate-800/80 rounded animate-pulse w-full" />
                  <div className="h-4 bg-slate-800/80 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-slate-800/60 rounded animate-pulse w-4/5" />
                  <div className="h-4 bg-slate-800/60 rounded animate-pulse w-full mt-1" />
                  <div className="h-4 bg-slate-800/50 rounded animate-pulse w-3/4" />
                  <span className="text-xs text-slate-500 font-medium mt-3 italic">Redactando guía en Markdown...</span>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                  No se generó guía externa en Markdown
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
