import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HistoryList from './components/HistoryList';
import CodeInput from './components/CodeInput';
import OutputView from './components/OutputView';
import { Database, AlertTriangle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export default function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [docStyle, setDocStyle] = useState('inline');
  const [filename, setFilename] = useState('');
  const [selectedModel, setSelectedModel] = useState('qwen2.5-coder:3b');
  const [models, setModels] = useState(['qwen2.5-coder:3b']);
  
  const [backendStatus, setBackendStatus] = useState('offline');
  const [history, setHistory] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  
  const [documentedCode, setDocumentedCode] = useState('');
  const [markdownGuide, setMarkdownGuide] = useState('');
  
  const [isGeneratingInline, setIsGeneratingInline] = useState(false);
  const [isGeneratingExternal, setIsGeneratingExternal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [generationStats, setGenerationStats] = useState({
    progress: 0,
    timeRemaining: null,
    speed: 0,
    status: ''
  });

  // Cargar modelos e historial al iniciar
  useEffect(() => {
    fetchModels();
    fetchHistory();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch(`${API_BASE}/models`);
      if (res.ok) {
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          setModels(data.models);
          if (data.models.includes('qwen2.5-coder:3b')) {
            setSelectedModel('qwen2.5-coder:3b');
          } else {
            setSelectedModel(data.models[0]);
          }
        }
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (e) {
      console.error('Error al conectar con Flask / Ollama:', e);
      setBackendStatus('offline');
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error('Error al obtener historial:', e);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/history/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
        if (activeItem && activeItem.id === id) {
          setActiveItem(null);
          setDocumentedCode('');
          setMarkdownGuide('');
        }
      }
    } catch (e) {
      console.error('Error al eliminar ítem:', e);
    }
  };

  const handleSelectItem = (item) => {
    setActiveItem(item);
    setCode(item.original_code);
    setLanguage(item.language);
    setFilename(item.filename || '');
    setDocumentedCode(item.documented_code || '');
    setMarkdownGuide(item.markdown_guide || '');
    // Reset stats when loading history
    setGenerationStats({
      progress: 0,
      timeRemaining: null,
      speed: 0,
      status: ''
    });
  };

  // Función para procesar un stream de texto
  const startStream = async (style, setOutput, setGenerating, onChunk) => {
    setGenerating(true);
    setOutput('');
    
    try {
      const response = await fetch(`${API_BASE}/document-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          style,
          language,
          model: selectedModel,
          filename
        })
      });

      if (!response.ok) {
        throw new Error(`Respuesta HTTP no exitosa: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          text += chunk;
          setOutput(text);
          if (onChunk) {
            onChunk(text);
          }
        }
      }
    } catch (err) {
      console.error(`Error en stream de estilo ${style}:`, err);
      setErrorMessage(`Error en generación: ${err.message}`);
      setOutput(prev => prev + `\n[Error al generar: ${err.message}]`);
      throw err; // propagates to handleGenerate catch
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!code.trim()) return;
    
    setErrorMessage('');
    setActiveItem(null);
    setDocumentedCode('');
    setMarkdownGuide('');
    
    // Estadísticas de seguimiento
    const lengths = { inline: 0, external: 0 };
    
    // Estimación estadística de longitud total esperada
    const expectedInlineLen = code.length * 1.1 + 100;
    const expectedExternalLen = code.length * 0.7 + 800;
    const expectedLen = docStyle === 'both'
      ? expectedInlineLen + expectedExternalLen
      : (docStyle === 'inline' ? expectedInlineLen : expectedExternalLen);

    const startTime = Date.now();

    setGenerationStats({
      progress: 5,
      timeRemaining: null,
      speed: 0,
      status: 'Conectando con Ollama e inicializando modelo...'
    });

    const updateProgress = () => {
      const currentLength = lengths.inline + lengths.external;
      const elapsed = (Date.now() - startTime) / 1000;
      
      if (elapsed > 0.3) {
        const speed = currentLength / elapsed; // caracteres por segundo
        let progress = Math.round((currentLength / expectedLen) * 90);
        progress = Math.min(95, Math.max(10, progress));
        
        let timeRemaining = null;
        if (progress > 15 && speed > 0) {
          const remainingChars = expectedLen - currentLength;
          timeRemaining = Math.max(1, Math.round(remainingChars / speed));
        }
        
        setGenerationStats({
          progress,
          timeRemaining,
          speed: Math.round(speed),
          status: `Generando documentación (${docStyle === 'both' ? 'código y guía' : docStyle === 'inline' ? 'código' : 'guía'})...`
        });
      }
    };

    try {
      if (docStyle === 'inline') {
        await startStream('inline', setDocumentedCode, setIsGeneratingInline, (text) => {
          lengths.inline = text.length;
          updateProgress();
        });
        await fetchHistory();
      } else if (docStyle === 'external') {
        await startStream('external', setMarkdownGuide, setIsGeneratingExternal, (text) => {
          lengths.external = text.length;
          updateProgress();
        });
        await fetchHistory();
      } else if (docStyle === 'both') {
        // Ejecutar ambos en paralelo
        const inlinePromise = startStream('inline', setDocumentedCode, setIsGeneratingInline, (text) => {
          lengths.inline = text.length;
          updateProgress();
        });
        const externalPromise = startStream('external', setMarkdownGuide, setIsGeneratingExternal, (text) => {
          lengths.external = text.length;
          updateProgress();
        });
        
        await Promise.all([inlinePromise, externalPromise]);
        setTimeout(async () => {
          await fetchHistory();
        }, 500);
      }

      // Generación completada con éxito
      setGenerationStats({
        progress: 100,
        timeRemaining: 0,
        speed: 0,
        status: '¡Documentación completada con éxito!'
      });
      
      // Ocultar barra tras 2.5 segundos
      setTimeout(() => {
        setGenerationStats(prev => prev.progress === 100 ? { progress: 0, timeRemaining: null, speed: 0, status: '' } : prev);
      }, 2500);

    } catch (e) {
      console.error('Error durante la generación:', e);
      setGenerationStats({
        progress: 0,
        timeRemaining: null,
        speed: 0,
        status: `Error: ${e.message}`
      });
    }
  };

  const isGenerating = isGeneratingInline || isGeneratingExternal;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Navbar */}
      <Navbar
        models={models}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        backendStatus={backendStatus}
      />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Historial en Sidebar */}
        <HistoryList
          history={history}
          activeItem={activeItem}
          onSelectItem={handleSelectItem}
          onDeleteItem={handleDeleteItem}
        />

        {/* Zona de Trabajo */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 p-6 gap-6">
          {/* Columna Izquierda: Entrada - CORREGIDO min-w-0 para evitar colapso */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-y-auto custom-scrollbar md:h-full">
            {errorMessage && (
              <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Error del sistema: </span>
                  {errorMessage}
                </div>
              </div>
            )}

            <CodeInput
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
              docStyle={docStyle}
              setDocStyle={setDocStyle}
              filename={filename}
              setFilename={setFilename}
              onGenerate={handleGenerate}
              isLoading={isGenerating}
            />
          </div>

          {/* Columna Derecha: Salida - CORREGIDO min-w-0 para evitar colapso */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0 md:h-full">
            <OutputView
              documentedCode={documentedCode}
              markdownGuide={markdownGuide}
              language={language}
              filename={filename}
              isGeneratingInline={isGeneratingInline}
              isGeneratingExternal={isGeneratingExternal}
              generationStats={generationStats}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
