import { Web3Provider } from "@/src/components/shared/web3-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Web3Provider>{children}</Web3Provider>;
}
