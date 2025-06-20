import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { FaCheckCircle } from "react-icons/fa";
import { useTheme } from "next-themes";

interface JobStatusCellProps {
  value: string;
}

export default function JobStatusTag({ value }: JobStatusCellProps) {
  const { resolvedTheme } = useTheme();

  const variant = resolvedTheme === "dark" ? "flat" : "solid";

  return (
    <span className={"flex justify-center items-center"}>
      {value === "running" ? (
        <Chip
          className="gap-1 text-white"
          color="secondary"
          startContent={
            <Spinner color="secondary" size="sm" variant="gradient" />
          }
          variant={variant}
        >
          <span>{value}</span>
        </Chip>
      ) : value === "completed" ? (
        <Chip
          className="gap-1 text-white"
          color="success"
          startContent={<FaCheckCircle size={18} />}
          variant={variant}
        >
          {value}
        </Chip>
      ) : (
        <Chip className="gap-1" variant="flat">
          {value}
        </Chip>
      )}
    </span>
  );
}
