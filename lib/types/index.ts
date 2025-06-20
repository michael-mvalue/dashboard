import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Job {
  _id: string;
  job_id: string;
  worker_id: string;
  bucket_name: string;
  timestamps: {
    created_at: string;
    assigned_at: string;
    completed_at: null | string;
  };
  errors: string;
  logs: string;
  s3_key: string;
  status: "running" | "pending" | "completed";
}

export interface Worker {
  _id: string;
  worker_id: string;
  status: "idle" | "busy";
  last_heartbeat: string;
  current_job_id: string | null;
  updated_at: string;
}
