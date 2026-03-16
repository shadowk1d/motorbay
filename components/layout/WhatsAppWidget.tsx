"use client";

import {FormEvent, useMemo, useState} from "react";

type WhatsAppWidgetProps = {
  locale: string;
  phone?: string;
};

type Lang = "ru" | "en" | "de";

const START_TEXT: Record<Lang, string> = {
  ru: "Здравствуйте! Подскажите, пожалуйста, по объявлению.",
  en: "Hello! I have a question about a listing.",
  de: "Hallo! Ich habe eine Frage zu einem Inserat.",
};

const LABEL_TEXT: Record<Lang, string> = {
  ru: "Чат в WhatsApp",
  en: "Chat on WhatsApp",
  de: "WhatsApp Chat",
};

const TITLE_TEXT: Record<Lang, string> = {
  ru: "Чат с сотрудником",
  en: "Chat with agent",
  de: "Chat mit Berater",
};

const SUBTITLE_TEXT: Record<Lang, string> = {
  ru: "Обычно отвечаем в течение пары минут",
  en: "We usually reply within a few minutes",
  de: "Antwort in der Regel in wenigen Minuten",
};

const PLACEHOLDER_TEXT: Record<Lang, string> = {
  ru: "Введите сообщение...",
  en: "Type your message...",
  de: "Nachricht eingeben...",
};

const SEND_TEXT: Record<Lang, string> = {
  ru: "Отправить",
  en: "Send",
  de: "Senden",
};

const HELLO_TEXT: Record<Lang, string> = {
  ru: "Здравствуйте! Чем могу помочь?",
  en: "Hello! How can I help you?",
  de: "Hallo! Wie kann ich helfen?",
};

export default function WhatsAppWidget({locale, phone}: WhatsAppWidgetProps) {
  const normalizedPhone = (phone || "").replace(/\D/g, "");

  if (!normalizedPhone) {
    return null;
  }

  const lang: Lang = locale === "en" || locale === "de" ? locale : "ru";
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const initialMessage = useMemo(() => START_TEXT[lang], [lang]);

  function openWhatsApp(messageText: string) {
    const finalText = messageText.trim() || initialMessage;
    const href = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(finalText)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    openWhatsApp(draft);
    setDraft("");
  }

  return (
    <div className="whatsapp-widget-wrap">
      {open ? (
        <section className="whatsapp-chat-panel" aria-label={LABEL_TEXT[lang]}>
          <header className="whatsapp-chat-head">
            <div>
              <strong>{TITLE_TEXT[lang]}</strong>
              <p>{SUBTITLE_TEXT[lang]}</p>
            </div>
            <button
              type="button"
              className="whatsapp-chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div className="whatsapp-chat-body">
            <div className="whatsapp-msg whatsapp-msg-agent">{HELLO_TEXT[lang]}</div>
          </div>

          <form className="whatsapp-chat-form" onSubmit={onSubmit}>
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={PLACEHOLDER_TEXT[lang]}
              maxLength={500}
            />
            <button type="submit">{SEND_TEXT[lang]}</button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        aria-label={LABEL_TEXT[lang]}
        className="whatsapp-widget"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="whatsapp-widget-badge" aria-hidden="true">
          WA
        </span>
        <span className="whatsapp-widget-text">WhatsApp</span>
      </button>
    </div>
  );
}
