"use client";

import {useEffect, useMemo, useRef, useState} from "react";

type TechnicalRow = {
  label: string;
  value: string;
};

type TechnicalSpecsProps = {
  rows: TechnicalRow[];
  showMoreLabel: string;
  showLessLabel: string;
  initialVisibleCount?: number;
};

export default function TechnicalSpecs({
  rows,
  showMoreLabel,
  showLessLabel,
  initialVisibleCount = 6
}: TechnicalSpecsProps) {
  const [expanded, setExpanded] = useState(false);
  const extraRowsRef = useRef<HTMLDivElement | null>(null);
  const [extraHeight, setExtraHeight] = useState(0);

  const baseRows = useMemo(() => rows.slice(0, initialVisibleCount), [rows, initialVisibleCount]);
  const extraRows = useMemo(() => rows.slice(initialVisibleCount), [rows, initialVisibleCount]);

  const hasMoreRows = rows.length > initialVisibleCount;

  useEffect(() => {
    if (!extraRowsRef.current) {
      return;
    }

    setExtraHeight(extraRowsRef.current.scrollHeight);
  }, [extraRows.length, expanded]);

  return (
    <>
      <div className="specs-grid">
        {baseRows.map((row, index) => (
          <div key={`${row.label}-${index}`} className="spec-item">
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>

      {hasMoreRows ? (
        <div
          className="expandable-content"
          style={{
            maxHeight: expanded ? `${extraHeight}px` : "0px",
            opacity: expanded ? 1 : 0,
          }}
          aria-hidden={!expanded}
        >
          <div ref={extraRowsRef} className="specs-grid specs-grid-extra">
            {extraRows.map((row, index) => (
              <div key={`${row.label}-${initialVisibleCount + index}`} className="spec-item">
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {hasMoreRows ? (
        <button
          type="button"
          className="secondary-button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          style={{marginTop: "1rem"}}
        >
          {expanded ? showLessLabel : showMoreLabel}
        </button>
      ) : null}
    </>
  );
}