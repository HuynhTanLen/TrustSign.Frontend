import { GatewayStatus } from "@/components/gateway-status";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Chữ Tín</h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Hệ thống ký kết hợp đồng điện tử.
      </p>
      <GatewayStatus />
    </main>
  );
}
