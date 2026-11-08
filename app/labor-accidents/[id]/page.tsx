// app/labor-accidents/[id]/page.tsx
import LaborAccidentReportContainer from "@/libs/tts/components/labor-accidents/report-form/LaborAccidentReportContainer";
import LayoutPage from "@/libs/tts/components/layout/LayoutPage";
import { Suspense } from "react";

function page() {
  return (
    <Suspense>
      <LayoutPage>
        <LaborAccidentReportContainer />
      </LayoutPage>
    </Suspense>
  );
}

export default page;