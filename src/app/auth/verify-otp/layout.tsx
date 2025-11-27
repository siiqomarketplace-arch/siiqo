
"use client";
import { Suspense } from 'react';
import VerifyOtpPage from './page';

export default function VerifyOtpWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpPage />
    </Suspense>
  );
}
