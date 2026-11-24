import EditAccidentReportContainer from "@/libs/tts/components/accident-reports/edit-accident-report/EditAccidentReportContainer";
import PageLayout from "@/libs/tts/components/layout/PageLayout";
import { Suspense } from "react";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string | string[] }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const mode = query.mode === "edit" ? "edit" : "view";

  return (
    <PageLayout>
      <Suspense>
        <EditAccidentReportContainer
          key={mode}
          accidentReportId={id}
          mode={mode}
        />
      </Suspense>
    </PageLayout>
  );
}
