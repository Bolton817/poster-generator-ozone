"use client";

import React, { useState } from "react";
import { useEditor } from "@/features/editor/editor-context";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Music, Mic, Plus, Trash2, AlertTriangle } from "lucide-react";

export function LineupSection() {
  const { state, addDj, removeDj, updateDj, addHost, removeHost, updateHost } = useEditor();
  const { document, warnings } = state;

  const [newDjName, setNewDjName] = useState("");
  const [newHostName, setNewHostName] = useState("");

  const handleAddDj = () => {
    if (newDjName.trim()) {
      addDj(newDjName.trim());
      setNewDjName("");
    }
  };

  const handleAddHost = () => {
    if (newHostName.trim()) {
      addHost(newHostName.trim());
      setNewHostName("");
    }
  };

  const djNames = document.content.djNames;
  const hostNames = document.content.hostNames;

  return (
    <CollapsibleSection
      title="Performer Lineup"
      subtitle={`${djNames.length} DJs · ${hostNames.length} Hosts`}
      icon={<Music className="w-4 h-4" />}
    >
      <div className="space-y-6 p-4">
        {/* DJ Roles Group */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" /> DJs / Selectors ({djNames.length})
            </span>
          </div>

          <div className="space-y-2">
            {djNames.map((name, idx) => {
              const warning = warnings.find((w) => w.field === `djNames[${idx}]`);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Input
                      value={name}
                      onChange={(e) => updateDj(idx, e.target.value)}
                      placeholder="DJ Name"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeDj(idx)}
                      aria-label={`Remove DJ ${name}`}
                      className="p-2.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {warning && (
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs pl-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{warning.message}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {djNames.length === 0 && (
              <p className="text-xs text-slate-500 italic py-1">No DJs currently assigned.</p>
            )}

            {/* Add DJ input */}
            <div className="flex items-center gap-2 pt-1">
              <Input
                value={newDjName}
                onChange={(e) => setNewDjName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddDj();
                  }
                }}
                placeholder="Enter DJ name..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDj}
                disabled={!newDjName.trim()}
                className="shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
          </div>
        </div>

        {/* Host Roles Group */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" /> Hosts / MCs ({hostNames.length})
            </span>
          </div>

          <div className="space-y-2">
            {hostNames.map((name, idx) => {
              const warning = warnings.find((w) => w.field === `hostNames[${idx}]`);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Input
                      value={name}
                      onChange={(e) => updateHost(idx, e.target.value)}
                      placeholder="Host Name"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeHost(idx)}
                      aria-label={`Remove Host ${name}`}
                      className="p-2.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {warning && (
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs pl-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{warning.message}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {hostNames.length === 0 && (
              <p className="text-xs text-slate-500 italic py-1">No Hosts currently assigned.</p>
            )}

            {/* Add Host input */}
            <div className="flex items-center gap-2 pt-1">
              <Input
                value={newHostName}
                onChange={(e) => setNewHostName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddHost();
                  }
                }}
                placeholder="Enter Host name..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddHost}
                disabled={!newHostName.trim()}
                className="shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
