import GroupTable from "@/libs/core/components/ui/GroupTable";
import type {
  OverallBusinessStats,
  ReportSummaryBusinessType,
} from "@/libs/shared/tts/models/accident-report.model";
import { buildOverallBusinessRows } from "@/libs/tts/utils/accidentReportOverall";
import { overallBusinessColumns } from "@/libs/tts/utils/accidentReportOverallColumns";

interface Props {
  businessTypes?: ReportSummaryBusinessType[];
  total?: OverallBusinessStats;
}

function OverallBusinessTable({ businessTypes, total }: Props) {
  return (
    <GroupTable
      columns={overallBusinessColumns}
      minWidth={1400}
      rows={buildOverallBusinessRows(businessTypes, total)}
    />
  );
}

export default OverallBusinessTable;
