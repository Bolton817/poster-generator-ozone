"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from "react";
import { PosterDocument, PosterContent, FocalPoint } from "../poster/schema";
import { TemplateDefinition, getTemplateById } from "../templates/registry";
import { EditorAction, EditorState } from "./types";
import { editorReducer, createInitialEditorState } from "./editor-reducer";

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  template: TemplateDefinition;
  // Convenience action dispatchers
  setTitle: (title: string) => void;
  setDraftName: (name: string) => void;
  setContentField: (field: keyof PosterContent, value: string | string[]) => void;
  addDj: (name: string) => void;
  removeDj: (index: number) => void;
  updateDj: (index: number, name: string) => void;
  addHost: (name: string) => void;
  removeHost: (index: number) => void;
  updateHost: (index: number, name: string) => void;
  setPalette: (paletteId: string) => void;
  setTypographyPreset: (presetId: string) => void;
  setLayoutOption: (optionId: string) => void;
  setAsset: (slot: "logo" | "background" | "secondary", assetId: string | null) => void;
  setFocalPoint: (slot: string, point: FocalPoint) => void;
  setActiveSection: (sectionId: string | null) => void;
  resetToDefaults: () => void;
  loadDocument: (doc: PosterDocument) => void;
  markSaved: () => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export interface EditorProviderProps {
  initialDocument: PosterDocument;
  children: React.ReactNode;
}

export function EditorProvider({ initialDocument, children }: EditorProviderProps) {
  const [state, dispatch] = useReducer(
    editorReducer,
    initialDocument,
    (doc) => createInitialEditorState(doc, "event")
  );

  const template = useMemo(() => {
    const tpl = getTemplateById(state.document.templateId);
    if (!tpl) {
      throw new Error(`Template definition not found for ID: ${state.document.templateId}`);
    }
    return tpl;
  }, [state.document.templateId]);

  // Browser navigation / refresh guard for unsaved changes
  useEffect(() => {
    if (!state.isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Most modern browsers display standard localized text
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [state.isDirty]);

  // Convenience dispatchers
  const setTitle = useCallback((title: string) => dispatch({ type: "SET_TITLE", title }), []);
  const setDraftName = useCallback((name: string) => dispatch({ type: "SET_DRAFT_NAME", name }), []);
  const setContentField = useCallback(
    (field: keyof PosterContent, value: string | string[]) =>
      dispatch({ type: "SET_CONTENT_FIELD", field, value }),
    []
  );

  const addDj = useCallback((name: string) => dispatch({ type: "ADD_LINEUP_ITEM", role: "dj", name }), []);
  const removeDj = useCallback((index: number) => dispatch({ type: "REMOVE_LINEUP_ITEM", role: "dj", index }), []);
  const updateDj = useCallback((index: number, name: string) => dispatch({ type: "UPDATE_LINEUP_ITEM", role: "dj", index, name }), []);

  const addHost = useCallback((name: string) => dispatch({ type: "ADD_LINEUP_ITEM", role: "host", name }), []);
  const removeHost = useCallback((index: number) => dispatch({ type: "REMOVE_LINEUP_ITEM", role: "host", index }), []);
  const updateHost = useCallback((index: number, name: string) => dispatch({ type: "UPDATE_LINEUP_ITEM", role: "host", index, name }), []);

  const setPalette = useCallback((paletteId: string) => dispatch({ type: "SET_PALETTE", paletteId }), []);
  const setTypographyPreset = useCallback((presetId: string) => dispatch({ type: "SET_TYPOGRAPHY_PRESET", presetId }), []);
  const setLayoutOption = useCallback((optionId: string) => dispatch({ type: "SET_LAYOUT_OPTION", optionId }), []);
  const setAsset = useCallback(
    (slot: "logo" | "background" | "secondary", assetId: string | null) =>
      dispatch({ type: "SET_ASSET", slot, assetId }),
    []
  );
  const setFocalPoint = useCallback(
    (slot: string, point: FocalPoint) => dispatch({ type: "SET_FOCAL_POINT", slot, point }),
    []
  );
  const setActiveSection = useCallback(
    (sectionId: string | null) => dispatch({ type: "SET_ACTIVE_SECTION", sectionId }),
    []
  );
  const resetToDefaults = useCallback(() => dispatch({ type: "RESET_TO_DEFAULTS" }), []);
  const loadDocument = useCallback((doc: PosterDocument) => dispatch({ type: "LOAD_DOCUMENT", document: doc }), []);
  const markSaved = useCallback(() => dispatch({ type: "MARK_SAVED" }), []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      template,
      setTitle,
      setDraftName,
      setContentField,
      addDj,
      removeDj,
      updateDj,
      addHost,
      removeHost,
      updateHost,
      setPalette,
      setTypographyPreset,
      setLayoutOption,
      setAsset,
      setFocalPoint,
      setActiveSection,
      resetToDefaults,
      loadDocument,
      markSaved,
    }),
    [
      state,
      template,
      setTitle,
      setDraftName,
      setContentField,
      addDj,
      removeDj,
      updateDj,
      addHost,
      removeHost,
      updateHost,
      setPalette,
      setTypographyPreset,
      setLayoutOption,
      setAsset,
      setFocalPoint,
      setActiveSection,
      resetToDefaults,
      loadDocument,
      markSaved,
    ]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
