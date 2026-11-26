function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve(null);
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
export async function drawProject(canvas, project) {
  if (!canvas || !project) return;
  const context = canvas.getContext("2d");
  if (!context) return;
  canvas.width = project.width;
  canvas.height = project.height;
  context.clearRect(0, 0, project.width, project.height);
  for (const layer of project.layers) {
    if (!layer.visible) continue;
    context.save();
    context.globalAlpha = Number.isFinite(layer.opacity) ? Math.max(0, Math.min(1, layer.opacity)) : 1;
    if (layer.type === "shape") {
      context.fillStyle = layer.fill || project.accent;
      if (layer.shape === "background") {
        context.fillRect(0, 0, project.width, project.height);
      } else if (layer.shape === "circle") {
        context.beginPath();
        context.arc(layer.x + layer.width / 2, layer.y + layer.height / 2, Math.min(layer.width, layer.height) / 2, 0, Math.PI * 2);
        context.fill();
      } else if (layer.shape === "line") {
        context.fillRect(layer.x, layer.y, Math.max(2, layer.width), Math.max(2, layer.height));
      } else if (layer.shape !== "background") {
        context.fillRect(layer.x, layer.y, layer.width, layer.height);
      }
    } else if (layer.type === "image" && layer.src) {
      const image = await loadImage(layer.src);
      const diameter = Math.min(layer.width, layer.height);
      context.beginPath();
      context.arc(layer.x + layer.width / 2, layer.y + layer.height / 2, diameter / 2, 0, Math.PI * 2);
      context.clip();
      const scale = Math.max(layer.width / image.width, layer.height / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      context.drawImage(image, layer.x + (layer.width - drawWidth) / 2, layer.y + (layer.height - drawHeight) / 2, drawWidth, drawHeight);
      context.restore();
      context.save();
      context.globalAlpha = 1;
      context.strokeStyle = project.accent;
      context.lineWidth = 14;
      context.beginPath();
      context.arc(layer.x + layer.width / 2, layer.y + layer.height / 2, diameter / 2 + 4, 0, Math.PI * 2);
      context.stroke();
    } else if (layer.type === "text") {
      context.fillStyle = layer.color || "#ffffff";
      context.font = (layer.weight || 600) + " " + (layer.fontSize || 32) + "px system-ui, sans-serif";
      context.textAlign = layer.align || "left";
      context.textBaseline = "middle";
      context.shadowColor = "rgba(0,0,0,.28)";
      context.shadowBlur = 8;
      context.fillText(String(layer.text || "").slice(0, 120), layer.x, layer.y, 940);
    }
    context.restore();
  }
}
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}