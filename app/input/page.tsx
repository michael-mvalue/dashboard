"use client";

import { title } from "@/lib/components/primitives";
import Upload from "@/lib/components/Upload";

export default function InputPage() {
  return (
    <div className="flex flex-col gap-16 w-full">
      <h1 className={title()}>User Input</h1>
      <Upload />
    </div>
  );
}
