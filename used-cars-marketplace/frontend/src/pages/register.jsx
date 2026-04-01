import { useState } from "react";

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
    "Daman and Diu", "Delhi", "Lakshadweep", "Puducherry", "Jammu and Kashmir", "Ladakh",
];

const ROLES = ["Student", "Teacher", "Admin", "Manager", "Developer", "Other"];

function Field({ label, required, error, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 tracking-wide">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function TextInput({ placeholder, type = "text", value, onChange, error }) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full px-3.5 py-3 rounded-xl border text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200
        focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white
        ${error ? "border-red-400" : "border-gray-200"}`}
        />
    );
}

function SelectInput({ placeholder, options, value, onChange, error }) {
    return (
        <select
            value={value}
            onChange={onChange}
            className={`w-full px-3.5 py-3 rounded-xl border text-sm outline-none transition-all duration-200 appearance-none bg-white cursor-pointer
        focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
        ${value ? "text-gray-800" : "text-gray-400"}
        ${error ? "border-red-400" : "border-gray-200"}`}
        >
            <option value="" disabled hidden>{placeholder}</option>
            {options.map((opt) => (
                <option key={opt} value={opt} className="text-gray-800">{opt}</option>
            ))}
        </select>
    );
}

function SectionHeader({ icon, title }) {
    return (
        <div className="flex items-center gap-2.5 mb-5">
            <span className="text-xl">{icon}</span>
            <h2 className="text-xs font-bold tracking-widest text-gray-700 uppercase">{title}</h2>
        </div>
    );
}

function Divider() {
    return <hr className="border-t border-gray-100 my-2 mb-7" />;
}

export default function Register() {
    const [form, setForm] = useState({
        fullName: "", email: "", phone: "", age: "",
        password: "", confirmPassword: "",
        city: "", state: "",
        role: "", aadhaar: "",
        agreed: false,
    });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const set = (field) => (e) =>
        setForm((f) => ({ ...f, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

    const validate = () => {
        const e = {};
        if (!form.fullName.trim()) e.fullName = "Full name is required";
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email is required";
        if (!form.phone.match(/^\d{10}$/)) e.phone = "Enter a valid 10-digit number";
        if (!form.age || isNaN(form.age) || Number(form.age) < 18) e.age = "Must be 18 or above";
        if (!form.password || form.password.length < 8) e.password = "Minimum 8 characters";
        if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
        if (!form.city.trim()) e.city = "City is required";
        if (!form.state) e.state = "Please select a state";
        if (!form.role) e.role = "Please select a role";
        if (!form.aadhaar.match(/^\d{12}$/)) e.aadhaar = "Enter a valid 12-digit Aadhaar number";
        if (!form.agreed) e.agreed = "You must agree to continue";
        return e;
    };

    const handleSubmit = () => {
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length === 0) setSubmitted(true);
    };

    const handleReset = () => {
        setForm({ fullName: "", email: "", phone: "", age: "", password: "", confirmPassword: "", city: "", state: "", role: "", aadhaar: "", agreed: false });
        setErrors({});
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-4">
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md w-full">
                    <div className="text-5xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Created!</h2>
                    <p className="text-gray-500 mb-6">
                        Welcome, <span className="font-semibold text-indigo-600">{form.fullName}</span>. Your registration was successful.
                    </p>
                    <button
                        onClick={() => { setSubmitted(false); handleReset(); }}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors duration-200"
                    >
                        Register Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-start justify-center py-10 px-4">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-2xl px-10 py-9">

                {/* Personal Information */}
                <SectionHeader icon="👤" title="Personal Information" />
                <div className="grid grid-cols-2 gap-5">
                    <Field label="Full Name" required error={errors.fullName}>
                        <TextInput placeholder="John Doe" value={form.fullName} onChange={set("fullName")} error={errors.fullName} />
                    </Field>
                    <Field label="Email Address" required error={errors.email}>
                        <TextInput placeholder="john@example.com" type="email" value={form.email} onChange={set("email")} error={errors.email} />
                    </Field>
                    <Field label="Phone Number" required error={errors.phone}>
                        <TextInput placeholder="10-digit mobile number" value={form.phone} onChange={set("phone")} error={errors.phone} />
                    </Field>
                    <Field label="Age" required error={errors.age}>
                        <TextInput placeholder="Must be 18 or above" type="number" value={form.age} onChange={set("age")} error={errors.age} />
                    </Field>
                </div>

                <Divider />

                {/* Security */}
                <SectionHeader icon="🔒" title="Security" />
                <div className="grid grid-cols-2 gap-5">
                    <Field label="Password" required error={errors.password}>
                        <TextInput placeholder="Min 8 characters" type="password" value={form.password} onChange={set("password")} error={errors.password} />
                    </Field>
                    <Field label="Confirm Password" required error={errors.confirmPassword}>
                        <TextInput placeholder="Re-enter password" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
                    </Field>
                </div>

                <Divider />

                {/* Location */}
                <SectionHeader icon="📍" title="Location" />
                <div className="grid grid-cols-2 gap-5">
                    <Field label="City" required error={errors.city}>
                        <TextInput placeholder="Your city" value={form.city} onChange={set("city")} error={errors.city} />
                    </Field>
                    <Field label="State" required error={errors.state}>
                        <SelectInput placeholder="Select state" options={INDIAN_STATES} value={form.state} onChange={set("state")} error={errors.state} />
                    </Field>
                </div>

                <Divider />

                {/* Account & Verification */}
                <SectionHeader icon="🪪" title="Account & Verification" />
                <div className="grid grid-cols-2 gap-5">
                    <Field label="Role" required error={errors.role}>
                        <SelectInput placeholder="Select your role" options={ROLES} value={form.role} onChange={set("role")} error={errors.role} />
                    </Field>
                    <Field label="Aadhaar Number" required error={errors.aadhaar}>
                        <TextInput placeholder="12-digit Aadhaar number" value={form.aadhaar} onChange={set("aadhaar")} error={errors.aadhaar} />
                    </Field>
                </div>

                {/* Terms */}
                <div className="mt-7">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={form.agreed}
                            onChange={set("agreed")}
                            className="w-4 h-4 rounded border-gray-300 accent-indigo-600 cursor-pointer flex-shrink-0"
                        />
                        <span className="text-sm text-gray-600">
                            I agree to the{" "}
                            <a href="#" className="text-indigo-600 font-semibold hover:underline">Terms of Service</a>
                            {" "}and{" "}
                            <a href="#" className="text-indigo-600 font-semibold hover:underline">Privacy Policy</a>
                        </span>
                    </label>
                    {errors.agreed && <p className="text-xs text-red-500 mt-1.5 ml-7">{errors.agreed}</p>}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-7">
                    <button
                        onClick={handleReset}
                        className="px-7 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-7 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors duration-200"
                    >
                        Create Account
                    </button>
                </div>

            </div>
        </div>
    );
}