import { api } from "@/lib/api";
export default async function Profile() {
  const { data: user } = await api.get("/me");
  return <h1>Hello {user.username}</h1>;
}
