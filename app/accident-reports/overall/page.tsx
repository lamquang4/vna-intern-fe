import { Suspense } from "react";
import OverallAccidentReport from "@/libs/tts/components/accident-reports/overall/OverallAccidentReport";
import PageLayout from "@/libs/tts/components/layout/PageLayout";

function Page() {
  return (
    <PageLayout>
      <Suspense
        fallback={<div className="p-6">Đang tải báo cáo tổng hợp...</div>}
      >
        <OverallAccidentReport />
      </Suspense>
    </PageLayout>
  );
}

export default Page;
