"use client";

import {useEffect, useMemo, useState, useTransition} from "react";

function getTodayIsoDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const MONTHS: Record<"ru" | "en" | "de", string[]> = {
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  de: ["Januar", "Februar", "Marz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
};

const DAY_PLACEHOLDER: Record<"ru" | "en" | "de", string> = {
  ru: "День",
  en: "Day",
  de: "Tag",
};

const MONTH_PLACEHOLDER: Record<"ru" | "en" | "de", string> = {
  ru: "Месяц",
  en: "Month",
  de: "Monat",
};

const YEAR_PLACEHOLDER: Record<"ru" | "en" | "de", string> = {
  ru: "Год",
  en: "Year",
  de: "Jahr",
};

function getTodayParts() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

function getDaysInMonth(year: number, month: number) {
  if (!year || !month) {
    return 31;
  }
  return new Date(year, month, 0).getDate();
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

type Labels = {
  cta: string;
  title: string;
  from: string;
  to: string;
  date: string;
  message: string;
  messagePlaceholder: string;
  send: string;
  close: string;
  sent: string;
  sendError: string;
  needLogin: string;
  goLogin: string;
};

type InspectionRequestModalProps = {
  locale: string;
  carId: number;
  recipientEmail: string;
  userEmail: string;
  isAuthenticated: boolean;
  loginHref: string;
  labels: Labels;
};

export default function InspectionRequestModal({
  locale,
  carId,
  recipientEmail,
  userEmail,
  isAuthenticated,
  loginHref,
  labels
}: InspectionRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const lang: "ru" | "en" | "de" = locale === "en" || locale === "de" ? locale : "ru";
  const today = useMemo(() => getTodayParts(), []);
  const minDate = useMemo(() => getTodayIsoDate(), []);

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const daysInMonth = useMemo(() => getDaysInMonth(Number(year), Number(month)), [year, month]);
  const days = useMemo(() => Array.from({length: daysInMonth}, (_, index) => index + 1), [daysInMonth]);
  const years = useMemo(() => [today.year, today.year + 1, today.year + 2], [today.year]);
  const months = useMemo(() => MONTHS[lang], [lang]);

  useEffect(() => {
    if (day && month && year) {
      setPreferredDate(`${year}-${pad(Number(month))}-${pad(Number(day))}`);
      return;
    }
    setPreferredDate("");
  }, [day, month, year]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function openModal() {
    setStatus("idle");
    setErrorMessage("");
    setPreferredDate("");
    setDay("");
    setMonth("");
    setYear("");
    setMessage("");
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/inspection-request", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({locale, carId, preferredDate, message})
        });

        if (!response.ok) {
          setStatus("error");
          setErrorMessage(labels.sendError);
          return;
        }

        setStatus("success");
        setPreferredDate("");
        setDay("");
        setMonth("");
        setYear("");
        setMessage("");
      } catch {
        setStatus("error");
        setErrorMessage(labels.sendError);
      }
    });
  }

  return (
    <>
      <button type="button" className="primary-button wide-button inspection-trigger" onClick={openModal}>
        {labels.cta}
      </button>

      {open ? (
        <div className="inspection-modal-overlay" onClick={closeModal} role="presentation">
          <div className="inspection-modal" role="dialog" aria-modal="true" aria-label={labels.title} onClick={(event) => event.stopPropagation()}>
            <div className="inspection-modal-head">
              <h3>{labels.title}</h3>
              <button type="button" className="inspection-close" onClick={closeModal} aria-label={labels.close}>
                x
              </button>
            </div>

            {!isAuthenticated ? (
              <div className="inspection-login-required">
                <p>{labels.needLogin}</p>
                <a href={loginHref} className="primary-button wide-button">
                  {labels.goLogin}
                </a>
              </div>
            ) : (
              <form className="inspection-form" onSubmit={submitRequest}>
                <div className="inspection-meta-field">
                  <strong>{labels.from}:</strong> {userEmail || "-"}
                </div>
                <div className="inspection-meta-field">
                  <strong>{labels.to}:</strong> {recipientEmail}
                </div>

                <label className="inspection-field-label">
                  {labels.date}
                  <input type="hidden" required value={preferredDate} min={minDate} readOnly />
                  <div className="inspection-date-selects">
                    <select required value={day} onChange={(event) => setDay(event.target.value)}>
                      <option value="">{DAY_PLACEHOLDER[lang]}</option>
                      {days.map((itemDay) => {
                        const beforeToday = Number(year) === today.year && Number(month) === today.month && itemDay < today.day;
                        return (
                          <option key={itemDay} value={itemDay} disabled={beforeToday}>
                            {itemDay}
                          </option>
                        );
                      })}
                    </select>

                    <select
                      required
                      value={month}
                      onChange={(event) => {
                        setMonth(event.target.value);
                      }}
                    >
                      <option value="">{MONTH_PLACEHOLDER[lang]}</option>
                      {months.map((monthName, index) => {
                        const monthValue = index + 1;
                        const beforeCurrentMonth = Number(year) === today.year && monthValue < today.month;
                        return (
                          <option key={monthValue} value={monthValue} disabled={beforeCurrentMonth}>
                            {monthName}
                          </option>
                        );
                      })}
                    </select>

                    <select
                      required
                      value={year}
                      onChange={(event) => {
                        setYear(event.target.value);
                      }}
                    >
                      <option value="">{YEAR_PLACEHOLDER[lang]}</option>
                      {years.map((itemYear) => (
                        <option key={itemYear} value={itemYear}>
                          {itemYear}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                <label className="inspection-field-label">
                  {labels.message}
                  <textarea
                    required
                    minLength={5}
                    rows={5}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={labels.messagePlaceholder}
                  />
                </label>

                <button type="submit" className="primary-button wide-button" disabled={isPending}>
                  {labels.send}
                </button>

                {status === "success" ? <p className="form-success">{labels.sent}</p> : null}
                {status === "error" ? <p className="form-error">{errorMessage || labels.sendError}</p> : null}
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}