import { Suspense } from "react";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}