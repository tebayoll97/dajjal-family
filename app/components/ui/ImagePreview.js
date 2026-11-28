import { Card } from "./Card";
import SvgIcon from "./SvgIcon";

/** Shared image preview surface for original, processed and empty image states. */
export function ImagePreview({ label, src, alt = "", emptyLabel = "Preview will appear here", className = "", imageClassName = "" }) {
  return (
    <Card className={["ui-image-preview", className].filter(Boolean).join(" ")}>
      <div className="ui-image-preview-heading"><strong>{label}</strong></div>
      <div className="ui-image-preview-stage">
        {src ? <img className={["ui-image-preview-image", imageClassName].filter(Boolean).join(" ")} src={src} alt={alt} /> :
          <div className="ui-image-preview-empty" role="status"><SvgIcon name="image" size="var(--df-icon-size-xl)" /><span>{emptyLabel}</span></div>}
      </div>
    </Card>
  );
}
