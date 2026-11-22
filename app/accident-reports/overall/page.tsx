import { Suspense } from "react";
import OverallAccidentReport from "@/libs/tts/components/accident-reports/overall/OverallAccidentReport";
import PageLayout from "@/libs/tts/components/layout/PageLayout";

function Page() {
  return (
    <PageLayout>
      <Suspense>
        <OverallAccidentReport />
      </Suspense>
    </PageLayout>
  );
}

export default Page;
