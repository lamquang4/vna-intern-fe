import { Suspense } from "react";
import OverallAccidentReport from "@/libs/tts/components/accident-reports/overall/OverallAccidentReport";
import LayoutPage from "@/libs/tts/components/layout/LayoutPage";

function Page() {
  return (
    <LayoutPage>
      <Suspense
        fallback={<div className="p-6">Đang tải báo cáo tổng hợp...</div>}
      >
        <OverallAccidentReport />
      </Suspense>
    </LayoutPage>
  );
}

export default Page;
