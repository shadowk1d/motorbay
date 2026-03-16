"use client";

import {useEffect, useRef, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

type LogoutToastProps = {
  title: string;
  text: string;
  close: string;
};

export default function LogoutToast({title, text, close}: LogoutToastProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (searchParams.get("logout") === "1") {
      setVisible(true);
      setClosing(false);
      autoTimer.current = window.setTimeout(() => dismiss(), 4200);
    }
    return () => {
      if (autoTimer.current) {
        clearTimeout(autoTimer.current);
      }
    };
  }, [searchParams]);

  function dismiss() {
    if (autoTimer.current) {
      clearTimeout(autoTimer.current);
    }
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("logout");
      const nextUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
      router.replace(nextUrl, {scroll: false});
    }, 300);
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`logout-toast${closing ? " logout-toast-out" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="logout-toast-title">{title}</div>
      <p className="logout-toast-text">{text}</p>
      <button type="button" className="secondary-button" onClick={dismiss}>
        {close}
      </button>
    </div>
  );
}
