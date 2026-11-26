"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { Badge, Button, Card, ConfirmDialog, PageHeader, SvgIcon, TextField } from "@/app/components/ui";
import "./creator-lab.css";
import { TEMPLATES, WIDTH, HEIGHT, MAX_IMAGE_BYTES, createIdentityProject as createProject, makeCreatorId as makeId, validIdentityProject as validProject } from "@/lib/creator-engine/schema";
import { putProject, listProjects, deleteProject } from "@/lib/creator-engine/projectStore";
import { drawProject, renderBrandedPng, downloadBlob } from "@/lib/creator-engine/canvasRenderer";

const COPY = {
  id: {
    eyebrow: "DF CREATOR LAB · GAMING IDENTITY", title: "Gaming Identity Creator",
    description: "Bangun identitas gaming dengan template, layer, dan ekspor lokal. Seluruh proses berjalan di perangkatmu — tanpa AI.",
    newProject: "Proyek baru", template: "Template", editor: "Editor", layers: "Layer", properties: "Properti",
    player: "Nama pemain", role: "Role / tagline", server: "Server", alliance: "Aliansi",
    chooseAvatar: "Unggah avatar", removeAvatar: "Hapus avatar", addText: "Tambah teks", addShape: "Tambah aksen",
    hide: "Sembunyikan", show: "Tampilkan", up: "Naikkan", down: "Turunkan", remove: "Hapus",
    undo: "Urungkan", redo: "Ulangi", export: "Ekspor PNG", save: "Simpan proyek", saved: "Tersimpan di perangkat", saving: "Menyimpan…",
    projects: "Proyek tersimpan", noProjects: "Belum ada proyek tersimpan. Perubahan akan disimpan otomatis di perangkat ini.",
    open: "Buka", delete: "Hapus", exportProject: "Backup JSON", importProject: "Impor JSON",
    uploadHint: "PNG, JPG, atau WebP · Maks. 8 MB · Diproses lokal", canvasHint: "Pratinjau kanvas · 1080 × 1350 px",
    selected: "Layer dipilih", textValue: "Isi teks", fontSize: "Ukuran teks", x: "Posisi horizontal", y: "Posisi vertikal",
    emptySelection: "Pilih layer untuk mengubah propertinya.", exportReady: "PNG berhasil dibuat.",
    saveError: "Proyek gagal disimpan. Periksa ruang penyimpanan browser.", invalidImage: "Pilih gambar PNG, JPG, atau WebP yang valid hingga 8 MB.",
    invalidProject: "File proyek tidak valid atau versinya tidak didukung.", importSuccess: "Proyek berhasil diimpor.", importError: "Proyek tidak dapat diproses.",
    imageLayer: "Avatar", titleLayer: "Nama pemain", roleLayer: "Role", serverLayer: "Server", allianceLayer: "Aliansi",
    accentLayer: "Aksen", backgroundLayer: "Latar", templateA: "Crimson Vanguard", templateB: "Azure Protocol", templateC: "Midnight Ops",
    projectName: "Nama proyek", noAI: "NO-AI WORKFLOW", help: "Pilih template, unggah avatar, ubah identitas, lalu atur layer.",
    confirmDelete: "Hapus proyek ini dari perangkat?",
  },
  en: {
    eyebrow: "DF CREATOR LAB · GAMING IDENTITY", title: "Gaming Identity Creator",
    description: "Build gaming identity artwork with templates, editable layers, and local export. Your workflow runs on-device — no AI.",
    newProject: "New project", template: "Template", editor: "Editor", layers: "Layers", properties: "Properties",
    player: "Player name", role: "Role / tagline", server: "Server", alliance: "Alliance",
    chooseAvatar: "Upload avatar", removeAvatar: "Remove avatar", addText: "Add text", addShape: "Add accent",
    hide: "Hide", show: "Show", up: "Move up", down: "Move down", remove: "Remove",
    undo: "Undo", redo: "Redo", export: "Export PNG", save: "Save project", saved: "Saved on this device", saving: "Saving…",
    projects: "Saved projects", noProjects: "No saved projects yet. Changes are saved automatically on this device.",
    open: "Open", delete: "Delete", exportProject: "JSON backup", importProject: "Import JSON",
    uploadHint: "PNG, JPG, or WebP · Max 8 MB · Processed locally", canvasHint: "Canvas preview · 1080 × 1350 px",
    selected: "Selected layer", textValue: "Text content", fontSize: "Font size", x: "Horizontal position", y: "Vertical position",
    emptySelection: "Select a layer to edit its properties.", exportReady: "PNG created successfully.",
    saveError: "Could not save the project. Check browser storage space.", invalidImage: "Choose a valid PNG, JPG, or WebP image up to 8 MB.",
    invalidProject: "The project file is invalid or uses an unsupported version.", importSuccess: "Project imported successfully.", importError: "The project could not be processed.",
    imageLayer: "Avatar", titleLayer: "Player name", roleLayer: "Role", serverLayer: "Server", allianceLayer: "Alliance",
    accentLayer: "Accent", backgroundLayer: "Background", templateA: "Crimson Vanguard", templateB: "Azure Protocol", templateC: "Midnight Ops",
    projectName: "Project name", noAI: "NO-AI WORKFLOW", help: "Choose a template, upload an avatar, edit your identity, then arrange layers.",
    confirmDelete: "Delete this project from this device?",
  },
};















export default function CreatorLabClient() {
  const { language } = useLanguage();
  const t = COPY[language] || COPY.id;
  const [project, setProject] = useState(() => createProject());
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [showProjects, setShowProjects] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [mode, setMode] = useState("quick");
  const [canvasWidth, setCanvasWidth] = useState(WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(HEIGHT);
  const canvasRef = useRef(null);
  const avatarInputRef = useRef(null);
  const importInputRef = useRef(null);
  const projectRef = useRef(project);
  const saveTimer = useRef(null);
  const textRef = useRef(t);

  useEffect(() => { projectRef.current = project; }, [project]);
  useEffect(() => { textRef.current = t; }, [t]);
  const refreshProjects = useCallback(async () => {
    try { setProjects(await listProjects()); } catch { setProjects([]); }
  }, []);
  useEffect(() => { refreshProjects(); }, [refreshProjects]);
  useEffect(() => {
    let active = true;
    drawProject(canvasRef.current, project).catch(() => { if (active) setNotice(textRef.current.importError); });
    return () => { active = false; };
  }, [project]);

  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = window.setTimeout(async () => {
      try {
        await putProject(project);
        setSaveError("");
        setSaving(false);
        refreshProjects();
      } catch {
        setSaveError(textRef.current.saveError);
        setSaving(false);
      }
    }, 700);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
  }, [project, refreshProjects]);

  const selectedLayer = useMemo(() => project.layers.find((layer) => layer.id === selectedId) || null, [project.layers, selectedId]);
  const commit = useCallback((next) => {
    const current = projectRef.current;
    const value = typeof next === "function" ? next(current) : next;
    const updated = { ...value, updatedAt: Date.now() };
    setPast((items) => [...items.slice(-39), current]);
    setFuture([]);
    projectRef.current = updated;
    setProject(updated);
    setNotice("");
  }, []);

  const updateLayer = (id, patch) => commit((current) => ({ ...current, layers: current.layers.map((layer) => layer.id === id ? { ...layer, ...patch } : layer) }));
  const moveLayer = (id, direction) => commit((current) => {
    const index = current.layers.findIndex((layer) => layer.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= current.layers.length) return current;
    const layers = [...current.layers];
    [layers[index], layers[target]] = [layers[target], layers[index]];
    return { ...current, layers };
  });

  const undo = () => {
    if (!past.length) return;
    setFuture((items) => [project, ...items]);
    setPast((items) => items.slice(0, -1));
    projectRef.current = past[past.length - 1];
    setProject(past[past.length - 1]);
  };
  const redo = () => {
    if (!future.length) return;
    setPast((items) => [...items, project]);
    projectRef.current = future[0];
    setProject(future[0]);
    setFuture((items) => items.slice(1));
  };
  const newProject = () => {
    setPast((items) => [...items.slice(-39), project]);
    setFuture([]);
    const next = createProject();
    projectRef.current = next;
    setProject(next);
    setSelectedId("");
  };

  const changeTemplate = (templateId) => {
    const template = TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;
    commit((current) => ({
      ...current, templateId, background: template.background, accent: template.accent,
      layers: current.layers.map((layer) => layer.name === "background" ? { ...layer, fill: template.background } : layer.name === "accent" ? { ...layer, fill: template.secondary } : layer),
    }));
  };

  const chooseAvatar = async (file) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      setNotice(t.invalidImage);
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      if (bitmap.width > 12000 || bitmap.height > 12000) {
        bitmap.close();
        setNotice(t.invalidImage);
        return;
      }
      bitmap.close();
      const reader = new FileReader();
      reader.onload = () => {
        const imageLayer = projectRef.current.layers.find((layer) => layer.type === "image");
        if (imageLayer) updateLayer(imageLayer.id, { src: String(reader.result) });
      };
      reader.onerror = () => setNotice(t.invalidImage);
      reader.readAsDataURL(file);
    } catch { setNotice(t.invalidImage); }
  };

  const addText = () => {
    const layer = { id: makeId(), type: "text", name: "custom", visible: true, x: 540, y: 1250, text: "NEW TEXT", fontSize: 32, color: "#ffffff", weight: 700, align: "center" };
    commit((current) => ({ ...current, layers: [...current.layers, layer] }));
    setSelectedId(layer.id);
  };
  const addShape = () => {
    const layer = { id: makeId(), type: "shape", name: "accent", visible: true, x: 90, y: 90, width: 900, height: 12, fill: project.accent, shape: "line" };
    commit((current) => ({ ...current, layers: [...current.layers, layer] }));
    setSelectedId(layer.id);
  };

  const exportPng = async () => {
    try {
      const blob = await renderBrandedPng(project);
      if (!blob) throw new Error("PNG encoding failed");
      downloadBlob(blob, (project.name || "gaming-identity").trim().replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() + ".png");
      setNotice(t.exportReady);
    } catch { setNotice(t.importError); }
    finally { setConfirm(null); }
  };
  const backupProject = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    downloadBlob(blob, project.id + ".json");
  };
  const importProject = async (file) => {
    if (!file || file.size > 12 * 1024 * 1024) return setNotice(t.invalidProject);
    try {
      const value = JSON.parse(await file.text());
      if (!validProject(value)) throw new Error("Invalid project");
      const imported = { ...value, id: makeId(), createdAt: Date.now(), updatedAt: Date.now() };
      setPast((items) => [...items.slice(-39), project]);
      setFuture([]);
      projectRef.current = imported;
      setProject(imported);
      setSelectedId("");
      setNotice(t.importSuccess);
    } catch { setNotice(t.importError); }
  };
  const openProject = (value) => {
    if (!validProject(value)) return;
    setPast((items) => [...items.slice(-39), project]);
    setFuture([]);
    projectRef.current = value;
    setProject(value);
    setSelectedId("");
    setShowProjects(false);
  };
  const removeProject = async (id) => {
    try { await deleteProject(id); await refreshProjects(); setConfirm(null); } catch { setSaveError(t.saveError); }
  };

  const labelFor = (layer) => t[layer.name === "player" ? "titleLayer" : layer.name === "role" ? "roleLayer" : layer.name === "server" ? "serverLayer" : layer.name === "alliance" ? "allianceLayer" : layer.name === "avatar" ? "imageLayer" : layer.name === "background" ? "backgroundLayer" : "accentLayer"];

  return (
    <main className="ui-page df-creator-page">
      <PageHeader eyebrow={t.eyebrow} title={t.title} description={t.description}
        actions={<div className="ui-cluster df-creator-header-actions"><Badge variant="info">{t.noAI}</Badge><Button size="sm" variant="secondary" onClick={() => setConfirm({ kind: "new" })}><SvgIcon name="file-plus" size={16}/>{t.newProject}</Button></div>} />
      <div className="df-creator-modebar"><button type="button" aria-pressed={mode === "quick"} onClick={() => setMode("quick")}>Quick Creator</button><button type="button" aria-pressed={mode === "advanced"} onClick={() => setMode("advanced")}>Advanced Editor</button></div>
      <div className="df-creator-toolbar">
        <div className="df-creator-toolbar-group">
          <Button size="sm" variant="secondary" onClick={undo} disabled={!past.length}><SvgIcon name="undo" size={16}/>{t.undo}</Button>
          <Button size="sm" variant="secondary" onClick={redo} disabled={!future.length}><SvgIcon name="redo" size={16}/>{t.redo}</Button>
          <span className="df-creator-save-status" role="status">{saving ? t.saving : saveError || t.saved}</span>
        </div>
        <div className="df-creator-toolbar-group">
          <Button size="sm" variant="secondary" onClick={backupProject}><SvgIcon name="download" size={16}/>{t.exportProject}</Button>
          <Button size="sm" variant="secondary" onClick={() => importInputRef.current?.click()}><SvgIcon name="upload" size={16}/>{t.importProject}</Button>
          <Button size="sm" onClick={() => setConfirm({ kind: "export" })}><SvgIcon name="image" size={16}/>{t.export}</Button>
        </div>
      </div>

      <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(event) => { chooseAvatar(event.target.files?.[0]); event.target.value = ""; }} />
      <input ref={importInputRef} type="file" accept="application/json,.json" hidden onChange={(event) => { importProject(event.target.files?.[0]); event.target.value = ""; }} />

      <div className="df-creator-workspace">
        <section className="df-creator-stage-column" aria-label={t.editor}>
          <Card className="df-creator-stage-card">
            <div className="df-creator-stage-heading"><strong>{t.editor}</strong><span>{t.canvasHint} · {project.width} × {project.height}</span></div>
            <div className="df-creator-canvas-wrap"><canvas ref={canvasRef} className="df-creator-canvas" aria-label={t.canvasHint} /></div>
            <p className="ui-caption">{mode === "quick" ? t.help : "Advanced Editor: gunakan daftar layer dan properti untuk menyusun desain."}</p>
          </Card>
          <Card className="df-creator-template-card">
            <div className="df-creator-section-heading"><strong>{t.template}</strong><Badge>{project.templateId}</Badge></div>
            <div className="df-creator-template-grid">
              {TEMPLATES.map((template) => <button type="button" key={template.id} className="df-creator-template" data-active={project.templateId === template.id} onClick={() => changeTemplate(template.id)}>
                <span style={{ background: template.background }}><i style={{ background: template.accent }} /></span><strong>{t[template.label]}</strong>
              </button>)}
            </div>
          </Card>
        </section>

        <aside className="df-creator-editor-column">
          <Card className="df-creator-editor-card">
            <div className="df-creator-section-heading"><strong>{mode === "quick" ? "Quick Creator" : t.properties}</strong><span>{t.selected}</span></div>
            <div className="df-creator-form-grid">
              <TextField label={t.projectName} value={project.name} maxLength={100} onChange={(event) => commit((current) => ({ ...current, name: event.target.value }))} />
              <TextField label={t.player} value={project.layers.find((layer) => layer.name === "player")?.text || ""} maxLength={32} onChange={(event) => { const layer = project.layers.find((item) => item.name === "player"); if (layer) updateLayer(layer.id, { text: event.target.value }); }} />
              <TextField label={t.role} value={project.layers.find((layer) => layer.name === "role")?.text || ""} maxLength={48} onChange={(event) => { const layer = project.layers.find((item) => item.name === "role"); if (layer) updateLayer(layer.id, { text: event.target.value }); }} />
              <div className="df-creator-form-row">
                <TextField label={t.server} value={project.layers.find((layer) => layer.name === "server")?.text || ""} maxLength={24} onChange={(event) => { const layer = project.layers.find((item) => item.name === "server"); if (layer) updateLayer(layer.id, { text: event.target.value }); }} />
                <TextField label={t.alliance} value={project.layers.find((layer) => layer.name === "alliance")?.text || ""} maxLength={24} onChange={(event) => { const layer = project.layers.find((item) => item.name === "alliance"); if (layer) updateLayer(layer.id, { text: event.target.value }); }} />
              </div>
            </div>
            <div className="df-creator-action-grid">
              <Button size="sm" variant="secondary" onClick={() => avatarInputRef.current?.click()}><SvgIcon name="image" size={16}/>{t.chooseAvatar}</Button>
              <Button size="sm" variant="secondary" onClick={addText}><SvgIcon name="plus" size={16}/>{t.addText}</Button>
              <Button size="sm" variant="secondary" onClick={addShape}><SvgIcon name="layers" size={16}/>{t.addShape}</Button>
            </div>
            {project.layers.some((layer) => layer.type === "image" && layer.src) ? <Button size="sm" variant="ghost" onClick={() => { const layer = project.layers.find((item) => item.type === "image"); if (layer) updateLayer(layer.id, { src: "" }); }}>{t.removeAvatar}</Button> : <p className="ui-caption">{t.uploadHint}</p>}
            {selectedLayer ? <div className="df-creator-selected">
              <strong>{labelFor(selectedLayer)}</strong>
              {selectedLayer.type === "text" ? <>
                <TextField label={t.textValue} value={selectedLayer.text || ""} maxLength={120} onChange={(event) => updateLayer(selectedLayer.id, { text: event.target.value })} />
                <label className="df-creator-range"><span>{t.fontSize}</span><input type="range" min="16" max="120" value={selectedLayer.fontSize || 32} onChange={(event) => updateLayer(selectedLayer.id, { fontSize: Number(event.target.value) })}/></label>
              </> : <p className="ui-caption">{selectedLayer.type === "image" ? t.imageLayer : t.accentLayer}</p>}
              <label className="df-creator-range"><span>{t.x}</span><input type="range" min="0" max={WIDTH} value={selectedLayer.x} onChange={(event) => updateLayer(selectedLayer.id, { x: Number(event.target.value) })}/></label>
              <label className="df-creator-range"><span>{t.y}</span><input type="range" min="0" max={HEIGHT} value={selectedLayer.y} onChange={(event) => updateLayer(selectedLayer.id, { y: Number(event.target.value) })}/></label>
            </div> : <p className="ui-caption">{t.emptySelection}</p>}
          </Card>

          {mode === "advanced" ? <Card className="df-creator-layers-card">
            <div className="df-creator-section-heading"><strong>{t.layers}</strong><span>{project.layers.length}</span></div>
            <div className="df-creator-layer-list">
              {[...project.layers].reverse().map((layer) => <div className="df-creator-layer" key={layer.id} data-selected={selectedId === layer.id}>
                <button type="button" className="df-creator-layer-select" onClick={() => setSelectedId(layer.id)}><span>{labelFor(layer)}</span><small>{layer.type}</small></button>
                <Button size="sm" variant="ghost" onClick={() => updateLayer(layer.id, { visible: !layer.visible })} aria-label={layer.visible ? t.hide : t.show}><SvgIcon name={layer.visible ? "eye" : "eye-off"} size={16}/></Button>
                <Button size="sm" variant="ghost" onClick={() => moveLayer(layer.id, -1)} aria-label={t.up}><SvgIcon name="arrow-up" size={16}/></Button>
                <Button size="sm" variant="ghost" onClick={() => moveLayer(layer.id, 1)} aria-label={t.down}><SvgIcon name="arrow-down" size={16}/></Button>
                <Button size="sm" variant="ghost" onClick={() => commit((current) => ({ ...current, layers: current.layers.filter((item) => item.id !== layer.id) }))} aria-label={t.remove}><SvgIcon name="trash" size={16}/></Button>
              </div>)}
            </div>
          </Card> : null}
        </aside>
      </div>

      <Card className="df-creator-projects-card">
        <button type="button" className="df-creator-projects-toggle" aria-expanded={showProjects} onClick={() => setShowProjects((value) => !value)}><strong>{t.projects} ({projects.length})</strong><SvgIcon name="chevron-down" size={18}/></button>
        {showProjects ? projects.length ? <div className="df-creator-project-list">
          {projects.map((item) => <div className="df-creator-project-row" key={item.id}>
            <div><strong>{item.name}</strong><small>{new Date(item.updatedAt).toLocaleString(language === "en" ? "en-US" : "id-ID")}</small></div>
            <Button size="sm" variant="secondary" onClick={() => openProject(item)}>{t.open}</Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirm({ kind: "delete", id: item.id })} aria-label={t.delete}><SvgIcon name="trash" size={16}/></Button>
          </div>)}
        </div> : <p className="ui-caption">{t.noProjects}</p> : null}
      </Card>
      {notice ? <p className="df-creator-notice" role="status">{notice}</p> : null}
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => { if (confirm?.kind === "export") exportPng(); else if (confirm?.kind === "delete") removeProject(confirm.id); else if (confirm?.kind === "new") { newProject(); setConfirm(null); } }} title={confirm?.kind === "export" ? "Export PNG?" : confirm?.kind === "delete" ? "Delete project?" : "Create new project?"} description={confirm?.kind === "export" ? "PNG akan diberi watermark dajjalfamily.com secara otomatis di pojok kanan bawah." : confirm?.kind === "delete" ? t.confirmDelete : "Buat proyek baru? Proyek saat ini tetap tersimpan di perangkat."} confirmLabel={confirm?.kind === "export" ? "Yes, Export" : confirm?.kind === "delete" ? "Yes, Delete" : "Yes, Continue"} cancelLabel="Cancel" confirmVariant={confirm?.kind === "delete" ? "danger" : "primary"} />
    </main>
  );
}
