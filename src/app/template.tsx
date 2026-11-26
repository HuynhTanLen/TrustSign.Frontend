export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="motion-safe:animate-fade-in flex-1 flex flex-col">{children}</div>;
}
