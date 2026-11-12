import GroupTable from "@/libs/core/components/ui/GroupTable";
import type { AccidentReportSummaryResponse } from "@/libs/shared/tts/models/accident-report.model";
import {
  accidentDamageColumns,
  accidentSummaryColumns,
} from "@/libs/tts/utils/accidentReportColumns";
import { buildSummaryRows } from "@/libs/tts/utils/accidentReportSummary";

interface Props {
  summary?: AccidentReportSummaryResponse;
}

function AccidentReportSummaryTable({ summary }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <GroupTable
        columns={accidentSummaryColumns}
        rows={summary ? buildSummaryRows(summary) : []}
        minWidth={1500}
      />
      <GroupTable
        columns={accidentDamageColumns}
        rows={
          summary?.accidentDamage
            ? [{ id: "damage", data: summary.accidentDamage }]
            : []
        }
      />
    </div>
  );
}

export default AccidentReportSummaryTable;
