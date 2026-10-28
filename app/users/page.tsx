import LayoutPage from "@/libs/tts/components/layout/LayoutPage";
import UserList from "@/libs/tts/components/users/UserList";
import { Suspense } from "react";

function page() {
  return (
    <Suspense>
      <LayoutPage>
        <UserList />
      </LayoutPage>
    </Suspense>
  );
}

export default page;
