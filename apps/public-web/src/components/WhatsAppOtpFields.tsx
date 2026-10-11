import { BrandIcon } from "./BrandIcon";

export function WhatsAppOtpFields({
  phoneDigits,
  otpCode,
  sent,
  verified,
  busy,
  serviceReady,
  onPhoneChange,
  onCodeChange,
  onSend,
  onVerify,
}: {
  phoneDigits: string;
  otpCode: string;
  sent: boolean;
  verified: boolean;
  busy: boolean;
  serviceReady: boolean;
  onPhoneChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onSend: () => void;
  onVerify: () => void;
}) {
  return (
    <div className="whatsapp-otp-fields">
      <label>
        <span>WhatsApp mobile number</span>
        <div className="phone-input">
          <span className="phone-prefix" aria-label="Pakistan country code, fixed">+92</span>
          <input
            autoComplete="tel-national"
            inputMode="numeric"
            maxLength={10}
            onChange={(event) => onPhoneChange(event.target.value.replace(/\D/g, "").slice(0, 10))}
            pattern="3[0-9]{9}"
            placeholder="3XXXXXXXXX"
            required
            type="tel"
            value={phoneDigits}
          />
        </div>
        <small>Enter 10 digits starting with 3. Pakistan (+92) is fixed.</small>
      </label>
      <button className="button button-outline button-small" disabled={busy || !serviceReady || !/^3\d{9}$/.test(phoneDigits) || verified} onClick={onSend} type="button">
        {busy ? "Please wait…" : sent ? "Resend WhatsApp code" : "Send WhatsApp code"}
      </button>
      {sent && (
        <>
          <label>
            <span>Six-digit WhatsApp code</span>
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => onCodeChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
              pattern="[0-9]{6}"
              required
              type="text"
              value={otpCode}
            />
          </label>
          <button className="button button-quiet button-small" disabled={busy || !serviceReady || otpCode.length !== 6 || verified} onClick={onVerify} type="button">
            {verified ? <><BrandIcon name="shield-check" size={16} /> WhatsApp verified</> : busy ? "Checking…" : "Verify code"}
          </button>
        </>
      )}
      {verified && <p className="otp-success" role="status">The server confirmed this WhatsApp number. Continue before the proof expires.</p>}
    </div>
  );
}
