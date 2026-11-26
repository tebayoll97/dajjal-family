const DB_NAME = "df-creator-engine";
const STORE = "projects";
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_PROJECTS = 5;
export const WIDTH = 1080;
export const HEIGHT = 1350;
const VERSION = 1
export const TEMPLATES = [
  { id: "crimson-vanguard", label: "templateA", background: "#15101c", accent: "#e13b58", secondary: "#74233c" },
  { id: "azure-protocol", label: "templateB", background: "#101a2a", accent: "#45b7e8", secondary: "#245b91" },
  { id: "midnight-ops", label: "templateC", background: "#111318", accent: "#b8a1ff", secondary: "#4b3a72" },
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
  return Boolean(value && value.schemaVersion === VERSION && value.generator === "gaming-identity"
    && typeof value.name === "string" && value.name.length <= 100
    && value.width === WIDTH && value.height === HEIGHT
    && Array.isArray(value.layers) && value.layers.length > 0 && value.layers.length <= 40
    && new Set(value.layers.map((layer) => layer && layer.id)).size === value.layers.length
    && value.layers.every((layer) => layer && typeof layer.id === "string"
      && ["text", "shape", "image"].includes(layer.type)
      && Number.isFinite(layer.x) && Number.isFinite(layer.y) && typeof layer.visible === "boolean"
      && (layer.type !== "image" || (typeof layer.src === "string" && (!layer.src || (new RegExp("^data:image/(png|jpeg|webp);base64,", "i").test(layer.src) && layer.src.length <= 11500000))))
      && (layer.type !== "text" || (typeof layer.text === "string" && layer.text.length <= 120))
      && (layer.type !== "shape" || (Number.isFinite(layer.width) && Number.isFinite(layer.height)))));
}