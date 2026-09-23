import UnlockPage from "@/components/Blueprint/UnlockPage";

export default async function BlueprintUnlockPage({
  params,
}: {
  params: Promise<{ order_reference: string }>;
}) {
  const { order_reference: orderReference } = await params;

  return <UnlockPage orderReference={orderReference} />;
}
