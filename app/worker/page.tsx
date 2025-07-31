"use client";

import type { Worker } from "@/lib/types";
import type { SortDescriptor } from "@heroui/react";

import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getKeyValue,
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

import { title } from "@/lib/components/primitives";
import WorkerStatusTag from "@/lib/components/WorkerStatusTag";
import { WebSocketType } from "@/lib/enums";
import { AppConfig } from "@/lib/config";

const wsBaseURL = AppConfig.wsBaseURL;

const limitOption = [
  { key: 10, label: "10" },
  { key: 20, label: "20" },
  { key: 50, label: "50" },
  { key: 100, label: "100" },
];

export default function JobPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "worker_id",
    direction: "ascending",
  });

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`${wsBaseURL}/worker`);

    socketRef.current = socket;

    socket.onopen = () => {
      // eslint-disable-next-line no-console
      console.log("✅ Worker WebSocket connected");
      setLoading(true);
      socket.send(JSON.stringify({ page: currentPage, limit }));
    };

    socket.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);

        if (
          type === WebSocketType.WORKER_INIT ||
          type === WebSocketType.WORKER_FETCH_NEW
        ) {
          const { data, pagination } = payload;

          if (!Array.isArray(data)) {
            // eslint-disable-next-line no-console
            console.error("data:: ", data);
            throw new Error("Invalid job data");
          }

          setWorkers(data);
          setCurrentPage(pagination.currentPage);
          setTotalPage(pagination.totalPages);
        }

        if (type === WebSocketType.WORKER_UPDATE) {
          setWorkers((prevWorkers) => {
            const prevWorkerMap = new Map(
              prevWorkers.map((worker) => [worker.worker_id, worker]),
            );

            const updatedWorkers: Worker[] = [];

            for (const worker of payload) {
              if (prevWorkerMap.has(worker.worker_id)) {
                updatedWorkers.push(worker);
              }
            }

            const merged = prevWorkers.map(
              (worker) =>
                updatedWorkers.find((j) => j.worker_id === worker.worker_id) ||
                worker,
            );

            const final = [...merged].slice(0, limit);

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

  const sortedWorkers = useMemo(() => {
    const { column, direction } = sortDescriptor;

    if (!Array.isArray(workers)) return [];

    if (workers !== null) {
      return [...workers].sort((a, b) => {
        const valA = a[column as keyof Worker];
        const valB = b[column as keyof Worker];

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
  }, [workers, sortDescriptor]);

  const handleChangePagination = (page: number) => {
    setCurrentPage(page);
  };

  const handleChangeLimit = (limitNumber: string) => {
    setLimit(parseInt(limitNumber));
  };

  useEffect(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      setLoading(true);
      socketRef.current.send(JSON.stringify({ page: currentPage, limit }));
    }
  }, [currentPage, limit]);

  const renderCell = useCallback((item: Worker, columnKey: string) => {
    switch (columnKey) {
      case "status":
        return <WorkerStatusTag value={item.status} />;

      case "last_heartbeat":
        return <div>{dayjs(item.last_heartbeat).format("hh:mm:ss A")}</div>;

      default:
        return getKeyValue(item, columnKey);
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className={title()}>Worker</h1>
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
      {/* <GridComponent columnDefs={columnDefs} rowData={jobs} /> */}

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
          <TableColumn key="worker_id" allowsSorting>
            Worker ID
          </TableColumn>
          <TableColumn key="status" allowsSorting>
            Worker Status
          </TableColumn>
          <TableColumn key="last_heartbeat" allowsSorting>
            Last Heartbeat
          </TableColumn>
        </TableHeader>
        <TableBody
          items={sortedWorkers ?? []}
          loadingContent={<Spinner />}
          loadingState={loading ? "loading" : "idle"}
        >
          {(item: Worker) => (
            <TableRow key={item.worker_id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey as string)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
