import PageLayout from "@/libs/tts/components/layout/PageLayout";
import UserList from "@/libs/tts/components/users/UserList";
import { Suspense } from "react";

function page() {
  return (
    <Suspense>
      <PageLayout>
        <UserList />
      </PageLayout>
    </Suspense>
  );
}

export default page;
