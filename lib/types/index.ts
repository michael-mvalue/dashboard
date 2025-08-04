import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type JobStatus = "running" | "pending" | "done";
export interface Job {
  _id: string;
  file_content?: string;
  result_content?: string;
  result?: string;
  job_id: string;
  worker_id: string;
  bucket_name: string;
  timestamps: {
    assigned_at: string;
    updated_at: string;
    started_at: null | string;
    completed_at: null | string;
  };
  errors: string;
  logs: string[];
  s3_key: string;
  result_s3_key?: string;
  status: JobStatus;
}

export type WorkerStatus = "idle" | "busy" | "offline";

export interface Worker {
  _id: string;
  worker_id: string;
  status: WorkerStatus;
  last_heartbeat: string;
  current_job_id: string | null;
  updated_at: string;
}

export interface Pagination {
  currentPage: number;
  haxNextPage: boolean;
  hasPrevPage: boolean;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface WebsocketResponse {
  type: string;
}
export interface JobWsData extends WebsocketResponse {
  payload: {
    data: Job[];
    pagination: Pagination;
  };
}
