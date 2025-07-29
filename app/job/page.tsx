"use client";

import type { Job } from "@/lib/types";
import type { ColDef, ColGroupDef } from "ag-grid-community";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import GridComponent from "@/lib/components/GridComponent";
import { title } from "@/lib/components/primitives";
import JobStatusTag from "@/lib/components/JobStatusTag";
import CustomJobStatusFilterComponent from "@/lib/components/CustomJobStatusFilterComponent";

export default function JobPage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:9000/ws/job");

    // eslint-disable-next-line no-console
    socket.onopen = () => console.log("✅ WebSocket connected");

    socket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data) as Job[];

        setJobs(parsedData);
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

  const columnDefs: (ColDef<Job> | ColGroupDef<Job>)[] = useMemo(
    () => [
      { field: "s3_key", headerName: "Key", flex: 1 },
      {
        field: "status",
        headerName: "Status",
        minWidth: 150,
        maxWidth: 150,
        cellRenderer: JobStatusTag,
        // filter: CustomJobStatusFilterComponent,
      },
      { field: "worker_id", headerName: "Worker ID", width: 120 },
      {
        headerName: "Duration",
        minWidth: 100,
        maxWidth: 100,
        valueGetter: (params) => {
          const { status, timestamps } = params.data ?? {};

          if (status !== "completed") return null;

          const start = new Date(timestamps?.assigned_at ?? 0);
          const end = new Date(timestamps?.completed_at ?? 0);
          const durationMs = end.getTime() - start.getTime();

          if (isNaN(durationMs) || durationMs < 0) return null;

          const totalSeconds = Math.floor(durationMs / 1000);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;

          return `${minutes}m ${seconds}s`;
        },
      },
      {
        headerName: "Timestamps",
        resizable: false,
        children: [
          {
            headerName: "Date",
            width: 110,
            resizable: false,
            valueGetter: (params) => {
              const { timestamps } = params.data ?? {};

              if (timestamps?.created_at === null) {
                return;
              }

              const date = dayjs(timestamps?.created_at).format("MM/DD/YYYY");

              return date;
            },
          },
          {
            headerName: "Created At",
            field: "timestamps.created_at",
            resizable: false,
            valueGetter: (params) =>
              dayjs(params.data?.timestamps?.created_at).format("hh:mm:ss A"),
            width: 110,
          },
          {
            headerName: "Assigned At",
            field: "timestamps.assigned_at",
            resizable: false,
            valueGetter: (params) =>
              dayjs(params.data?.timestamps?.assigned_at).format("hh:mm:ss A"),
            width: 110,
          },
          {
            headerName: "Completed At",
            field: "timestamps.completed_at",
            resizable: false,
            valueGetter: (params) =>
              dayjs(params.data?.timestamps?.completed_at).format("hh:mm:ss A"),
            width: 120,
          },
        ] as ColDef<Job>[],
      } as ColGroupDef<Job>,
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <h1 className={title()}>Job</h1>
      <GridComponent columnDefs={columnDefs} rowData={jobs} />
    </div>
  );
}
