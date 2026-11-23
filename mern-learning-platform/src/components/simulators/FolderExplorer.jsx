// mern-learning-platform/src/components/simulators/FolderExplorer.jsx
import React, { useState } from 'react';
import { Folder, FileCode, CheckCircle2, AlertCircle, ArrowRight, Eye, Layers } from 'lucide-react';
import { genericMernStructure, priceRadarFiles } from '../../data/filesData.js';

export default function FolderExplorer() {
  const [viewMode, setViewMode] = useState('priceradar'); // 'priceradar' | 'generic'
  const [selectedFile, setSelectedFile] = useState(priceRadarFiles[0]);
  const [selectedFolder, setSelectedFolder] = useState(genericMernStructure.folders[0]);

  return (
    <div className="card-base p-6">
      {/* View Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Layers className="w-3.5 h-3.5" /> Interactive File & Architecture Explorer
          </div>
          <h3 className="text-xl font-bold text-white">Project Folder Structure & Codebase Inspector</h3>
          <p className="text-sm text-slate-400">Toggle between the industry standard MERN skeleton and the real PriceRadar codebase.</p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('priceradar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'priceradar' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Real PriceRadar Codebase
          </button>
          <button
            onClick={() => setViewMode('generic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'generic' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Generic MERN Skeleton
          </button>
        </div>
      </div>

      {viewMode === 'priceradar' ? (
        /* --- VIEW B: REAL PRICERADAR CODEBASE --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File List */}
          <div className="lg:col-span-5 space-y-2 max-h-[560px] overflow-y-auto pr-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 mb-2">
              Select File to Inspect (Real Source Files)
            </div>
            {priceRadarFiles.map(file => {
              const isSelected = selectedFile?.id === file.id;
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 text-white ring-1 ring-emerald-500'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold truncate text-white">{file.name}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                        {file.layer}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 truncate mt-0.5">{file.path}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed File Inspector */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-4 overflow-y-auto max-h-[560px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{selectedFile.layer}</span>
                <h4 className="text-lg font-bold font-mono text-white mt-0.5">{selectedFile.name}</h4>
                <div className="text-xs font-mono text-slate-400">{selectedFile.path}</div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                {selectedFile.flowPosition}
              </span>
            </div>

            <div>
              <div className="text-xs font-bold uppercase text-slate-400 mb-1">Why this file exists:</div>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedFile.whyExists}</p>
            </div>

            <div>
              <div className="text-xs font-bold uppercase text-slate-400 mb-1">Primary Engineering Responsibility:</div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
                {selectedFile.responsibility}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-bold uppercase text-slate-400 mb-1">Important Imports:</div>
                <ul className="text-xs font-mono text-slate-300 space-y-1 bg-slate-950 p-2 rounded border border-slate-800">
                  {selectedFile.imports.map((imp, idx) => (
                    <li key={idx} className="truncate">• {imp}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-slate-400 mb-1">Important Exports:</div>
                <ul className="text-xs font-mono text-emerald-400 space-y-1 bg-slate-950 p-2 rounded border border-slate-800">
                  {selectedFile.exports.map((exp, idx) => (
                    <li key={idx} className="truncate">• {exp}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase text-slate-400 mb-1">Simplified Code Snippet:</div>
              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                {selectedFile.codeSnippet}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        /* --- VIEW A: GENERIC MERN SKELETON --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Generic Folder List */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 mb-2">
              Industry Standard MERN Layers
            </div>
            {genericMernStructure.folders.map((folder, idx) => {
              const isSelected = selectedFolder?.name === folder.name;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedFolder(folder)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 text-white ring-1 ring-emerald-500'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="font-mono text-xs font-bold truncate text-white">{folder.name}</span>
                </button>
              );
            })}
          </div>

          {/* Generic Folder Description */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Layer Specification</span>
              <h4 className="text-lg font-bold font-mono text-white mt-0.5">{selectedFolder.name}</h4>
            </div>

            <div>
              <div className="text-xs font-bold uppercase text-slate-400 mb-1">Purpose & Responsibility:</div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
                {selectedFolder.purpose}
              </p>
            </div>

            <div>
              <div className="text-xs font-bold uppercase text-emerald-400 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> What Belongs Here:
              </div>
              <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
                {selectedFolder.whatBelongs}
              </p>
            </div>

            <div>
              <div className="text-xs font-bold uppercase text-rose-400 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> What MUST NOT Be Placed Here:
              </div>
              <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
                {selectedFolder.whatDoesNotBelong}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
