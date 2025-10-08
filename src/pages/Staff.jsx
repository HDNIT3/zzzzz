import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getEmployees, createEmployee, updateEmployee } from "../services/EmployeeService";

export default function Staff() {
    const emptyForm = {
        employeeId: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        position: "",
        username: "",
    };

    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const load = async (q = "") => {
        try {
            setLoading(true);
            const data = await getEmployees(q);
            setEmployees(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            if (editing) {
                const res = await updateEmployee(form.employeeId, form);
                if (res?.success) {
                    setMessage("Updated successfully");
                    await load(search);
                    onReset();
                } else {
                    setMessage(res?.message || "Update failed");
                }
            } else {
                const res = await createEmployee(form);
                if (res?.success) {
                    setMessage("Created successfully");
                    await load(search);
                    onReset();
                } else {
                    setMessage(res?.message || "Create failed");
                }
            }
        } catch (e) {
            console.error(e);
            setMessage("Request failed");
        }
    };

    const onEdit = (emp) => {
        setForm({
            employeeId: emp.employeeId,
            fullName: emp.fullName || "",
            email: emp.email || "",
            phoneNumber: emp.phoneNumber || "",
            dateOfBirth: emp.dateOfBirth || "",
            position: emp.position || "",
            username: emp.username || "",
        });
        setEditing(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onReset = () => {
        setForm(emptyForm);
        setEditing(false);
    };

    const onSearch = async (e) => {
        e.preventDefault();
        await load(search);
    };

    return (
        <div className="container py-4">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white text-center">
                    <h3 className="mb-0">Quản lý nhân viên</h3>
                </div>
                <div className="card-body">
                    {message && (
                        <div className="alert alert-info py-2 px-3" role="alert">
                            {message}
                        </div>
                    )}
                    <form onSubmit={onSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Họ và tên</label>
                                <input
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={onChange}
                                    className="form-control"
                                    placeholder="Nhập tên nhân viên"
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={onChange}
                                    className="form-control"
                                    placeholder="Email"
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">Số điện thoại</label>
                                <input
                                    name="phoneNumber"
                                    value={form.phoneNumber}
                                    onChange={onChange}
                                    className="form-control"
                                    placeholder="Số điện thoại"
                                    required
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Ngày sinh</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={form.dateOfBirth}
                                    onChange={onChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Vị trí</label>
                                <input
                                    name="position"
                                    value={form.position}
                                    onChange={onChange}
                                    className="form-control"
                                    placeholder="VD: Cashier"
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Username</label>
                                <input
                                    name="username"
                                    value={form.username}
                                    onChange={onChange}
                                    className="form-control"
                                    placeholder="Tên đăng nhập (tạo tài khoản STAFF)"
                                    required
                                    disabled={editing} // không thay username khi update cho đơn giản
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Mật khẩu mặc định</label>
                                <input
                                    className="form-control"
                                    value="12345678"
                                    disabled
                                />
                                <div className="form-text">Mật khẩu mặc định cho tài khoản mới là 12345678</div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-3">
                            {editing && (
                                <button type="button" onClick={onReset} className="btn btn-secondary">
                                    Hủy
                                </button>
                            )}
                            <button type="submit" className={`btn ${editing ? "btn-warning" : "btn-primary"}`}>
                                {editing ? "Cập nhật" : "Thêm mới"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card shadow-sm mt-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Danh sách nhân viên</h5>
                    <form className="d-flex gap-2" onSubmit={onSearch}>
                        <input
                            type="text"
                            className="form-control"
                            style={{ width: 280 }}
                            placeholder="Tìm theo tên, email, số điện thoại..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className="btn btn-outline-primary" type="submit">Tìm</button>
                    </form>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center p-3">Đang tải...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-primary sticky-top">
                                    <tr>
                                        <th>Họ tên</th>
                                        <th>Email</th>
                                        <th>SĐT</th>
                                        <th>Ngày sinh</th>
                                        <th>Vị trí</th>
                                        <th>Username</th>
                                        <th className="text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center text-muted">Không có dữ liệu</td>
                                        </tr>
                                    ) : (
                                        employees.map((e) => (
                                            <tr key={e.employeeId}>
                                                <td>{e.fullName}</td>
                                                <td>{e.email}</td>
                                                <td>{e.phoneNumber}</td>
                                                <td>{e.dateOfBirth}</td>
                                                <td>{e.position}</td>
                                                <td>{e.username}</td>
                                                <td className="text-center">
                                                    <button className="btn btn-sm btn-warning" onClick={() => onEdit(e)}>
                                                        Sửa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}