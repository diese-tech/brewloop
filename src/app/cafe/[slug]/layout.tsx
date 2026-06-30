import { notFound } from "next/navigation";

import { AppNav } from "@/components/app-nav";
import { getCafeBySlug } from "@/lib/data";

export default async function CafeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await getCafeBySlug(slug))) notFound();

  return (
    <>
      <AppNav />
      {children}
    </>
  );
}
