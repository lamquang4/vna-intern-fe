import { Suspense } from "react";
import EditUserForm from "@/libs/tts/components/users/EditUserForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: PageProps) {
  return (
    <Suspense>
      <EditUserPage params={params} />
    </Suspense>
  );
}

async function EditUserPage({ params }: PageProps) {
  const { id } = await params;

  return <EditUserForm userId={id} />;
}
