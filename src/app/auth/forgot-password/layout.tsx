
import { Suspense } from "react";

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}
