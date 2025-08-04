"use client";

import type { Job } from "@/lib/types";
import type { SortDescriptor } from "@heroui/react";

import { useTheme } from "next-themes";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  getKeyValue,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { materialDark, materialLight } from "@uiw/codemirror-theme-material";

import { title } from "@/lib/components/primitives";
import JobStatusTag from "@/lib/components/JobStatusTag";
import { WebSocketType } from "@/lib/enums";
import { AppConfig } from "@/lib/config";

const wsBaseURL = AppConfig.wsBaseURL;

const limitOption = [
  { key: 5, label: "5" },
  { key: 10, label: "10" },
  { key: 20, label: "20" },
  { key: 50, label: "50" },
];

export default function JobPage() {
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [isUPIModalOpen, setUPIModalOpen] = useState<boolean>(false);
  const [upiTitle, setUpiTitle] = useState<string>("");
  const [isMetadataModalOpen, setMetadataModalOpen] = useState<boolean>(false);
  const [isLogModalOpen, setLogModalOpen] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [upiContent, setUpiContent] = useState<string>("");
  const [metadataContent, setMetadataContent] = useState<string>("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "worker_id",
    direction: "ascending",
  });

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`${wsBaseURL}/job`);

    socketRef.current = socket;

    socket.onopen = () => {
      // eslint-disable-next-line no-console
      console.log("✅ Job WebSocket connected");
      setLoading(true);
      socket.send(JSON.stringify({ page: currentPage, limit }));
    };

    socket.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);

        if (
          type === WebSocketType.JOB_INIT ||
          type === WebSocketType.JOB_FETCH_NEW
        ) {
          const { data, pagination } = payload;

          if (!Array.isArray(data)) {
            throw new Error("Invalid job data");
          }

          setJobs(data);
          setCurrentPage(pagination.currentPage);
          setTotalPage(pagination.totalPages);
        }

        if (type === WebSocketType.JOB_UPDATE) {
          setJobs((prevJobs) => {
            const prevJobMap = new Map(
              prevJobs.map((job) => [job.job_id, job]),
            );

            const newJobs: Job[] = [];
            const updatedJobs: Job[] = [];

            for (const job of payload) {
              if (prevJobMap.has(job.job_id)) {
                updatedJobs.push(job);
              } else {
                newJobs.unshift(job); // Add new jobs to the front
              }
            }

            const merged = prevJobs.map(
              (job) => updatedJobs.find((j) => j.job_id === job.job_id) || job,
            );

            const final = [...newJobs, ...merged].slice(0, limit);

            return final;
          });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to parse message", err);
      }

      setLoading(false);
    };

    // eslint-disable-next-line no-console
    socket.onerror = (error) => console.error("WebSocket error:", error);

    // eslint-disable-next-line no-console
    socket.onclose = () => console.warn("WebSocket connection closed");

    return () => socket.close();
  }, [limit]);

  const sortedJobs = useMemo(() => {
    const { column, direction } = sortDescriptor;

    if (!Array.isArray(jobs)) return [];

    if (jobs !== null) {
      return [...jobs].sort((a, b) => {
        const valA = a[column as keyof Job];
        const valB = b[column as keyof Job];

        if (valA == null) return direction === "ascending" ? 1 : -1;
        if (valB == null) return direction === "ascending" ? -1 : 1;

        // Normalize for string/number comparison
        const aValue = typeof valA === "string" ? valA.toLowerCase() : valA;
        const bValue = typeof valB === "string" ? valB.toLowerCase() : valB;

        if (aValue < bValue) return direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return direction === "ascending" ? 1 : -1;

        return 0;
      });
    }

    return [];
  }, [jobs, sortDescriptor]);

  const handleChangePagination = (page: number) => {
    setCurrentPage(page);
  };

  const handleChangeLimit = (limitNumber: string) => {
    setLimit(parseInt(limitNumber));
  };

  const viewUPI = (fileName: string, content: string) => {
    setUPIModalOpen(true);
    setUpiContent(content);
    setUpiTitle(fileName);
  };

  const viewMetadata = (content: string) => {
    setMetadataModalOpen(true);
    let formatted = "";

    try {
      const parsed = JSON.parse(content);

      formatted = JSON.stringify(parsed, null, 4);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Error During parsing metadata content: ${err}`);
      formatted = JSON.stringify("{}", null, 0);
    }
    setMetadataContent(formatted);
  };

  const viewLogs = (logs: string[]) => {
    setLogModalOpen(true);
    setLogs(logs);
  };

  const closeUPIModal = () => {
    setUPIModalOpen(false);
    setUpiTitle("");
    setUpiContent("");
  };

  const closeMetadataModal = () => {
    setMetadataModalOpen(false);
    setMetadataContent("");
  };

  const closeLogModal = () => {
    setLogModalOpen(false);
    setLogs([]);
  };

  useEffect(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      setLoading(true);
      socketRef.current.send(JSON.stringify({ page: currentPage, limit }));
    }
  }, [currentPage, limit]);

  const renderCell = useCallback((item: Job, columnKey: string) => {
    switch (columnKey) {
      case "file_content":
        return (
          <Button
            color="primary"
            size="sm"
            variant="flat"
            onPress={() =>
              viewUPI(
                item.s3_key.split("_").slice(1).join("_"),
                item.file_content ?? "",
              )
            }
          >
            {item.s3_key.split("_").slice(1).join("_")}
          </Button>
        );

      case "worker_id":
        return <div>{item.worker_id}</div>;

      case "status":
        return <JobStatusTag status={item.status} />;

      case "logs":
        return (
          <Button size="sm" variant="flat" onPress={() => viewLogs(item.logs)}>
            Logs
          </Button>
        );

      case "result_content":
        return (
          <>
            {item.result_content && item.result_content.length > 0 && (
              <Button
                color="success"
                size="sm"
                variant="flat"
                onPress={() => viewMetadata(item.result_content ?? "")}
              >
                Result
              </Button>
            )}
          </>
        );

      case "duration":
        if (item.status !== "done") return "-";
        const start = new Date(item.timestamps?.assigned_at ?? 0);
        const end = new Date(item.timestamps?.completed_at ?? 0);
        const durationMs = end.getTime() - start.getTime();

        if (isNaN(durationMs) || durationMs < 0) return "-";
        const totalSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}m ${seconds}s`;

      case "timestamps.created_at":
        return (
          <div>
            {dayjs(item?.timestamps?.created_at).format(
              "MM/DD/YYYY hh:mm:ss A",
            )}
          </div>
        );

      case "timestamps.assigned_at":
        return (
          <div>
            {item?.timestamps?.assigned_at !== null &&
              dayjs(item?.timestamps?.assigned_at).format(
                "MM/DD/YYYY hh:mm:ss A",
              )}
          </div>
        );

      case "timestamps.completed_at":
        return (
          <div>
            {item?.timestamps?.completed_at !== null &&
              dayjs(item?.timestamps?.completed_at).format(
                "MM/DD/YYYY hh:mm:ss A",
              )}
          </div>
        );
      default:
        return getKeyValue(item, columnKey);
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className={title()}>Job</h1>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 min-w-[160px]">
          <div>Limit:</div>

          <Select
            aria-label="Page Size"
            defaultSelectedKeys={["10"]}
            label=""
            onChange={({ target: { value } }) => handleChangeLimit(value)}
          >
            {limitOption.map((animal) => (
              <SelectItem key={animal.key}>{animal.label}</SelectItem>
            ))}
          </Select>
        </div>

        <Pagination
          showControls
          initialPage={1}
          page={currentPage}
          total={totalPage}
          onChange={handleChangePagination}
        />
      </div>

      <Table
        aria-label="Jobs table"
        bottomContent={
          totalPage > 0 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={currentPage}
                total={totalPage}
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          ) : null
        }
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      >
        <TableHeader>
          <TableColumn key="file_content">UPI Content</TableColumn>
          <TableColumn key="worker_id" allowsSorting>
            Worker
          </TableColumn>
          <TableColumn key="status" allowsSorting>
            Status
          </TableColumn>
          <TableColumn key="logs">Logs</TableColumn>
          <TableColumn key="result_content">Result</TableColumn>
          <TableColumn key="duration">Duration</TableColumn>
          <TableColumn key="timestamps.created_at">created_at</TableColumn>
          <TableColumn key="timestamps.assigned_at">assigned_at</TableColumn>
          <TableColumn key="timestamps.completed_at">completed_at</TableColumn>
        </TableHeader>
        <TableBody
          items={sortedJobs ?? []}
          loadingContent={<Spinner />}
          loadingState={loading ? "loading" : "idle"}
        >
          {(item: Job) => (
            <TableRow key={item.job_id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey as string)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        backdrop="blur"
        isOpen={isUPIModalOpen}
        scrollBehavior="inside"
        size={"5xl"}
        onClose={closeUPIModal}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">{upiTitle}</ModalHeader>
          <ModalBody>
            <div className="whitespace-pre-wrap">{upiContent}</div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        backdrop="blur"
        isOpen={isMetadataModalOpen}
        scrollBehavior="inside"
        size={"5xl"}
        onClose={closeMetadataModal}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Metadata</ModalHeader>
          <ModalBody>
            {metadataContent && metadataContent.length > 0 && (
              <CodeMirror
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                }}
                className="text-lg"
                extensions={[json()]}
                theme={resolvedTheme === "dark" ? materialDark : materialLight}
                value={JSON.stringify(JSON.parse(metadataContent), null, 2)}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        backdrop="blur"
        isOpen={isLogModalOpen}
        scrollBehavior="inside"
        size={"4xl"}
        onClose={closeLogModal}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Logs</ModalHeader>
          <ModalBody>
            <div className="whitespace-pre-wrap">
              {logs &&
                logs.length > 0 &&
                logs.map((log: string, index: number) => (
                  <div key={log + index}>{log}</div>
                ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
