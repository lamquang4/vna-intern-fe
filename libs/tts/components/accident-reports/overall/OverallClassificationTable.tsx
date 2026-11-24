import GroupTable from "@/libs/core/components/ui/GroupTable";
import type { OverallAccidentReportResponse } from "@/libs/shared/tts/models/accident-report.model";
import { buildOverallClassificationRows } from "@/libs/tts/utils/accidentReportOverall";
import {
  overallClassificationColumns,
} from "@/libs/tts/utils/accidentReportOverallColumns";

interface Props {
  summary?: OverallAccidentReportResponse;
}

function OverallClassificationTable({ summary }: Props) {
  return (
    <GroupTable
      columns={overallClassificationColumns}
      rows={buildOverallClassificationRows(summary)}
      minWidth={1600}
    />
  );
}

export default OverallClassificationTable;
