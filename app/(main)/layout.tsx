import NavigationSidebar from "@/components/navigation/navigation-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/splash");
  }

  return (
    <div className="h-full">
      <div className="max-md:hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <main className="md:pl-[72px] h-full">{children}</main>
    </div>
  );
}
