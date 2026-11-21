import EditEnterpriseContainer from "@/libs/tts/components/enterprises/edit-enterprise/EditEnterpriseContainer";
import PageLayout from "@/libs/tts/components/layout/PageLayout";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <PageLayout>
      <EditEnterpriseContainer enterpriseId={id} />
    </PageLayout>
  );
}
