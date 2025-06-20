import { Chip } from "@heroui/chip";
import { useTheme } from "next-themes";

interface WorkerStatusCellProps {
  value: string;
}

export default function WorkerStatusTag({ value }: WorkerStatusCellProps) {
  const { resolvedTheme } = useTheme();

  const variant = resolvedTheme === "dark" ? "flat" : "solid";

  return (
    <span className={"flex justify-center items-center"}>
      {value === "idle" ? (
        <Chip className="gap-1 text-white" color="success" variant={variant}>
          {value}
        </Chip>
      ) : (
        <Chip className="gap-1 text-white" color="danger" variant={variant}>
          {value}
        </Chip>
      )}
    </span>
  );
}
