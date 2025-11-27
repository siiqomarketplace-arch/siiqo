
"use client";
import { Suspense } from 'react';
import ResetPasswordPage from './page';

export default function ResetPasswordWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
