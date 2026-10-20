import EditUserForm from "@/libs/tts/components/users/EditUserForm";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <EditUserForm userId={id} />
    </Suspense>
  );
}
