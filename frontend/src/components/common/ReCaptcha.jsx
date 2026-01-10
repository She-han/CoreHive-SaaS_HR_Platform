import React, { forwardRef, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const ReCaptcha = forwardRef(({ onChange, onExpired, onError }, ref) => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '';

  console.log('🔑 reCAPTCHA Site Key:', siteKey ? 'Present' : 'Missing');
  console.log('🔑 Full Key (first 10 chars):', siteKey?.substring(0, 10));
  console.log('🌐 Running on localhost:', isLocalhost);

  // Skip reCAPTCHA on localhost
  useEffect(() => {
    if (isLocalhost && onChange) {
      console.log('⚠️ Development mode - bypassing reCAPTCHA');
      onChange('dev-bypass-token');
    }
  }, [isLocalhost, onChange]);

  if (isLocalhost) {
    return (
      <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-yellow-700 text-sm font-medium">
          Development Mode - reCAPTCHA Bypassed
        </p>
      </div>
    );
  }

  if (!siteKey) {
    console.error('❌ VITE_RECAPTCHA_SITE_KEY not configured!');
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm">
          reCAPTCHA configuration error. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <ReCAPTCHA
        ref={ref}
        sitekey={siteKey}
        onChange={onChange}
        onExpired={onExpired}
        onErrored={onError}
        theme="light"
        size="normal"
      />
    </div>
  );
});

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha;