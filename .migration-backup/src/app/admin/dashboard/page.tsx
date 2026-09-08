import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("portfolio_admin")?.value === "true";
  if (!isAdmin) redirect("/edit");

  redirect("/edit");
}
