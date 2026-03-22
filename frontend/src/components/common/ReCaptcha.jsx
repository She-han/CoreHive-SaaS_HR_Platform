import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";

let recaptchaScriptPromise;

const loadRecaptchaV3Script = (siteKey) => {
  if (window.grecaptcha) {
    return Promise.resolve(window.grecaptcha);
  }

  if (recaptchaScriptPromise) {
    return recaptchaScriptPromise;
  }

  recaptchaScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="https://www.google.com/recaptcha/api.js?render=${siteKey}"]`
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(window.grecaptcha));
      existing.addEventListener("error", () => reject(new Error("Failed to load reCAPTCHA script")));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.grecaptcha);
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA script"));
    document.head.appendChild(script);
  });

  return recaptchaScriptPromise;
};

const ReCaptcha = forwardRef(({ onChange, onExpired, onError }, ref) => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "";

  const [statusMessage, setStatusMessage] = useState("Preparing security verification...");
  const refreshTimerRef = useRef(null);

  const requestToken = useCallback(async () => {
    if (!siteKey || isLocalhost) {
      return;
    }

    try {
      setStatusMessage("Generating reCAPTCHA token...");
      const grecaptcha = await loadRecaptchaV3Script(siteKey);

      await new Promise((resolve) => grecaptcha.ready(resolve));
      const token = await grecaptcha.execute(siteKey, { action: "auth_submit" });

      if (!token) {
        throw new Error("Empty reCAPTCHA token");
      }

      onChange?.(token);
      setStatusMessage("Security verification active");
    } catch (err) {
      console.error("❌ reCAPTCHA v3 token generation failed:", err);
      onError?.();
      setStatusMessage("Security verification unavailable");
    }
  }, [isLocalhost, onChange, onError, siteKey]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      onExpired?.();
      requestToken();
    }
  }));

  useEffect(() => {
    if (isLocalhost) {
      onChange?.("dev-bypass-token");
      return;
    }

    if (!siteKey) {
      return;
    }

    requestToken();

    // reCAPTCHA v3 tokens are short-lived; refresh periodically.
    refreshTimerRef.current = setInterval(() => {
      requestToken();
    }, 90000);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [isLocalhost, onChange, requestToken, siteKey]);

  if (isLocalhost) {
    return (
      <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-yellow-700 text-sm font-medium">
          Development Mode - reCAPTCHA v3 Bypassed
        </p>
      </div>
    );
  }

  if (!siteKey) {
    console.error("❌ VITE_RECAPTCHA_SITE_KEY not configured!");
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm">
          reCAPTCHA configuration error. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="my-4 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-center">
      <p className="text-xs font-medium text-emerald-700">{statusMessage}</p>
      <p className="mt-1 text-[11px] text-emerald-600">
        This form is protected by reCAPTCHA v3 and the Google Privacy Policy and Terms of Service apply.
      </p>
    </div>
  );
});

ReCaptcha.displayName = "ReCaptcha";

export default ReCaptcha;
