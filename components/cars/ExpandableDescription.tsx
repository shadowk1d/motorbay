"use client";

import {useEffect, useMemo, useRef, useState} from "react";

type ExpandableDescriptionProps = {
  text: string;
  showMoreLabel: string;
  showLessLabel: string;
  previewLength?: number;
};

function getPreviewCutIndex(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text.length;
  }

  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  const normalized = (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim();
  return normalized.length;
}

export default function ExpandableDescription({
  text,
  showMoreLabel,
  showLessLabel,
  previewLength = 320
}: ExpandableDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const extraRef = useRef<HTMLDivElement | null>(null);
  const [extraHeight, setExtraHeight] = useState(0);

  const cutIndex = useMemo(() => getPreviewCutIndex(text, previewLength), [text, previewLength]);
  const previewText = useMemo(() => text.slice(0, cutIndex), [text, cutIndex]);
  const extraText = useMemo(() => text.slice(cutIndex).trimStart(), [text, cutIndex]);
  const canExpand = extraText.length > 0;

  useEffect(() => {
    if (!extraRef.current) {
      return;
    }

    setExtraHeight(extraRef.current.scrollHeight);
  }, [extraText, expanded]);

  return (
    <>
      <p>
        {previewText}
        {!expanded && canExpand ? "..." : null}
      </p>

      {canExpand ? (
        <div
          className="expandable-content"
          style={{
            maxHeight: expanded ? `${extraHeight}px` : "0px",
            opacity: expanded ? 1 : 0,
          }}
          aria-hidden={!expanded}
        >
          <div ref={extraRef}>
            <p>{extraText}</p>
          </div>
        </div>
      ) : null}

      {canExpand ? (
        <button
          type="button"
          className="secondary-button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          style={{marginTop: "0.75rem"}}
        >
          {expanded ? showLessLabel : showMoreLabel}
        </button>
      ) : null}
    </>
  );
}