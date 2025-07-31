"use client";
import JobPage from "./job/page";
import WorkerPage from "./worker/page";

export default function Home() {
  return (
    <section className="h-full w-full flex flex-col lg:flex-row gap-4 pt-8">
      <div className="flex w-full lg:w-3/4 flex-col">
        <JobPage />
      </div>
      <div className="w-full lg:w-1/4 flex flex-col">
        <WorkerPage />
      </div>
    </section>
  );
}
