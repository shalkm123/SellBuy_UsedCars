import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Lakshadweep", "Puducherry", "Jammu and Kashmir", "Ladakh",
];

const ROLES = ["BUYER", "SELLER"];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    aadhaar_encrypted: "",
    age: "",
    city: "",
    state: "",
    role: "BUYER",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (!form.full_name.trim()) return "Full name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Valid email is required";
    if (!form.password || form.password.length < 8) return "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    if (!form.phone_number.match(/^\d{10}$/)) return "Phone number must be 10 digits";
    if (!form.aadhaar_encrypted.match(/^\d{12}$/)) return "Aadhaar must be 12 digits";
    if (!form.age || Number(form.age) < 18) return "Age must be 18 or above";
    if (!form.city.trim()) return "City is required";
    if (!form.state) return "State is required";
    if (!ROLES.includes(form.role)) return "Role is invalid";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#e5e7eb", padding: "90px 16px 24px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto", background: "#121212", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: 24 }}>
        <h1 style={{ margin: 0, fontSize: 32, color: "#fff" }}>Create Account</h1>
        <p style={{ marginTop: 8, color: "rgba(255,255,255,.5)" }}>Sign up as a buyer or seller.</p>

        {error && (
          <div style={{ marginTop: 16, background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.3)", color: "#f87171", padding: "10px 12px", borderRadius: 10 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <Input label="Full Name" value={form.full_name} onChange={onChange("full_name")} placeholder="Rahul Sharma" />
          <Input label="Email" type="email" value={form.email} onChange={onChange("email")} placeholder="you@example.com" />
          <Input label="Phone Number" value={form.phone_number} onChange={onChange("phone_number")} placeholder="10 digits" />
          <Input label="Aadhaar Number" value={form.aadhaar_encrypted} onChange={onChange("aadhaar_encrypted")} placeholder="12 digits" />
          <Input label="Age" type="number" value={form.age} onChange={onChange("age")} placeholder="18" />
          <Input label="City" value={form.city} onChange={onChange("city")} placeholder="Bangalore" />

          <label style={labelStyle}>
            State
            <select value={form.state} onChange={onChange("state")} style={inputStyle}>
              <option value="">Select a state</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            Role
            <select value={form.role} onChange={onChange("role")} style={inputStyle}>
              {ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>

          <Input label="Password" type="password" value={form.password} onChange={onChange("password")} placeholder="Minimum 8 characters" />
          <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={onChange("confirmPassword")} placeholder="Re-enter password" />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              background: "#f59e0b",
              color: "#000",
              border: "none",
              borderRadius: 10,
              padding: "12px 14px",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: 16, color: "rgba(255,255,255,.6)" }}>
          Already have an account? <Link to="/login" style={{ color: "#f59e0b" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function Input({ label, type = "text", value, onChange, placeholder }) {
  return (
    <label style={labelStyle}>
      {label}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle} />
    </label>
  );
}

const labelStyle = {
  display: "grid",
  gap: 6,
  color: "rgba(255,255,255,.75)",
  fontSize: 13,
};

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,.05)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 10,
  padding: "10px 12px",
  color: "#fff",
  outline: "none",
  boxSizing: "border-box",
};
