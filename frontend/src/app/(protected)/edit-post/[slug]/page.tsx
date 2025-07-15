"use client";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditPost() {
  const slug = useParams().slug as string;
  const [post, setPost] = useState({ title: "", body: "" });
  const router = useRouter();

  useEffect(() => {
    api.get(`/posts/${slug}`).then((r) => setPost(r.data));
  }, [slug]);

  const handle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await api.patch(`/posts/${slug}`, post);
    router.push(`/blog/${slug}`);
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <input
        value={post.title}
        onChange={(e) => setPost({ ...post, title: e.target.value })}
      />
      <textarea
        value={post.body}
        onChange={(e) => setPost({ ...post, body: e.target.value })}
      />
      <button>Save</button>
    </form>
  );
}
