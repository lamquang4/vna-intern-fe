import EnterpriseList from "@/libs/tts/components/enterprises/EnterpriseList";
import LayoutPage from "@/libs/tts/components/layout/LayoutPage";
import { Suspense } from "react";

function page() {
  return (
    <Suspense>
      <LayoutPage>
        <EnterpriseList />
      </LayoutPage>
    </Suspense>
  );
}

export default page;
