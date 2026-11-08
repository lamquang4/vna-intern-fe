import LaborAccidentReportContainer from "@/libs/tts/components/labor-accidents/report-form/LaborAccidentReportContainer";
import LayoutPage from "@/libs/tts/components/layout/LayoutPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <LayoutPage>
        <LaborAccidentReportContainer />
      </LayoutPage>
    </Suspense>
  );
}
