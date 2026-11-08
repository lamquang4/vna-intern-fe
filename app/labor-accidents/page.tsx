// app/labor-accidents/page.tsx
import LaborAccidentList from "@/libs/tts/components/labor-accidents/LaborAccidentList";
import LayoutPage from "@/libs/tts/components/layout/LayoutPage";
import { Suspense } from "react";

function page() {
  return (
    <Suspense>
      <LayoutPage>
        <LaborAccidentList />
      </LayoutPage>
    </Suspense>
  );
}

export default page;