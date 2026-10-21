import { Suspense } from "react";
import EditUserForm from "@/libs/tts/components/users/EditUserForm";
import LayoutPage from "@/libs/tts/components/layout/LayoutPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: PageProps) {
  return (
    <Suspense>
      <LayoutPage>
        <EditUserPage params={params} />
      </LayoutPage>
    </Suspense>
  );
}

async function EditUserPage({ params }: PageProps) {
  const { id } = await params;

  return <EditUserForm userId={id} />;
}
