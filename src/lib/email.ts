import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new Resend(apiKey);
}

export async function sendUnlockedBlueprintEmail({
  to,
  clientName,
  pdfBuffer,
}: {
  to: string;
  clientName: string | null;
  pdfBuffer: Buffer;
}): Promise<void> {
  const resend = getResendClient();
  const greetingName = clientName?.trim() || "there";

  const { error } = await resend.emails.send({
    from: "PulseLogica <business@pulselogica.com>",
    to,
    subject: "Your Operational Blueprint is unlocked",
    text: [
      `Hi ${greetingName},`,
      "",
      "Payment received — your full Operational Blueprint is attached to this email.",
      "",
      "Where your pulse becomes logic.",
      "PulseLogica",
    ].join("\n"),
    attachments: [
      {
        filename: "PulseLogica-Operational-Blueprint.pdf",
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error(`Resend email send failed: ${error.message}`);
  }
}
