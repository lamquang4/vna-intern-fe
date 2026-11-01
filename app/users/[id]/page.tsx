import EditUserForm from "@/libs/tts/components/users/EditUserForm";
import LayoutPage from "@/libs/tts/components/layout/LayoutPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <LayoutPage>
      <EditUserForm userId={id} />
    </LayoutPage>
  );
}
