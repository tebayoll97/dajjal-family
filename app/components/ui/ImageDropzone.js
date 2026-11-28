"use client";

import { useRef, useState } from "react";
import { Button } from "./Button";
import SvgIcon from "./SvgIcon";

/** Reusable accessible local-file picker with keyboard and drag/drop support. */
export function ImageDropzone({ accept = "image/*", label, description, actionLabel, onFiles, disabled = false, multiple = false, className = "" }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const receive = (files) => {
    const selected = Array.from(files || []);
    if (selected.length) onFiles?.(multiple ? selected : selected.slice(0, 1));
  };
  return (
    <div className={["ui-file-dropzone", dragging ? "is-dragging" : "", disabled ? "is-disabled" : "", className].filter(Boolean).join(" ")}
      onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
      onDrop={(event) => { event.preventDefault(); setDragging(false); if (!disabled) receive(event.dataTransfer.files); }}>
      <input ref={inputRef} className="ui-file-dropzone-input" type="file" accept={accept} multiple={multiple} disabled={disabled}
        onChange={(event) => { receive(event.target.files); event.target.value = ""; }} />
      <span className="ui-file-dropzone-icon" aria-hidden="true"><SvgIcon name="upload" size="var(--df-icon-size-xl)" /></span>
      <strong className="ui-file-dropzone-title">{label}</strong>
      {description ? <span className="ui-file-dropzone-description">{description}</span> : null}
      <Button type="button" onClick={() => inputRef.current?.click()} disabled={disabled}><SvgIcon name="image" />{actionLabel}</Button>
    </div>
  );
}
