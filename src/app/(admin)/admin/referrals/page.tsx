import { ReferralsClient } from "@/views/admin/referrals/ReferralsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Рефералы | Админ-панель Flare",
};

export default function AdminReferralsPage() {
  return <ReferralsClient />;
}
