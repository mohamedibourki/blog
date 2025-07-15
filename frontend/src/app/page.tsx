// import { api } from "@/lib/api";
// import { Post } from "@/types/post";
import { Blog8 } from "@/components/blog8";

export default async function Home() {
  // const { data: posts } = await api.get("/posts");
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Blog8 />
    </main>
  );
}
