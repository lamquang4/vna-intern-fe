import EditEnterpriseContainer from "@/libs/tts/components/enterprises/edit-enterprise/EditEnterpriseContainer";
import LayoutPage from "@/libs/tts/components/layout/LayoutPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <LayoutPage>
      <EditEnterpriseContainer enterpriseId={id} />
    </LayoutPage>
  );
}
