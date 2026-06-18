import { AppNav } from "@/components/app-nav";
import { StaffBoard } from "@/components/staff-board";

export default function StaffOrdersPage() {
  return (
    <>
      <AppNav />
      <main className="px-6 py-8">
        <div className="mx-auto mb-6 max-w-[90rem]">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Demo Coffee · live queue
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Staff order board
          </h1>
        </div>
        <div className="mx-auto max-w-[90rem] overflow-x-auto pb-4">
          <StaffBoard />
        </div>
      </main>
    </>
  );
}
