import EnterpriseList from "@/libs/tts/components/enterprises/EnterpriseList";
import PageLayout from "@/libs/tts/components/layout/PageLayout";
import { Suspense } from "react";

function page() {
  return (
    <Suspense>
      <PageLayout>
        <EnterpriseList />
      </PageLayout>
    </Suspense>
  );
}

export default page;
