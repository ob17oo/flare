import { getAllUsers } from "@/entities/admin/api/users.action";
import { UsersClient } from "@/views/admin/users/UsersClient";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const initialData = await getAllUsers();

  return <UsersClient initialData={initialData} />;
}
