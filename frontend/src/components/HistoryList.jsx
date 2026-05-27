import React from 'react';
import { Trash2, FileText, Code, Calendar } from 'lucide-react';

export default function HistoryList({ history, activeItem, onSelectItem, onDeleteItem }) {
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('es-ES', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border-r border-slate-800 w-full md:w-80 flex-shrink-0 flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historial en Base de Datos</h2>
        <span className="bg-slate-800/80 text-violet-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-slate-700/50">
          {history.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4">
            <FileText className="w-8 h-8 text-slate-700 mb-2" />
            <p className="text-sm text-slate-500 font-medium">Historial vacío</p>
            <p className="text-xs text-slate-600 mt-1">El código documentado se guardará en la base de datos.</p>
          </div>
        ) : (
          history.map((item) => {
            const isActive = activeItem && activeItem.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`group relative flex flex-col gap-1.5 p-3 rounded-xl cursor-pointer border transition-all duration-200 ${
                  isActive
                    ? 'bg-violet-600/10 border-violet-500/50 shadow-md shadow-violet-500/5'
                    : 'bg-slate-800/20 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Code className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                    <span className="text-sm font-medium text-slate-200 truncate">
                      {item.filename || 'Código sin nombre'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800/80 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs mt-1 text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/50 text-slate-400 font-semibold text-xxs uppercase">
                    {item.language}
                  </span>
                  <span className="flex items-center gap-1 text-xxs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {formatTime(item.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
