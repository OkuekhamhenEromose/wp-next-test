/**
 * PostList — pure presentational component.
 * Handles all three render states: loading skeleton, error, data (including empty).
 *
 * @param {{
 *   posts:     import('../lib/types').Post[],
 *   isLoading: boolean,
 *   error:     string|null
 * }} props
 */
export default function PostList({ posts, isLoading, error }) {
  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <ul className="post-list" aria-busy="true">
        {[1, 2, 3].map((n) => (
          <li key={n} className="post-item post-item--skeleton">
            <div className="skeleton-title" />
            <div className="skeleton-meta" />
          </li>
        ))}
      </ul>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="state-box state-box--error" role="alert">
        <span className="state-icon">⚠</span>
        <p>{error}</p>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (!posts || posts.length === 0) {
    return (
      <div className="state-box state-box--empty">
        <p>No posts found. Publish some posts in WordPress to see them here.</p>
      </div>
    );
  }

  // ── Data ─────────────────────────────────────────────────────────────────
  return (
    <ul className="post-list">
      {posts.map((post) => (
        <li key={post.id} className="post-item">
          <article>
            <h2 className="post-title">{post.title}</h2>
            <time className="post-meta" dateTime={post.date}>
              {formatDate(post.date)}
            </time>
          </article>
        </li>
      ))}
    </ul>
  );
}

/** @param {string} iso */
function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}