type Locale = "ru" | "en" | "de";

type InspectionCar = {
  id: number;
  brand: string;
  model: string;
  variant: string | null;
};

type SendInspectionEmailParams = {
  to: string;
  locale: Locale;
  userEmail: string;
  preferredDate: string;
  message: string;
  car: InspectionCar;
};

function buildMail(locale: Locale, params: SendInspectionEmailParams) {
  const carTitle = `${params.car.brand} ${params.car.model}${params.car.variant ? ` ${params.car.variant}` : ""}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const carUrl = siteUrl ? `${siteUrl.replace(/\/$/, "")}/${locale}/cars/${params.car.id}` : "";

  if (locale === "de") {
    return {
      subject: `Besichtigungsanfrage: ${carTitle}`,
      text: [
        "Neue Besichtigungsanfrage von der Website.",
        `Fahrzeug: ${carTitle} (#${params.car.id})`,
        `E-Mail des Kunden: ${params.userEmail}`,
        `Wunschdatum: ${params.preferredDate}`,
        "Nachricht:",
        params.message,
        carUrl ? `Link: ${carUrl}` : ""
      ]
        .filter(Boolean)
        .join("\n"),
      html: `<p><strong>Neue Besichtigungsanfrage von der Website.</strong></p>
<p><strong>Fahrzeug:</strong> ${carTitle} (#${params.car.id})</p>
<p><strong>E-Mail des Kunden:</strong> ${params.userEmail}</p>
<p><strong>Wunschdatum:</strong> ${params.preferredDate}</p>
<p><strong>Nachricht:</strong><br/>${params.message.replace(/\n/g, "<br/>")}</p>
${carUrl ? `<p><a href="${carUrl}">Anzeige öffnen</a></p>` : ""}`
    };
  }

  if (locale === "en") {
    return {
      subject: `Inspection request: ${carTitle}`,
      text: [
        "New inspection request from the website.",
        `Car: ${carTitle} (#${params.car.id})`,
        `Customer email: ${params.userEmail}`,
        `Preferred date: ${params.preferredDate}`,
        "Message:",
        params.message,
        carUrl ? `Listing: ${carUrl}` : ""
      ]
        .filter(Boolean)
        .join("\n"),
      html: `<p><strong>New inspection request from the website.</strong></p>
<p><strong>Car:</strong> ${carTitle} (#${params.car.id})</p>
<p><strong>Customer email:</strong> ${params.userEmail}</p>
<p><strong>Preferred date:</strong> ${params.preferredDate}</p>
<p><strong>Message:</strong><br/>${params.message.replace(/\n/g, "<br/>")}</p>
${carUrl ? `<p><a href="${carUrl}">Open listing</a></p>` : ""}`
    };
  }

  return {
    subject: `Запись на осмотр: ${carTitle}`,
    text: [
      "Новая заявка на осмотр с сайта.",
      `Автомобиль: ${carTitle} (#${params.car.id})`,
      `Email клиента: ${params.userEmail}`,
      `Желаемая дата: ${params.preferredDate}`,
      "Сообщение:",
      params.message,
      carUrl ? `Ссылка: ${carUrl}` : ""
    ]
      .filter(Boolean)
      .join("\n"),
    html: `<p><strong>Новая заявка на осмотр с сайта.</strong></p>
<p><strong>Автомобиль:</strong> ${carTitle} (#${params.car.id})</p>
<p><strong>Email клиента:</strong> ${params.userEmail}</p>
<p><strong>Желаемая дата:</strong> ${params.preferredDate}</p>
<p><strong>Сообщение:</strong><br/>${params.message.replace(/\n/g, "<br/>")}</p>
${carUrl ? `<p><a href="${carUrl}">Открыть объявление</a></p>` : ""}`
  };
}

export async function sendInspectionRequestEmail(params: SendInspectionEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[INSPECTION REQUEST DEV FALLBACK]", {
        to: params.to,
        fromUser: params.userEmail,
        date: params.preferredDate,
        carId: params.car.id,
        message: params.message
      });
      return true;
    }

    return false;
  }

  const mail = buildMail(params.locale, params);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      reply_to: params.userEmail
    })
  });

  if (!response.ok) {
    const payload = await response.text();
    console.error("INSPECTION_REQUEST_SEND_FAILED", response.status, payload);
    return false;
  }

  return true;
}