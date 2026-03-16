type Locale = "ru" | "en" | "de";

type SendOtpEmailParams = {
  to: string;
  code: string;
  locale: Locale;
  purpose: "login" | "register" | "reset_password";
};

function getTemplate(locale: Locale, code: string, purpose: "login" | "register" | "reset_password") {
  if (purpose === "reset_password") {
    return {
      subject: "MotorBay Passwort zurücksetzen",
      text: [
        "Sie haben eine Anfrage zum Zurucksetzen Ihres Passworts gestellt.",
        "",
        `Ihr Bestatigungscode lautet: ${code}`,
        "",
        "Der Code ist 10 Minuten gultig und kann nur einmal verwendet werden.",
        "Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail bitte.",
        "Aus Sicherheitsgrunden wurde Ihr aktuelles Passwort nicht geandert."
      ].join("\n"),
      html: `<p><strong>Sie haben eine Anfrage zum Zurucksetzen Ihres Passworts gestellt.</strong></p>
<p>Ihr Bestatigungscode lautet:<br/><strong style="font-size:22px; letter-spacing:2px;">${code}</strong></p>
<p>Der Code ist <strong>10 Minuten</strong> gultig und kann nur einmal verwendet werden.</p>
<p>Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail bitte.</p>
<p>Aus Sicherheitsgrunden wurde Ihr aktuelles Passwort nicht geandert.</p>`
    };
  }

  if (locale === "de") {
    const subject =
      purpose === "register"
        ? "MotorBay Registrierungscode"
        : "MotorBay Anmeldecode";
    return {
      subject,
      text: `Ihr Bestätigungscode: ${code}\n\nDer Code ist 10 Minuten gültig.`,
      html: `<p>Ihr Bestätigungscode: <strong style="font-size:20px;">${code}</strong></p><p>Der Code ist 10 Minuten gültig.</p>`
    };
  }

  if (locale === "en") {
    const subject =
      purpose === "register"
        ? "MotorBay registration code"
        : "MotorBay login code";
    return {
      subject,
      text: `Your verification code: ${code}\n\nThe code is valid for 10 minutes.`,
      html: `<p>Your verification code: <strong style="font-size:20px;">${code}</strong></p><p>The code is valid for 10 minutes.</p>`
    };
  }

  const subject =
    purpose === "register"
      ? "Код регистрации MotorBay"
      : "Код входа MotorBay";
  return {
    subject,
    text: `Ваш код подтверждения: ${code}\n\nКод действует 10 минут.`,
    html: `<p>Ваш код подтверждения: <strong style="font-size:20px;">${code}</strong></p><p>Код действует 10 минут.</p>`
  };
}

export async function sendOtpEmail({to, code, locale, purpose}: SendOtpEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[OTP DEV FALLBACK] ${to}: ${code}`);
      return true;
    }

    return false;
  }

  const template = getTemplate(locale, code, purpose);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html
    })
  });

  if (!response.ok) {
    const payload = await response.text();
    console.error("RESEND_SEND_FAILED", response.status, payload);
    return false;
  }

  return true;
}
