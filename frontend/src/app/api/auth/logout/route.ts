import { api } from "@/lib/api";

export const POST = async () => {
  const response = await api.post("/auth/logout");
  return response;
};
