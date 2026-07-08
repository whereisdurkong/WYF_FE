import { useEffect, useRef, useState } from "react";
import axios from "axios";
import config from "../../config";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
    { key: "shirt", label: "Shirts", value: 'tshirt' },
    { key: "hoodie", label: "Hoodies", value: 'hoodies_jackets' },
    { key: "bottoms", label: "Bottoms", value: 'bottoms' },
    { key: "footwear", label: "Footwear", value: 'footwear' },
];

const btnStyle = `
    .na-shop-b-btn {
        position: relative;
        display: inline-block;
        padding: 13px 48px;
        background-color: #ffffff;
        color: #141414;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 3px;
        text-transform: uppercase;
        border: 2px solid #ffffff;
        cursor: pointer;
        overflow: hidden;
        white-space: nowrap;
        transition: color 0.4s ease, border-color 0.4s ease;
    }
    .na-shop-b-btn::before {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background-color: #ffffff;
        transform: translateX(0%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 0;
    }
    .na-shop-b-btn span {
        position: relative;
        z-index: 1;
        font-family: "Roboto", sans-serif;
    }
    .na-shop-b-btn:hover::before {
        transform: translateX(105%);
    }
    .na-shop-b-btn:hover {
        color: #ffffff;
        border-color: #ffffff;
        background-color: transparent;
    }
    .na-shop-b-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .na-shop-b-btn:disabled:hover::before {
        transform: translateX(0%);
    }
    .na-shop-b-btn:disabled:hover {
        color: #141414;
        background-color: #ffffff;
    }

    /* ── RESPONSIVE ── */
    .setup-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0;
        width: 100%;
    }
    .setup-card {
        position: relative;
        height: 70vh;
        overflow: hidden;
        cursor: pointer;
    }
    .setup-card-content {
        position: absolute;
        bottom: 50px;
        left: 50px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .setup-edit-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        background: rgba(0,0,0,0.6);
        color: #fff;
        font-size: 11px;
        letter-spacing: 1px;
        text-transform: uppercase;
        padding: 6px 12px;
        border: 1px solid rgba(255,255,255,0.4);
    }
    .setup-pending-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        background: #ffb020;
        color: #141414;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        padding: 6px 12px;
    }
    .setup-save-bar {
        position: sticky;
        bottom: 0;
        display: flex;
        justify-content: center;
        gap: 16px;
        padding: 20px 0;
        background: #fff;
    }

    @media (max-width: 768px) {
        .setup-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        .setup-card {
            height: 45vh;
        }
        .setup-card-content {
            bottom: 24px;
            left: 24px;
        }
        .na-shop-b-btn {
            padding: 10px 24px;
            font-size: 10px;
            letter-spacing: 2px;
        }
    }
`;

export default function AdminSetup() {
    const [setupData, setSetupData] = useState(null);
    const [pendingFiles, setPendingFiles] = useState({});   // { shirt: File, hoodie: File, ... }
    const [previews, setPreviews] = useState({});           // { shirt: blobUrl, ... }
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const fileInputs = useRef({});
    const navigate = useNavigate();

    const loadSetup = async () => {
        try {
            const res = await axios.get(`${config.baseApi}/product/get-all-setup`);
            const data = res.data[0] || null;
            setSetupData(data);
        } catch (err) {
            console.log("Unable to fetch product setup images");
        }
    };

    useEffect(() => {
        loadSetup();
    }, []);

    // Clean up object URLs when they're replaced/unmounted
    useEffect(() => {
        return () => {
            Object.values(previews).forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const handleCardClick = (key) => {
        if (!editMode) return;
        fileInputs.current[key]?.click();
    };

    const handleFileChange = (key, e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPendingFiles(prev => ({ ...prev, [key]: file }));
        setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
        // reset so selecting the same file again still fires onChange
        e.target.value = "";
    };

    const handleCancel = () => {
        Object.values(previews).forEach(url => URL.revokeObjectURL(url));
        setPendingFiles({});
        setPreviews({});
        setEditMode(false);
    };

    const handleSave = async () => {
        const keys = Object.keys(pendingFiles);
        if (keys.length === 0) {
            setEditMode(false);
            return;
        }

        const formData = new FormData();
        keys.forEach(key => formData.append(key, pendingFiles[key]));

        setSaving(true);
        try {
            await axios.post(`${config.baseApi}/product/update-setup`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await loadSetup();
            Object.values(previews).forEach(url => URL.revokeObjectURL(url));
            setPendingFiles({});
            setPreviews({});
            setEditMode(false);
        } catch (err) {
            console.log("Unable to update product setup images", err);
            alert(err.response?.data?.message || "Failed to update setup images.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <style>{btnStyle}</style>
            <section style={styles.section}>
                <div style={styles.headerRow}>
                    <h2 style={styles.heading}>PRODUCTS</h2>
                    {!editMode && (
                        <button style={styles.editToggle} onClick={() => setEditMode(true)}>
                            Edit images
                        </button>
                    )}
                </div>

                <div className="setup-grid">
                    {CATEGORIES.map(({ key, label, value }) => {
                        const displayImage = previews[key] || setupData?.[key];
                        return (
                            <div
                                key={key}
                                className="setup-card"
                                onClick={() => handleCardClick(key)}
                            >
                                <div
                                    style={{
                                        ...styles.imageLayer,
                                        backgroundImage: displayImage ? `url(${displayImage})` : "none",
                                        backgroundColor: displayImage ? "transparent" : "#222",
                                    }}
                                />
                                <div style={styles.overlay} />

                                {editMode && (
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        ref={el => (fileInputs.current[key] = el)}
                                        onChange={(e) => handleFileChange(key, e)}
                                        style={{ display: "none" }}
                                    />
                                )}

                                {editMode && (
                                    <span className={pendingFiles[key] ? "setup-pending-badge" : "setup-edit-badge"}>
                                        {pendingFiles[key] ? "New image selected" : "Click to change"}
                                    </span>
                                )}

                                <div className="setup-card-content">
                                    <span style={styles.label}>{label}</span>
                                    {!editMode && (
                                        <button
                                            className="na-shop-b-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate('/all-product?category=' + value);
                                            }}
                                        >
                                            <span>View products</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {editMode && (
                    <div className="setup-save-bar">
                        <button
                            className="na-shop-b-btn"
                            style={styles.darkBtn}
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            <span>Cancel</span>
                        </button>
                        <button
                            className="na-shop-b-btn"
                            style={styles.darkBtn}
                            onClick={handleSave}
                            disabled={saving || Object.keys(pendingFiles).length === 0}
                        >
                            <span>{saving ? "Saving..." : "Save changes"}</span>
                        </button>
                    </div>
                )}
            </section>
        </>
    );
}

const styles = {
    section: {
        width: "100%",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        padding: "400px 0",
        backgroundColor: "#fff",
    },
    headerRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        marginBottom: "24px",
    },
    heading: {
        textAlign: "center",
        fontWeight: "700",
        fontSize: "18px",
        letterSpacing: "0.05em",
        margin: 0,
        color: "#000",
    },
    editToggle: {
        position: "absolute",
        right: "24px",
        background: "transparent",
        border: "1px solid #000",
        color: "#000",
        fontSize: "11px",
        letterSpacing: "1px",
        textTransform: "uppercase",
        padding: "8px 16px",
        cursor: "pointer",
    },
    darkBtn: {
        backgroundColor: "#141414",
        color: "#fff",
        borderColor: "#141414",
    },
    imageLayer: {
        position: "absolute",
        inset: 0,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        transition: "transform 0.4s ease",
    },
    overlay: {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
    },
    label: {
        color: "#fff",
        fontWeight: "700",
        fontSize: "18px",
        letterSpacing: "0.01em",
        textShadow: "0 1px 4px rgba(0,0,0,0.4)",
    },
};