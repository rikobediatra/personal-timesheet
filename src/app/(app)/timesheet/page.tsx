import dynamic from "next/dynamic";
import { PageLoading } from "@/shared/components";

const TimesheetPage = dynamic(
  () => import("@/features/timesheet").then((m) => m.TimesheetPage),
  { loading: () => <PageLoading /> },
);

export default function Page() {
  return <TimesheetPage />;
}
