import { categoryLabel, formatDate, imageUrl, type PostSummary } from "@/lib/blogFormat";
import styles from "./Blog.module.css";

export default function PostCard({ post }: { post: PostSummary }) {
  return (
    <a href={`/blogs/${post.slug}`} className={styles.card}>
      <div className={styles.cardMedia}>
        {post.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl(post.image, 800, 800)} alt="" loading="lazy" />
        )}
      </div>
      <p className={styles.meta}>
        {post.category && <span>{categoryLabel(post.category)}</span>}
        <span>{formatDate(post.date)}</span>
      </p>
      <h3 className={styles.cardTitle}>{post.title}</h3>
    </a>
  );
}
