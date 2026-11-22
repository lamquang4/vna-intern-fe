import EditEnterpriseContainer from "@/libs/tts/components/enterprises/edit-enterprise/EditEnterpriseContainer";
import PageLayout from "@/libs/tts/components/layout/PageLayout";
import { Suspense } from "react";

function page() {
  return (
    <PageLayout>
      <Suspense>
        <EditEnterpriseContainer />
      </Suspense>
    </PageLayout>
  );
}

export default page;
