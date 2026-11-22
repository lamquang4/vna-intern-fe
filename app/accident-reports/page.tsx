import AccidentReportList from "@/libs/tts/components/accident-reports/AccidentReportList";
import PageLayout from "@/libs/tts/components/layout/PageLayout";
import { Suspense } from "react";

function page() {
  return (
    <PageLayout>
      <Suspense>
        <AccidentReportList />
      </Suspense>
    </PageLayout>
  );
}

export default page;
