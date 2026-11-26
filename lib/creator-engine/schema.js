export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const WIDTH = 1080;
export const HEIGHT = 1350;
export const MIN_CANVAS_DIMENSION = 320;
export const MAX_CANVAS_DIMENSION = 3000;
export const CANVAS_PRESETS = [{id:"square",label:"Square · 1080 × 1080",width:1080,height:1080},{id:"portrait",label:"Portrait · 1080 × 1350",width:1080,height:1350},{id:"landscape",label:"Landscape · 1920 × 1080",width:1920,height:1080},{id:"story",label:"Story · 1080 × 1920",width:1080,height:1920}];
const VERSION = 1
export const TEMPLATES = [
  { id: "crimson-vanguard", label: "templateA", background: "#15101c", accent: "#e13b58", secondary: "#74233c" },
  { id: "azure-protocol", label: "templateB", background: "#101a2a", accent: "#45b7e8", secondary: "#245b91" },
  { id: "midnight-ops", label: "templateC", background: "#111318", accent: "#b8a1ff", secondary: "#4b3a72" },
  { id: "royal-dominion", label: "templateD", background: "#17130e", accent: "#d8b66b", secondary: "#70512b" },
  { id: "neon-phantom", label: "templateE", background: "#160f20", accent: "#d36cff", secondary: "#67368a" },
];
export function makeCreatorId() {
  return globalThis.crypto?.randomUUID?.() || ("layer-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9));
}

export function createIdentityProject(templateId = TEMPLATES[0].id) {
  const template = TEMPLATES.find((item) => item.id === templateId) || TEMPLATES[0];
  return {
    schemaVersion: VERSION, id: makeCreatorId(), name: "Gaming Identity", generator: "gaming-identity",
    templateId: template.id, width: WIDTH, height: HEIGHT, accent: template.accent,
    background: template.background, createdAt: Date.now(), updatedAt: Date.now(),
    layers: [
      { id: makeCreatorId(), type: "shape", name: "background", visible: true, x: 0, y: 0, width: WIDTH, height: HEIGHT, fill: template.background, shape: "background" },
      { id: makeCreatorId(), type: "shape", name: "accent", visible: true, x: 690, y: 90, width: 500, height: 500, fill: template.secondary, shape: "circle", opacity: 0.8 },
      { id: makeCreatorId(), type: "image", name: "avatar", visible: true, x: 345, y: 225, width: 390, height: 390, src: "" },
      { id: makeCreatorId(), type: "text", name: "player", visible: true, x: 540, y: 850, text: "YOUR NAME", fontSize: 88, color: "#ffffff", weight: 800, align: "center" },
      { id: makeCreatorId(), type: "text", name: "role", visible: true, x: 540, y: 930, text: "YOUR GAMING IDENTITY", fontSize: 30, color: "#d8d5e1", weight: 600, align: "center" },
      { id: makeCreatorId(), type: "text", name: "server", visible: true, x: 540, y: 1060, text: "SERVER 278", fontSize: 28, color: template.accent, weight: 700, align: "center" },
      { id: makeCreatorId(), type: "text", name: "alliance", visible: true, x: 540, y: 1120, text: "ALLIANCE", fontSize: 25, color: "#d8d5e1", weight: 600, align: "center" },
    ],
  };
}
export function validIdentityProject(value) {
  const safeColor = (color) => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color);
  return Boolean(value && typeof value === "object" && value.schemaVersion === VERSION && value.generator === "gaming-identity"
    && typeof value.id === "string" && value.id.length <= 120
    && typeof value.name === "string" && value.name.trim().length > 0 && value.name.length <= 100
    && typeof value.templateId === "string" && TEMPLATES.some((template) => template.id === value.templateId)
    && safeColor(value.background) && safeColor(value.accent)
    && Number.isInteger(value.width) && Number.isInteger(value.height) && value.width >= MIN_CANVAS_DIMENSION && value.height >= MIN_CANVAS_DIMENSION && value.width <= MAX_CANVAS_DIMENSION && value.height <= MAX_CANVAS_DIMENSION
    && Array.isArray(value.layers) && value.layers.length > 0 && value.layers.length <= 40
    && new Set(value.layers.map((layer) => layer && layer.id)).size === value.layers.length
    && value.layers.every((layer) => layer && typeof layer.id === "string"
      && ["text", "shape", "image"].includes(layer.type)
      && Number.isFinite(layer.x) && Number.isFinite(layer.y) && Math.abs(layer.x) <= MAX_CANVAS_DIMENSION * 2 && Math.abs(layer.y) <= MAX_CANVAS_DIMENSION * 2 && typeof layer.visible === "boolean"
      && (layer.type !== "image" || (typeof layer.src === "string" && (!layer.src || (new RegExp("^data:image/(png|jpeg|webp);base64,", "i").test(layer.src) && layer.src.length <= 11500000))))
      && (layer.type !== "text" || (typeof layer.text === "string" && layer.text.length <= 120 && Number.isFinite(layer.fontSize) && layer.fontSize >= 1 && layer.fontSize <= 300 && safeColor(layer.color)))
      && (layer.type !== "shape" || (Number.isFinite(layer.width) && Number.isFinite(layer.height) && layer.width > 0 && layer.height > 0 && layer.width <= MAX_CANVAS_DIMENSION * 3 && layer.height <= MAX_CANVAS_DIMENSION * 3 && safeColor(layer.fill)))));
}