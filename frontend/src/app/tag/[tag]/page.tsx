import { api } from "@/lib/api";
import { Post } from "@/types/post";

export default async function Tag({ params }: { params: { tag: string } }) {
  const { data: posts } = await api.get<Post[]>(`/posts?tag=${params.tag}`);
  return (
    <>
      {posts.map((p: Post) => (
        <a key={p.id} href={`/blog/${p.slug}`}>
          {p.title}
        </a>
      ))}
    </>
  );
}
