// app/admin/user/[account_type]/[id]/page.tsx
import UserProfileClient from "./UserProfileClient";

// Props interface for Next.js 15+ (params is now a Promise)
interface PageProps {
  params: Promise<{
    account_type: string;
    id: string;
  }>;
}

// Generate static params for build optimization
export async function generateStaticParams() {
  const accountTypes = ["vendor", "customer", "admin"];
  const staticParams: { account_type: string; id: string }[] = [];

  for (const accountType of accountTypes) {
    // Generate fewer static params to avoid build issues
    // You can adjust this range based on your needs
    for (let i = 1; i <= 10; i++) {
      staticParams.push({
        account_type: accountType,
        id: i.toString(),
      });
    }
  }

  return staticParams;
}

// Server component
export default async function UserProfilePage({ params }: PageProps) {
  // Await the params Promise in Next.js 15+
  const resolvedParams = await params;

  return <UserProfileClient params={resolvedParams} />;
}
