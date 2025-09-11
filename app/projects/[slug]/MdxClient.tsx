"use client";
import { Mdx } from "@/app/components/mdx";

export default function MdxClient({ code }: { code: string }) {
  return <Mdx code={code} />;
}
