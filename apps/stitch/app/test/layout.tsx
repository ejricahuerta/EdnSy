import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stitch test preview",
  description: "Run POST /api/test and preview generated HTML",
};

export default function TestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
