"use client";
import { api } from "@/lib/api";
import { Post } from "@/types/post";
import { useState } from "react";

export default function Search() {
  const [q, setQ] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);

  const search = async () => {
    const { data } = await api.get(`/posts/search?q=${q}`);
    setPosts(data);
  };

  return (
    <>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search…"
      />
      <button onClick={search}>Go</button>
      {posts.map((p: Post) => (
        <div key={p.id}>
          <a href={`/blog/${p.slug}`}>{p.title}</a>
        </div>
      ))}
    </>
  );
}
