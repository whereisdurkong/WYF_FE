import { useState, useRef } from "react";
import axios from "axios";
import config from "../../config";
import Loading from "../../components/Loading";
import { Toast } from '../../components/Notification';
import ShopSetupProduct from "../dashboard/shop-setupProduct";

// ── Constants ───────────────────────────────────────────────────────

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 5;

function validateImageFile(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) return "Only JPG, PNG, or WebP images are allowed.";
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `File must be under ${MAX_FILE_SIZE_MB}MB.`;
    return null;
}

const categories = [
    { key: "shirt", label: "Shirt", tag: "SHIRT" },
    { key: "hoodie", label: "Hoodie", tag: "HOODIE" },
    { key: "bottoms", label: "Bottoms", tag: "BOTTOMS" },
    { key: "footwear", label: "Footwear", tag: "FOOTWEAR" },
];

// ── Icons ───────────────────────────────────────────────────────────

const UploadIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 16V4M12 4L7 9M12 4l5 5" />
        <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </svg>
);

const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

// ── Styles ──────────────────────────────────────────────────────────

const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .as-root {
        min-height: 100vh;
        background: #f5f5f5;
        color: #0a0a0a;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        padding: 28px 24px;
        margin-top: 100px;
    }

  .as-inner {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
    /* Page header */
    .as-eyebrow {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #aaa;
        margin-bottom: 6px;
    }

    .as-page-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        padding-bottom: 20px;
        border-bottom: 2px solid #0a0a0a;
        margin-bottom: 28px;
    }

    .as-page-title {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.5px;
        text-transform: uppercase;
        color: #0a0a0a;
        line-height: 1;
    }

    .as-page-subtitle {
        font-size: 12px;
        color: #888;
        font-weight: 400;
        margin-top: 8px;
        letter-spacing: 0.04em;
    }

    .as-progress-wrap {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
    }

    .as-progress-count {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.06em;
        color: #555;
    }

    .as-progress-count b {
        color: #0a0a0a;
        font-weight: 800;
    }

    .as-progress-dots {
        display: flex;
        gap: 6px;
    }

    .as-progress-dot {
        width: 22px;
        height: 4px;
        background: #e0e0e0;
        transition: background 0.25s ease;
    }

    .as-progress-dot.filled {
        background: #0a0a0a;
    }

    /* Card */
    .as-card {
        background: #fff;
        border: 1px solid #e0e0e0;
        // border-top: 3px solid #0a0a0a;
        padding: 32px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .as-card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 24px;
    }

    .as-card-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #888;
    }

    .as-card-divider {
        flex: 1;
        height: 1px;
        background: #e0e0e0;
    }

    /* Upload grid */
    .as-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
    }

    /* Upload tile */
    .as-tile {
        display: flex;
        flex-direction: column;
    }

    .as-tile-drop {
        border: 1.5px dashed #d5d5d5;
        height: 260px;
        cursor: pointer;
        background: #fafafa;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
    }

    .as-tile-drop:hover {
        border-color: #0a0a0a;
        background: #f2f2f2;
        transform: translateY(-2px);
    }

    .as-tile-drop.dragging {
        border-color: #0a0a0a;
        border-style: solid;
        background: #eee;
        transform: scale(1.01);
    }

    .as-tile-drop.has-error {
        border-color: #c0392b;
        border-style: solid;
        background: #fdf3f2;
    }

    .as-tile-drop.has-preview {
        cursor: default;
        border: none;
    }

    .as-tile-drop.has-preview:hover {
        transform: none;
    }

    .as-tile-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .as-tile-drop.has-preview:hover .as-tile-preview {
        transform: scale(1.05);
    }

    .as-tile-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 45%, transparent 65%);
        pointer-events: none;
    }

    .as-tile-remove {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(10,10,10,0.6);
        backdrop-filter: blur(3px);
        color: #fff;
        border: none;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s;
        line-height: 1;
    }

    .as-tile-remove:hover {
        background: #c0392b;
    }

    .as-tile-overlay-label {
        position: absolute;
        left: 14px;
        bottom: 12px;
        right: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .as-tile-overlay-name {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #fff;
        text-shadow: 0 1px 4px rgba(0,0,0,0.4);
    }

    .as-tile-ready {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #3ecf6a;
        color: #fff;
    }

    .as-tile-empty {
        text-align: center;
        color: #aaa;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 16px;
    }

    .as-tile-icon {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #fff;
        border: 1px solid #e5e5e5;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        transition: color 0.2s ease, border-color 0.2s ease;
    }

    .as-tile-drop:hover .as-tile-icon {
        color: #0a0a0a;
        border-color: #0a0a0a;
    }

    .as-tile-tag {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.14em;
        color: #fff;
        background: #0a0a0a;
        padding: 3px 8px;
        display: inline-block;
    }

    .as-tile-hint {
        font-size: 11px;
        color: #aaa;
        line-height: 1.5;
    }

    .as-tile-hint span {
        color: #0a0a0a;
        font-weight: 500;
        text-decoration: underline;
        cursor: pointer;
    }

    .as-tile-meta {
        font-size: 10px;
        color: #bbb;
        letter-spacing: 0.02em;
    }

    .as-tile-error {
        font-size: 10px;
        color: #c0392b;
        padding: 8px 2px 0;
        letter-spacing: 0.01em;
        font-weight: 500;
    }

    /* Actions row */
    .as-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 28px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
    }

    .as-hint-text {
        font-size: 11px;
        color: #bbb;
    }

    /* Save button */
    .as-save-btn {
        background: #0a0a0a;
        color: #fff;
        border: 1.5px solid #0a0a0a;
        padding: 11px 30px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.15s, color 0.15s, transform 0.15s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }

    .as-save-btn:hover:not(:disabled) {
        background: #fff;
        color: #0a0a0a;
    }

    .as-save-btn:active:not(:disabled) {
        transform: scale(0.97);
    }

    .as-save-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    /* Preview section */
    .as-preview-section {
        margin-top: 36px;
    }

    .as-preview-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
    }

    .as-preview-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #888;
    }

    .as-preview-divider {
        flex: 1;
        height: 1px;
        background: #e0e0e0;
    }

    .as-preview-inner {
        border: 1px solid #e0e0e0;
        border-top: 3px solid #0a0a0a;
        overflow: hidden;
        background: #fff;
    }

    /* Toast */
    .as-toast-wrap {
        position: fixed;
        bottom: 20px;
        right: 24px;
        z-index: 9999;
        width: 340px;
        pointer-events: none;
    }

    .as-toast-wrap > div {
        pointer-events: auto;
    }

    @media (max-width: 900px) {
        .as-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 560px) {
        .as-page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
        }
        .as-progress-wrap {
            align-items: flex-start;
        }
        .as-grid {
            grid-template-columns: 1fr;
        }
    }
`;

// ── Sub-components ──────────────────────────────────────────────────

function ImageUploadCard({ label, tag, preview, error, onFileChange, onRemove }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const handleFiles = (files) => {
        const file = files[0];
        if (!file) return;
        const err = validateImageFile(file);
        if (err) { onFileChange(null, err); return; }
        onFileChange(file, null);
    };

    let dropClass = "as-tile-drop";
    if (dragging) dropClass += " dragging";
    if (error) dropClass += " has-error";
    if (preview) dropClass += " has-preview";

    return (
        <div className="as-tile">
            <div
                className={dropClass}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => !preview && inputRef.current?.click()}
            >
                {preview ? (
                    <>
                        <img className="as-tile-preview" src={preview} alt={label} />
                        <div className="as-tile-overlay" />
                        <button
                            type="button"
                            className="as-tile-remove"
                            onClick={e => { e.stopPropagation(); onRemove(); }}
                            title={`Remove ${label}`}
                        >×</button>
                        <div className="as-tile-overlay-label">
                            <span className="as-tile-overlay-name">{label}</span>
                            <span className="as-tile-ready"><CheckIcon /></span>
                        </div>
                    </>
                ) : (
                    <div className="as-tile-empty">
                        <span className="as-tile-tag">{tag}</span>
                        <div className="as-tile-icon"><UploadIcon /></div>
                        <div className="as-tile-hint">
                            Drop image or{" "}
                            <span onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>
                                browse
                            </span>
                        </div>
                        <div className="as-tile-meta">JPG · PNG · WebP — {MAX_FILE_SIZE_MB}MB max</div>
                    </div>
                )}
            </div>

            {error && <div className="as-tile-error">{error}</div>}

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                style={{ display: "none" }}
                onChange={e => handleFiles(e.target.files)}
            />
        </div>
    );
}

function SaveButton({ loading, onClick }) {
    return (
        <button
            type="button"
            className="as-save-btn"
            onClick={onClick}
            disabled={loading}
        >
            {loading ? (
                <>
                    <span style={{
                        display: "inline-block",
                        width: 10, height: 10,
                        border: "1.5px solid currentColor",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "as-spin 0.7s linear infinite",
                    }} />
                    Saving
                </>
            ) : "Save setup"}
        </button>
    );
}

function PreviewSection({ refreshKey }) {
    return (
        <div className="as-preview-section">
            <div className="as-preview-header">
                <span className="as-preview-label">Preview</span>
                <div className="as-preview-divider" />
            </div>
            <div className="as-preview-inner">
                <ShopSetupProduct key={refreshKey} />
            </div>
        </div>
    );
}

// ── Main ────────────────────────────────────────────────────────────

export default function AddSetup() {
    const [files, setFiles] = useState({});
    const [previews, setPreviews] = useState({});
    const [fileErrors, setFileErrors] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshPreview, setRefreshPreview] = useState(0);

    if (loading) return <Loading />;

    const addNotif = (title, message, type) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, title, message, type }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
    };

    const handleFileChange = (key, file, err) => {
        if (err) {
            setFileErrors(prev => ({ ...prev, [key]: err }));
            return;
        }
        setFiles(prev => ({ ...prev, [key]: file }));
        setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
        setFileErrors(prev => ({ ...prev, [key]: null }));
    };

    const handleRemove = (key) => {
        if (previews[key]) URL.revokeObjectURL(previews[key]);
        setFiles(prev => { const n = { ...prev }; delete n[key]; return n; });
        setPreviews(prev => { const n = { ...prev }; delete n[key]; return n; });
        setFileErrors(prev => ({ ...prev, [key]: null }));
    };

    const handleSave = async () => {
        const hasAny = categories.some(({ key }) => files[key]);
        if (!hasAny) {
            addNotif("Nothing to save", "Upload at least one image before saving.", "error");
            return;
        }

        const formData = new FormData();
        categories.forEach(({ key }) => {
            if (files[key]) formData.append(key, files[key]);
        });

        setLoading(true);
        try {
            await axios.post(`${config.baseApi}/product/add-setup`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            addNotif("Saved", "Setup images have been updated.", "success");
            setRefreshPreview(prev => prev + 1);
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Server error.";
            addNotif("Something went wrong", msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const uploadedCount = categories.filter(({ key }) => previews[key]).length;

    return (
        <div className="as-root">
            <style>{STYLES}</style>
            <style>{`@keyframes as-spin { to { transform: rotate(360deg); } }`}</style>

            {/* Toasts */}
            <div className="as-toast-wrap">
                {notifications.map(n => (
                    <div key={n.id}>
                        <Toast {...n} onDismiss={id => setNotifications(prev => prev.filter(n => n.id !== id))} />
                    </div>
                ))}
            </div>

            <div className="as-inner">

                {/* Page header */}
                <div className="as-page-header">
                    <div>
                        <div className="as-eyebrow">Shop Configuration</div>
                        <div className="as-page-title">Shop Setup</div>
                        <div className="as-page-subtitle">Upload one image per clothing category</div>
                    </div>
                    <div className="as-progress-wrap">
                        <span className="as-progress-count">
                            <b>{uploadedCount}</b> / {categories.length} uploaded
                        </span>
                        <div className="as-progress-dots">
                            {categories.map(({ key }) => (
                                <div key={key} className={`as-progress-dot${previews[key] ? " filled" : ""}`} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Upload card */}
                <div className="as-card">
                    <div className="as-card-header">
                        <span className="as-card-label">Category Images</span>
                        <div className="as-card-divider" />
                    </div>

                    <div className="as-grid">
                        {categories.map(({ key, label, tag }) => (
                            <ImageUploadCard
                                key={key}
                                label={label}
                                tag={tag}
                                preview={previews[key]}
                                error={fileErrors[key]}
                                onFileChange={(file, err) => handleFileChange(key, file, err)}
                                onRemove={() => handleRemove(key)}
                            />
                        ))}
                    </div>

                    <div className="as-actions">
                        <span className="as-hint-text">Changes are saved immediately on upload</span>
                        <SaveButton loading={loading} onClick={handleSave} />
                    </div>
                </div>

                {/* Preview */}
                <PreviewSection refreshKey={refreshPreview} />

            </div>
        </div>
    );
}