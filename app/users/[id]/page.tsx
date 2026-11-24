import EditUserForm from "@/libs/tts/components/users/EditUserForm";
import PageLayout from "@/libs/tts/components/layout/PageLayout";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <PageLayout>
      <EditUserForm userId={id} />
    </PageLayout>
  );
}
