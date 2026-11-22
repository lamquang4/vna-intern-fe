import CreateEnterpriseContainer from "@/libs/tts/components/enterprises/create-enterprise/CreateEnterpriseContainer";
import { Suspense } from "react";

function page() {
  return (
    <Suspense>
      <CreateEnterpriseContainer />
    </Suspense>
  );
}

export default page;
