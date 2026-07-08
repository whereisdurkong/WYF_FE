import axios from "axios";
import config from "../../config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const styleTag = `
    .cm-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
     
        margin-bottom: 24px;
        border-bottom: 2px solid #0a0a0a;
        padding-bottom: 16px;
    }
    .cm-heading {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-weight: 800;
        font-size: 22px;
        letter-spacing: -0.5px;
        text-transform: uppercase;
        color: #0a0a0a;
        margin: 0;
    }
    .cm-subheading {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 12px;
        color: #888;
        margin-top: 4px;
        letter-spacing: 0.04em;
    }
    .cm-add-btn {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background-color: #3b3b3b;
        color: #ffffff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: normal;
        text-transform: none;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        overflow: hidden;
        white-space: nowrap;
        transition: background 0.2s ease;
        z-index: 0;
    }
    .cm-add-btn:hover {
        background-color: #0a0a0a;
    }
    .cm-add-btn span.plus {
        font-size: 16px;
        line-height: 1;
        font-weight: 400;
    }

    .cm-card {
        position: relative;
        overflow: hidden;
        cursor: pointer;
        aspect-ratio: 1 / 1;
        background-color: #ededed;
    }
    .cm-card-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cm-card:hover .cm-card-img {
        transform: scale(1.06);
    }
    .cm-card-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 45%, transparent 70%);
        opacity: 0.85;
        transition: opacity 0.4s ease;
    }
    .cm-card:hover .cm-card-overlay {
        opacity: 1;
    }
    .cm-status-pill {
        position: absolute;
        top: 18px;
        right: 18px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        background: rgba(0,0,0,0.45);
        backdrop-filter: blur(4px);
        border-radius: 20px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        color: #fff;
    }
    .cm-status-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
    }
    .cm-card-title {
        position: absolute;
        bottom: 28px;
        left: 28px;
        right: 28px;
        color: #fff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.01em;
        text-shadow: 0 1px 6px rgba(0,0,0,0.4);
    }
    .cm-empty {
        grid-column: 1 / -1;
        text-align: center;
        padding: 100px 20px;
        color: #999;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        letter-spacing: 0.02em;
    }

    @media (max-width: 900px) {
        .cm-grid {
            grid-template-columns: repeat(2, 1fr) !important;
        }
    }
    @media (max-width: 600px) {
        .cm-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
            padding: 0 24px;
            padding-bottom: 16px;
        }
        .cm-grid {
            grid-template-columns: 1fr !important;
            padding: 0 24px !important;
        }
    }
`;

export default function AdminCollection() {
    const [collections, setCollections] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/product/get-all-collection`);
                setCollections(res.data || []);
            } catch (err) {
                console.log("Unable to fetch data: ", err);
            }
        };
        fetch();
    }, []);

    return (
        <div style={{
            backgroundColor: "#fff", paddingTop: "100px", paddingBottom: "48px", paddingLeft: "24px",
            paddingRight: "24px",
        }}>
            <style>{styleTag}</style>

            <div className="cm-header">
                <div>
                    <h1 className="cm-heading">Collection Manager</h1>
                    <p className="cm-subheading">
                        {collections.length} {collections.length === 1 ? "collection" : "collections"} total
                    </p>
                </div>
                <button
                    className="cm-add-btn"
                    onClick={() => navigate('/admin/admin-collection-add')}
                >
                    <span className="plus">+</span>
                    <span>Add Collection</span>
                </button>
            </div>

            <div className="cm-grid" style={styles.grid}>
                {collections.length === 0 && (
                    <div className="cm-empty">No collections yet. Add your first one to get started.</div>
                )}

                {collections.map((col) => (
                    <div
                        key={col.collection_id}
                        className="cm-card"
                        onClick={() => navigate('/admin/admin-collection-view?id=' + col.collection_id)}
                    >
                        <img
                            className="cm-card-img"
                            src={col.collection_images}
                            alt={col.collection_title}
                        />
                        <div className="cm-card-overlay" />
                        <div className="cm-status-pill">
                            <span
                                className="cm-status-dot"
                                style={{ backgroundColor: col.is_active === '1' ? '#3ecf6a' : '#8a8a8a' }}
                            />
                            {col.is_active === '1' ? 'Active' : 'Inactive'}
                        </div>
                        <div className="cm-card-title">{col.collection_title}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "30px",

    },
};