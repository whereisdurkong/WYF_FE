import { useEffect, useState } from "react";
import axios from "axios";
import config from "../../config";
import { useNavigate } from "react-router-dom";

const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    .ab-root {
        min-height: 100vh;
        background: #f5f5f5;
        color: #0a0a0a;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        padding: 28px 24px 48px;
        margin-top: 100px;
    }

    .ab-eyebrow {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #aaa;
        margin-bottom: 6px;
    }

    .ab-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        padding-bottom: 20px;
        border-bottom: 2px solid #0a0a0a;
        margin-bottom: 32px;
    }

    .ab-title {
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.5px;
        text-transform: uppercase;
        color: #0a0a0a;
        line-height: 1;
        margin: 0;
    }

    .ab-subtitle {
        font-size: 12px;
        color: #888;
        margin-top: 8px;
        letter-spacing: 0.04em;
    }

    .ab-add-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 11px 24px;
        background-color: #0a0a0a;
        color: #ffffff;
        font-family: inherit;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        border: 1.5px solid #0a0a0a;
        cursor: pointer;
        white-space: nowrap;
        transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
    }
    .ab-add-btn:hover {
        background-color: #fff;
        color: #0a0a0a;
    }
    .ab-add-btn:active {
        transform: scale(0.97);
    }
    .ab-add-btn span.plus {
        font-size: 15px;
        line-height: 1;
        font-weight: 400;
    }

    .ab-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;
    }

    .ab-card {
        display: flex;
        flex-direction: column;
        cursor: pointer;
        background: #fff;
        border: 1px solid #e5e5e5;
        transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    }
    .ab-card:hover {
        border-color: #0a0a0a;
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.06);
    }

    .ab-card-img-wrap {
        position: relative;
        width: 100%;
        height: 220px;
        overflow: hidden;
        background: #ededed;
    }

    .ab-card-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter: grayscale(100%);
        transition: filter 0.5s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .ab-card:hover .ab-card-img {
        filter: grayscale(0%);
        transform: scale(1.06);
    }

    .ab-card-noimg {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ccc;
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
    }

    .ab-date-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        background: rgba(255,255,255,0.9);
        backdrop-filter: blur(3px);
        color: #0a0a0a;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 5px 10px;
    }

    .ab-card-body {
        padding: 20px 22px 22px;
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .ab-card-title {
        font-size: 17px;
        font-weight: 800;
        color: #0a0a0a;
        margin-bottom: 8px;
        line-height: 1.35;
        letter-spacing: -0.01em;
    }

    .ab-card-excerpt {
        font-size: 13px;
        color: #666;
        line-height: 1.65;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-bottom: 16px;
        flex: 1;
    }

    .ab-read-more {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #0a0a0a;
        margin-top: auto;
        text-decoration: none;
    }

    .ab-read-more .arrow {
        transition: transform 0.2s ease;
    }
    .ab-card:hover .ab-read-more .arrow {
        transform: translateX(4px);
    }

    .ab-loading, .ab-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 50vh;
        flex-direction: column;
        gap: 16px;
        color: #888;
        font-size: 13px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    .ab-spinner {
        width: 28px;
        height: 28px;
        border: 2px solid #e5e5e5;
        border-top: 2px solid #0a0a0a;
        border-radius: 50%;
        animation: ab-spin 0.8s linear infinite;
    }

    @keyframes ab-spin { to { transform: rotate(360deg); } }

    @media (max-width: 900px) {
        .ab-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
        .ab-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
        }
        .ab-grid { grid-template-columns: 1fr; }
    }
`;

function formatDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d)) return null;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminBlog() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/blog/get-all-blog`);
                const data = res.data || [];
                const sorted = [...data].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                setBlogs(sorted);
            } catch (err) {
                console.log("Unable to fetch all blog details");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return (
        <div className="ab-root">
            <style>{STYLES}</style>

            <div className="ab-header">
                <div>
                    <div className="ab-eyebrow">Content</div>
                    <h1 className="ab-title">Blog Manager</h1>
                    <p className="ab-subtitle">
                        {blogs.length} {blogs.length === 1 ? "post" : "posts"} published
                    </p>
                </div>
                <button className="ab-add-btn" onClick={() => navigate('/admin/admin-blog-add')}>
                    <span className="plus">+</span>
                    <span>Add Blog</span>
                </button>
            </div>

            {loading ? (
                <div className="ab-loading">
                    <div className="ab-spinner" />
                    <span>Loading posts</span>
                </div>
            ) : !blogs.length ? (
                <div className="ab-empty">No blogs yet. Add your first post to get started.</div>
            ) : (
                <div className="ab-grid">
                    {blogs.map((blog, index) => {
                        let images = [];
                        try {
                            images = JSON.parse(blog.album || "[]");
                        } catch {
                            images = [];
                        }
                        const imageUrl = images[0] || null;
                        const dateLabel = formatDate(blog.created_at);

                        return (
                            <div
                                key={blog.blog_id ?? index}
                                className="ab-card"
                                onClick={() => navigate('/admin/admin-blog-view?id=' + blog.blog_id)}
                            >
                                <div className="ab-card-img-wrap">
                                    {imageUrl ? (
                                        <img className="ab-card-img" src={imageUrl} alt={blog.title} />
                                    ) : (
                                        <div className="ab-card-noimg">No image</div>
                                    )}
                                    {dateLabel && <div className="ab-date-badge">{dateLabel}</div>}
                                </div>

                                <div className="ab-card-body">
                                    <div className="ab-card-title">{blog.title}</div>
                                    <div
                                        className="ab-card-excerpt"
                                        dangerouslySetInnerHTML={{ __html: blog.content }}
                                    />
                                    <span className="ab-read-more">
                                        Read more <span className="arrow">→</span>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}