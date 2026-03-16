"use client";

import {useRouter} from "@/i18n/navigation";
import {useEffect, useMemo, useRef, useState, useTransition} from "react";

type SaveListingButtonProps = {
  carId: number;
  locale: string;
  initialSaved: boolean;
  isAuthenticated: boolean;
  loginHref: string;
  currentPath: string;
  saveLabel: string;
  savedLabel: string;
  loginToSaveLabel: string;
  className?: string;
};

export default function SaveListingButton({
  carId,
  locale,
  initialSaved,
  isAuthenticated,
  loginHref,
  currentPath,
  saveLabel,
  savedLabel,
  loginToSaveLabel,
  className
}: SaveListingButtonProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [showAuthHint, setShowAuthHint] = useState(false);
  const [closingHint, setClosingHint] = useState(false);
  const [isPending, startTransition] = useTransition();
  const hintTimer = useRef<number | undefined>();

  const authTitle = useMemo(() => {
    if (locale === "de") {
      return "Anmeldung erforderlich";
    }
    if (locale === "en") {
      return "Sign in required";
    }
    return "Требуется вход";
  }, [locale]);

  const authActionLabel = useMemo(() => {
    if (locale === "de") {
      return "Anmelden";
    }
    if (locale === "en") {
      return "Sign in";
    }
    return "Войти";
  }, [locale]);

  useEffect(() => {
    if (!showAuthHint) {
      return;
    }

    hintTimer.current = window.setTimeout(() => closeHint(), 2600);
    return () => {
      if (hintTimer.current) {
        window.clearTimeout(hintTimer.current);
      }
    };
  }, [showAuthHint]);

  function closeHint() {
    if (hintTimer.current) {
      window.clearTimeout(hintTimer.current);
    }
    setClosingHint(true);
    window.setTimeout(() => {
      setShowAuthHint(false);
      setClosingHint(false);
    }, 230);
  }

  function handleClick() {
    if (!isAuthenticated) {
      setShowAuthHint(true);
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({carId, locale, pathname: currentPath})
        });

        if (response.status === 401) {
          router.push(loginHref);
          return;
        }

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {saved?: boolean};
        if (typeof data.saved === "boolean") {
          setIsSaved(data.saved);
          router.refresh();
        }
      } catch {
        // swallow on purpose
      }
    });
  }

  return (
    <div className="save-listing-wrap">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`${className || ""}${!isAuthenticated ? " unauth-save-button" : ""}`.trim()}
        aria-disabled={!isAuthenticated}
        aria-label={isAuthenticated ? (isSaved ? savedLabel : saveLabel) : loginToSaveLabel}
        title={isAuthenticated ? (isSaved ? savedLabel : saveLabel) : loginToSaveLabel}
      >
        {isAuthenticated ? (isSaved ? savedLabel : saveLabel) : loginToSaveLabel}
      </button>

      {showAuthHint ? (
        <div
          className={`save-auth-toast${closingHint ? " save-auth-toast-out" : ""}`}
          role="status"
          aria-live="polite"
        >
          <strong>{authTitle}</strong>
          <p>{loginToSaveLabel}</p>
          <button type="button" className="link-button" onClick={() => router.push(loginHref)}>
            {authActionLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
