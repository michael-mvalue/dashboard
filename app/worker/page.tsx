"use client";

import type { Worker } from "@/lib/types";
import type { ColDef, ColGroupDef } from "ag-grid-community";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import GridComponent from "@/lib/components/GridComponent";
import { title } from "@/lib/components/primitives";
import WorkerStatusTag from "@/lib/components/WorkerStatusTag";
import CustomWorkerStatusFilterComponent from "@/lib/components/CustomWorkerStatusFilterComponent";

export default function WorkerPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/worker");

    // eslint-disable-next-line no-console
    socket.onopen = () => console.log("✅ WebSocket connected");

    socket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data) as Worker[];

        setWorkers(parsedData);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to parse message", err);
      }
    };

    // eslint-disable-next-line no-console
    socket.onerror = (error) => console.error("WebSocket error:", error);

    // eslint-disable-next-line no-console
    socket.onclose = () => console.warn("WebSocket connection closed");

    return () => socket.close();
  }, []);

  const columnDefs: (ColDef<Worker> | ColGroupDef<Worker>)[] = useMemo(
    () => [
      { field: "worker_id", headerName: "Worker ID", flex: 1 },
      {
        field: "status",
        headerName: "Status",
        minWidth: 150,
        maxWidth: 150,
        cellRenderer: WorkerStatusTag,
        // filter: CustomWorkerStatusFilterComponent,
      },
      {
        headerName: "Last Heartbeat",
        field: "last_heartbeat",
        minWidth: 130,
        maxWidth: 130,
        valueGetter: (params) => {
          const { last_heartbeat } = params.data ?? {};

          return dayjs(last_heartbeat).format("YYYY-MM-DD");
        },
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <h1 className={title()}>Worker</h1>
      <GridComponent columnDefs={columnDefs} rowData={workers} />
    </div>
  );
}
