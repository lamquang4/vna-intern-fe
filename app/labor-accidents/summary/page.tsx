// app/labor-accidents/summary/page.tsx
import Summary from "@/libs/tts/components/labor-accidents/report-form/Summary";
import LayoutPage from "@/libs/tts/components/layout/LayoutPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <LayoutPage>
        <Summary />
      </LayoutPage>
    </Suspense>
  );
}