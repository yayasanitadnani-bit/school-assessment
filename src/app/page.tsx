import { redirect } from "next/navigation";

export default function RootPage() {
  // Arahkan setiap orang yang membuka "/" langsung ke "/login"
  redirect("/login");
}
