import type { WorkerStatus } from "../types";

import { Chip } from "@heroui/chip";
import { useTheme } from "next-themes";

import { upperCaseFirstLetter } from "@/lib/utils";

interface WorkerStatusCellProps {
  value: WorkerStatus;
}

export default function WorkerStatusTag({ value }: WorkerStatusCellProps) {
  const { resolvedTheme } = useTheme();

  const variant = resolvedTheme === "dark" ? "flat" : "solid";

  return (
    <span className={"flex justify-center items-center"}>
      {value === "idle" ? (
        <Chip className="gap-1 text-white" color="success" variant={variant}>
          {upperCaseFirstLetter(value)}
        </Chip>
      ) : value === "busy" ? (
        <Chip className="gap-1 text-white" color="danger" variant="shadow">
          {upperCaseFirstLetter(value)}
        </Chip>
      ) : (
        <Chip className="gap-1 text-white" variant={variant}>
          {upperCaseFirstLetter(value)}
        </Chip>
      )}
    </span>
  );
}
