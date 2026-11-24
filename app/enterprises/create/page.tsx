import CreateEnterpriseContainer from "@/libs/tts/components/enterprises/create-enterprise/CreateEnterpriseContainer";
import PageLayout from "@/libs/tts/components/layout/PageLayout";
import { Suspense } from "react";

function page() {
  return (
    <PageLayout>
      <Suspense>
        <CreateEnterpriseContainer />
      </Suspense>
    </PageLayout>
  );
}

export default page;
