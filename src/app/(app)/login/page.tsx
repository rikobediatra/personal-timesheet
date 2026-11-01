import dynamic from "next/dynamic";
import { PageLoading } from "@/shared/components";

const LoginPage = dynamic(
  () => import("@/features/auth").then((m) => m.LoginPage),
  { loading: () => <PageLoading /> },
);

export default function Page() {
  return <LoginPage />;
}
