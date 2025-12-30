import React, { forwardRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const ReCaptcha = forwardRef(({ onChange, onExpired, onError }, ref) => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  console.log('🔑 reCAPTCHA Site Key:', siteKey ? 'Present' : 'Missing');
  console.log('🔑 Full Key (first 10 chars):', siteKey?.substring(0, 10));

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