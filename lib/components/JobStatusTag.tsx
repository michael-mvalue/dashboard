import type { JobStatus } from "@/lib/types";

import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { FaCheckCircle } from "react-icons/fa";
import { useTheme } from "next-themes";

import { upperCaseFirstLetter } from "@/lib/utils";

interface JobStatusCellProps {
  status: JobStatus;
}

export default function JobStatusTag({ status }: JobStatusCellProps) {
  const { resolvedTheme } = useTheme();

  const variant = resolvedTheme === "dark" ? "flat" : "solid";

  return (
    <span className={"flex justify-center items-center"}>
      {status === "running" ? (
        <Chip
          className="gap-1 text-white"
          color="secondary"
          startContent={
            <Spinner color={"secondary"} size="sm" variant="gradient" />
          }
          variant={"flat"}
        >
          <span className="text-violet-600">
            {upperCaseFirstLetter(status)}
          </span>
        </Chip>
      ) : status === "done" ? (
        <Chip
          className="gap-1 text-white"
          color="success"
          startContent={<FaCheckCircle size={18} />}
          variant={variant}
        >
          {upperCaseFirstLetter(status)}
        </Chip>
      ) : (
        <Chip className="gap-1" variant="flat">
          {upperCaseFirstLetter(status)}
        </Chip>
      )}
    </span>
  );
}
