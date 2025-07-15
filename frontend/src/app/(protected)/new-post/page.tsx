"use client";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NewPost() {
  const router = useRouter();

  const handle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const { data } = await api.post("/posts", {
      title: fd.get("title"),
      body: fd.get("body"),
    });

    router.push(`/blog/${data.slug}`);
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <input name="title" required placeholder="Title" />
      <textarea name="body" required placeholder="Body" />
      <button>Publish</button>
    </form>
  );
}
