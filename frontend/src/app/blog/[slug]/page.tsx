import { api } from "@/lib/api";
import type { Post } from "@/types/post";

export default async function Post({ params }: { params: { slug: string } }) {
  const { data: post } = await api.get<Post>(`/posts/${params.slug}`);
  return (
    <article>
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
