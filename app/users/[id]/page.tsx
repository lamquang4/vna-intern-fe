import EditUserForm from "@/libs/tts/components/users/EditUserForm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditUserForm userId={id} />;
}
