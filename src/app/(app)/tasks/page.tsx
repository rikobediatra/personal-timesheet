import dynamic from "next/dynamic";
import { PageLoading } from "@/shared/components";

const TasksPage = dynamic(
  () => import("@/features/tasks").then((m) => m.TasksPage),
  { loading: () => <PageLoading /> },
);

export default function Page() {
  return <TasksPage />;
}
