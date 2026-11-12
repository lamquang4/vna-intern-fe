import EditAccidentReportContainer from "@/libs/tts/components/accident-reports/edit-accident-report/EditAccidentReportContainer";
import LayoutPage from "@/libs/tts/components/layout/LayoutPage";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string | string[] }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const mode = query.mode === "edit" ? "edit" : "view";

  return (
    <LayoutPage>
      <EditAccidentReportContainer
        key={mode}
        accidentReportId={id}
        mode={mode}
      />
    </LayoutPage>
  );
}
