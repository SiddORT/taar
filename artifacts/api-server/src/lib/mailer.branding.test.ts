import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendMail, createTransport } = vi.hoisted(() => {
  const sendMail = vi.fn(async (_message: any) => ({ messageId: "local-branding-test" }));
  return { sendMail, createTransport: vi.fn(() => ({ sendMail })) };
});

vi.mock("nodemailer", () => ({ default: { createTransport } }));

import {
  sendInviteEmail,
  sendAdminPasswordResetEmail,
  sendPasswordResetEmail,
  sendPoApprovalRequestEmail,
} from "./mailer";

describe("TAAR email branding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Synthetic addresses only. No real SMTP connection or credentials are used.
    vi.stubEnv("EMAIL_USER", "sender@example.invalid");
    vi.stubEnv("EMAIL_PASS", "local-test-placeholder");
  });

  afterEach(() => vi.unstubAllEnvs());

  const cases = [
    ["invitation", () => sendInviteEmail("recipient@example.invalid", "Sample user", "https://example.invalid/invite")],
    ["admin password reset", () => sendAdminPasswordResetEmail("recipient@example.invalid", "Sample user", "https://example.invalid/reset")],
    ["forgot password", () => sendPasswordResetEmail("recipient@example.invalid", "sample-reset-token")],
    ["PO approval", () => sendPoApprovalRequestEmail({
      adminEmails: ["recipient@example.invalid"], poNumber: "PO-SAMPLE",
      vendorName: "Sample vendor", createdBy: "Sample user", referenceType: "Swatch",
      referenceId: 1, orderCode: "SW-SAMPLE", itemCount: 1,
      erpUrl: "https://example.invalid", approveUrl: "https://example.invalid/approve",
      rejectUrl: "https://example.invalid/reject",
    })],
  ] as const;

  for (const [name, send] of cases) {
    it(`embeds the approved logo and tagline in ${name}`, async () => {
      await send();
      expect(sendMail).toHaveBeenCalledOnce();
      const message = sendMail.mock.calls[0][0];
      expect(message.html).toContain('src="cid:taar-brand-logo"');
      expect(message.html).toContain("TAAR — YOUR DESIGN BUSINESS, CONNECTED");
      expect(message.text.startsWith("TAAR — YOUR DESIGN BUSINESS, CONNECTED")).toBe(true);
      expect(message.attachments).toHaveLength(1);
      const logo = message.attachments[0];
      expect(logo.cid).toBe("taar-brand-logo");
      expect(logo.contentType).toBe("image/png");
      expect(logo.content.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      expect(message.from).toContain("sender@example.invalid");
    });
  }
});
