import { title } from "@/lib/components/primitives";

export default function Home() {
  return (
    <section className="h-full w-full flex flex-col items-center gap-4 py-8 md:py-10 pt-44 md:pt-64">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title({ color: "violet" })}>PioSolver&nbsp;</span>
        <span className={title()}>Dashboard</span>
      </div>
    </section>
  );
}
