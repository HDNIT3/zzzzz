import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function EditBasic() {
    const { user } = useContext(AuthContext);
    const accountId = user?.accountId;
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        facebookUrl: "",
        instagramUrl: "",
        twitterUrl: "",
        linkedInUrl: "",
    });
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        const load = async () => {
            if (!accountId) { setLoading(false); return; }
            try {
                const res = await fetch(`http://localhost:8080/api/profile/me?accountId=${accountId}`);
                const data = await res.json();
                setForm({
                    fullName: data.fullName || "",
                    facebookUrl: data.facebookUrl || "",
                    instagramUrl: data.instagramUrl || "",
                    twitterUrl: data.twitterUrl || "",
                    linkedInUrl: data.linkedInUrl || "",
                });
            } catch {
                setMsg("Không tải được dữ liệu.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [accountId]);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!accountId) return;

        const body = { accountId, ...form };
        try {
            const res = await fetch("http://localhost:8080/api/profile/me/update-basic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setMsg("✅ Đã lưu!");
            setTimeout(() => navigate("/prof"), 600);
        } catch (err) {
            setMsg("❌ Lưu thất bại.");
            console.log(err);
        }
    };

    if (!accountId) return <div className="container my-4">Chưa đăng nhập.</div>;
    if (loading) return <div className="container my-4">Đang tải...</div>;

    return (
        <div className="container my-4">
            <h3 className="mb-3">Cập nhật thông tin cơ bản</h3>
            <form onSubmit={onSubmit} className="bg-dark text-white p-4 rounded-3" style={{ maxWidth: 720 }}>
                <div className="mb-3">
                    <label className="form-label">Họ tên</label>
                    <input name="fullName" value={form.fullName} onChange={onChange} className="form-control" />
                </div>

                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Facebook URL</label>
                        <input name="facebookUrl" value={form.facebookUrl} onChange={onChange} className="form-control" />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Instagram URL</label>
                        <input name="instagramUrl" value={form.instagramUrl} onChange={onChange} className="form-control" />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Twitter URL</label>
                        <input name="twitterUrl" value={form.twitterUrl} onChange={onChange} className="form-control" />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">LinkedIn URL</label>
                        <input name="linkedInUrl" value={form.linkedInUrl} onChange={onChange} className="form-control" />
                    </div>
                </div>

                <div className="d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-primary">Lưu</button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate("/prof")}>Hủy</button>
                </div>

                {msg && <div className="mt-3">{msg}</div>}
            </form>
        </div>
    );
}
