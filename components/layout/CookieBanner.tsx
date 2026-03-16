"use client";

import {Link} from "@/i18n/navigation";
import {useEffect, useState} from "react";

type CookieBannerProps = {
  title: string;
  text: string;
  accept: string;
  decline: string;
  policy: string;
  settings: string;
  save: string;
  necessaryTitle: string;
  necessaryText: string;
  optionalTitle: string;
  optionalText: string;
};

const STORAGE_KEY = "motorbay_cookie_choice";
const COOKIE_KEY = "motorbay_cookie_choice";
const ONE_YEAR = 60 * 60 * 24 * 365;

type ConsentMode = "accepted" | "essential";

function readStoredConsent(): ConsentMode | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as {mode?: ConsentMode};
    if (parsed.mode === "accepted" || parsed.mode === "essential") {
      return parsed.mode;
    }
  } catch {
    if (raw === "accepted" || raw === "essential") {
      return raw;
    }
  }

  return null;
}

export default function CookieBanner({
  title,
  text,
  accept,
  decline,
  policy,
  settings,
  save,
  necessaryTitle,
  necessaryText,
  optionalTitle,
  optionalText
}: CookieBannerProps) {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [optionalEnabled, setOptionalEnabled] = useState(false);

  function persistChoice(mode: ConsentMode) {
    const payload = JSON.stringify({mode, updatedAt: new Date().toISOString()});
    window.localStorage.setItem(STORAGE_KEY, payload);
    document.cookie = `${COOKIE_KEY}=${mode}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent("motorbay-cookie-consent", {detail: {mode}}));
    setVisible(false);
    setSettingsOpen(false);
  }

  useEffect(() => {
    const savedChoice = readStoredConsent();
    setVisible(!savedChoice);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label={title}>
      <div className="cookie-banner-card">
        <div>
          <strong className="cookie-banner-title">{title}</strong>
          <p className="cookie-banner-text">{text}</p>
        </div>

        <div className="cookie-banner-actions">
          <Link href="/datenschutz" className="secondary-button cookie-banner-link">
            {policy}
          </Link>
          <button type="button" className="secondary-button" onClick={() => setSettingsOpen((v) => !v)}>
            {settings}
          </button>
          <button type="button" className="secondary-button" onClick={() => persistChoice("essential")}>
            {decline}
          </button>
          <button type="button" className="primary-button" onClick={() => persistChoice("accepted")}>
            {accept}
          </button>
        </div>

        {settingsOpen ? (
          <div className="cookie-settings-panel">
            <div className="cookie-setting-item cookie-setting-required">
              <div>
                <strong>{necessaryTitle}</strong>
                <p>{necessaryText}</p>
              </div>
              <input type="checkbox" checked readOnly aria-label={necessaryTitle} />
            </div>

            <div className="cookie-setting-item">
              <div>
                <strong>{optionalTitle}</strong>
                <p>{optionalText}</p>
              </div>
              <input
                type="checkbox"
                checked={optionalEnabled}
                onChange={(event) => setOptionalEnabled(event.target.checked)}
                aria-label={optionalTitle}
              />
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => persistChoice(optionalEnabled ? "accepted" : "essential")}
            >
              {save}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
