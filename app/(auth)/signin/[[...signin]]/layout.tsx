export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="p-6 w-full flex justify-center items-center">
      {children}
    </section>
  );
}
