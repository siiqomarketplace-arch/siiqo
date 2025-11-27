import UserProfileClient from "./UserProfileClient";

interface PageProps {
  params: Promise<{
    account_type: string;
    id: string;
  }>;
}

export async function generateStaticParams() {
  const accountTypes = ["vendor", "customer", "admin"];
  const staticParams: { account_type: string; id: string }[] = [];

  for (const accountType of accountTypes) {
    for (let i = 1; i <= 10; i++) {
      staticParams.push({
        account_type: accountType,
        id: i.toString(),
      });
    }
  }

  return staticParams;
}

export default async function UserProfilePage({ params }: PageProps) {
  const resolvedParams = await params;

  return <UserProfileClient params={resolvedParams} />;
}
