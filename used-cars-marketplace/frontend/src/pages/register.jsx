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

const ROLES = ["Buyer", "Seller"];

const steps = ["Personal", "Security", "Location", "Verification"];

function StepIndicator({ current }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
              ${i < current ? "bg-blue-600 text-white" :
                                i === current ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                                    "bg-gray-100 text-gray-400"}`}>
                            {i < current ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : i + 1}
                        </div>
                        <span className={`text-[10px] font-semibold tracking-wide hidden sm:block ${i === current ? "text-blue-600" : i < current ? "text-blue-400" : "text-gray-300"}`}>
                            {label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`w-10 h-0.5 mb-4 rounded-full transition-all duration-300 ${i < current ? "bg-blue-600" : "bg-gray-200"}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

function InputField({ label, required, error, icon, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 tracking-wide flex items-center gap-1">
                {icon && <span>{icon}</span>}
                {label}
                {required && <span className="text-red-400">*</span>}
            </label>
            {children}
            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

function TextInput({ placeholder, type = "text", value, onChange, error, suffix }) {
    const [focused, setFocused] = useState(false);
    return (
        <div className={`flex items-center bg-white border-2 rounded-xl transition-all duration-200
      ${focused ? "border-blue-500 shadow-[0_0_0_4px_rgba(37,99,235,0.08)]" : error ? "border-red-300" : "border-gray-200"}`}>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 bg-transparent outline-none rounded-xl"
            />
            {suffix}
        </div>
    );
}

function PasswordInput({ placeholder, value, onChange, error }) {
    const [show, setShow] = useState(false);
    const [focused, setFocused] = useState(false);
    return (
        <div className={`flex items-center bg-white border-2 rounded-xl transition-all duration-200
      ${focused ? "border-blue-500 shadow-[0_0_0_4px_rgba(37,99,235,0.08)]" : error ? "border-red-300" : "border-gray-200"}`}>
            <input
                type={show ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 bg-transparent outline-none"
            />
            <button type="button" onClick={() => setShow(!show)} className="pr-4 text-gray-400 hover:text-gray-600 transition-colors">
                {show ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                )}
            </button>
        </div>
    );
}

function SelectInput({ placeholder, options, value, onChange, error }) {
    const [focused, setFocused] = useState(false);
    return (
        <div className={`relative bg-white border-2 rounded-xl transition-all duration-200
      ${focused ? "border-blue-500 shadow-[0_0_0_4px_rgba(37,99,235,0.08)]" : error ? "border-red-300" : "border-gray-200"}`}>
            <select
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`w-full px-4 py-3 text-sm bg-transparent outline-none appearance-none cursor-pointer rounded-xl
          ${value ? "text-gray-800" : "text-gray-300"}`}
            >
                <option value="" disabled hidden>{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt} value={opt} className="text-gray-800">{opt}</option>
                ))}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </span>
        </div>
    );
}

const stepConfig = [
    {
        title: "Personal Info",
        subtitle: "Tell us about yourself",
        emoji: "👤",
        fields: ["fullName", "email", "phone", "age"],
    },
    {
        title: "Security",
        subtitle: "Protect your account",
        emoji: "🔒",
        fields: ["password", "confirmPassword"],
    },
    {
        title: "Location",
        subtitle: "Where are you based?",
        emoji: "📍",
        fields: ["city", "state"],
    },
    {
        title: "Verification",
        subtitle: "Final step — almost there!",
        emoji: "🪪",
        fields: ["role", "aadhaar", "agreed"],
    },
];

export default function Register() {
    const [step, setStep] = useState(0);
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

    const validateStep = (s) => {
        const e = {};
        if (s === 0) {
            if (!form.fullName.trim()) e.fullName = "Full name is required";
            if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
            if (!form.phone.match(/^\d{10}$/)) e.phone = "10-digit number required";
            if (!form.age || isNaN(form.age) || Number(form.age) < 18) e.age = "Must be 18 or above";
        }
        if (s === 1) {
            if (!form.password || form.password.length < 8) e.password = "Minimum 8 characters";
            if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
        }
        if (s === 2) {
            if (!form.city.trim()) e.city = "City is required";
            if (!form.state) e.state = "Please select a state";
        }
        if (s === 3) {
            if (!form.role) e.role = "Please select a role";
            if (!form.aadhaar.match(/^\d{12}$/)) e.aadhaar = "12-digit Aadhaar required";
            if (!form.agreed) e.agreed = "You must agree to continue";
        }
        return e;
    };

    const next = () => {
        const e = validateStep(step);
        setErrors(e);
        if (Object.keys(e).length === 0) setStep((s) => s + 1);
    };

    const back = () => { setErrors({}); setStep((s) => s - 1); };

    const handleSubmit = () => {
        const e = validateStep(3);
        setErrors(e);
        if (Object.keys(e).length === 0) setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
                <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md w-full border border-gray-100">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set! 🎉</h2>
                    <p className="text-gray-400 text-sm mb-2">
                        Welcome, <span className="font-bold text-blue-600">{form.fullName}</span>
                    </p>
                    <p className="text-gray-400 text-sm mb-8">Your DashIQ account has been created successfully.</p>
                    <button
                        onClick={() => { setSubmitted(false); setStep(0); setForm({ fullName: "", email: "", phone: "", age: "", password: "", confirmPassword: "", city: "", state: "", role: "", aadhaar: "", agreed: false }); setErrors({}); }}
                        className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-blue-200"
                    >
                        Register Another Account
                    </button>
                </div>
            </div>
        );
    }

    const current = stepConfig[step];

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50">

            {/* Left Panel */}
            <div className="hidden lg:flex flex-col justify-between w-5/12 bg-blue-600 p-12 relative overflow-hidden">
                <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-blue-500 rounded-full opacity-40" />
                <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 bg-indigo-700 rounded-full opacity-30" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                        <span className="text-blue-600 font-bold text-lg">D</span>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">DashIQ</span>
                </div>

                {/* Center */}
                <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Join 12,000+ dealers today
                    </div>
                    <h2 className="text-4xl font-bold text-white leading-tight">
                        Start selling & buying smarter
                    </h2>
                    <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
                        Create your free account and get access to listings, bids, and deals — all in one dashboard.
                    </p>

                    {/* Steps preview */}
                    <div className="space-y-3 pt-2">
                        {stepConfig.map((s, i) => (
                            <div key={s.title} className={`flex items-center gap-3 transition-all duration-300 ${i === step ? "opacity-100" : "opacity-40"}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${i < step ? "bg-green-400 text-white" : i === step ? "bg-white text-blue-600" : "bg-white/20 text-white"}`}>
                                    {i < step ? "✓" : i + 1}
                                </div>
                                <div>
                                    <p className="text-white text-sm font-semibold">{s.title}</p>
                                    <p className="text-blue-200 text-xs">{s.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="relative z-10 flex gap-6">
                    {[["12K+", "Dealers"], ["98%", "Satisfaction"], ["$2B+", "Transactions"]].map(([val, label]) => (
                        <div key={label}>
                            <p className="text-white font-bold text-lg">{val}</p>
                            <p className="text-blue-200 text-xs">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
                <div className="w-full max-w-lg py-8">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">D</span>
                        </div>
                        <span className="text-gray-800 font-bold text-lg">DashIQ</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h1>
                        <p className="text-gray-400 text-sm mt-1">Fill in the details below to get started</p>
                    </div>

                    {/* Step indicator */}
                    <StepIndicator current={step} />

                    {/* Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

                        {/* Step heading */}
                        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
                                {current.emoji}
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-800">{current.title}</h2>
                                <p className="text-xs text-gray-400">{current.subtitle}</p>
                            </div>
                            <div className="ml-auto text-xs font-semibold text-gray-400">
                                Step {step + 1} of {steps.length}
                            </div>
                        </div>

                        {/* Step 0 – Personal */}
                        {step === 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <InputField label="Full Name" required error={errors.fullName}>
                                        <TextInput placeholder="John Doe" value={form.fullName} onChange={set("fullName")} error={errors.fullName} />
                                    </InputField>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <InputField label="Email Address" required error={errors.email}>
                                        <TextInput placeholder="you@example.com" type="email" value={form.email} onChange={set("email")} error={errors.email} />
                                    </InputField>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <InputField label="Phone Number" required error={errors.phone}>
                                        <TextInput placeholder="10-digit mobile" value={form.phone} onChange={set("phone")} error={errors.phone} />
                                    </InputField>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <InputField label="Age" required error={errors.age}>
                                        <TextInput placeholder="Must be 18+" type="number" value={form.age} onChange={set("age")} error={errors.age} />
                                    </InputField>
                                </div>
                            </div>
                        )}

                        {/* Step 1 – Security */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <InputField label="Password" required error={errors.password}>
                                    <PasswordInput placeholder="Minimum 8 characters" value={form.password} onChange={set("password")} error={errors.password} />
                                </InputField>
                                <InputField label="Confirm Password" required error={errors.confirmPassword}>
                                    <PasswordInput placeholder="Re-enter your password" value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
                                </InputField>
                                {/* Password strength hint */}
                                {form.password && (
                                    <div className="space-y-1.5">
                                        <p className="text-xs text-gray-400 font-medium">Password strength</p>
                                        <div className="flex gap-1.5">
                                            {[8, 12, 16].map((len, i) => (
                                                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${form.password.length >= len ? ["bg-red-400", "bg-yellow-400", "bg-green-500"][i] : "bg-gray-200"}`} />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400">{form.password.length < 8 ? "Too short" : form.password.length < 12 ? "Weak" : form.password.length < 16 ? "Good" : "Strong"}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2 – Location */}
                        {step === 2 && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <InputField label="City" required error={errors.city}>
                                        <TextInput placeholder="Your city" value={form.city} onChange={set("city")} error={errors.city} />
                                    </InputField>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <InputField label="State" required error={errors.state}>
                                        <SelectInput placeholder="Select state" options={INDIAN_STATES} value={form.state} onChange={set("state")} error={errors.state} />
                                    </InputField>
                                </div>
                            </div>
                        )}

                        {/* Step 3 – Verification */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 sm:col-span-1">
                                        <InputField label="Role" required error={errors.role}>
                                            <SelectInput placeholder="Select your role" options={ROLES} value={form.role} onChange={set("role")} error={errors.role} />
                                        </InputField>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <InputField label="Aadhaar Number" required error={errors.aadhaar}>
                                            <TextInput placeholder="12-digit Aadhaar" value={form.aadhaar} onChange={set("aadhaar")} error={errors.aadhaar} />
                                        </InputField>
                                    </div>
                                </div>
                                <label className="flex items-start gap-3 cursor-pointer select-none mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setForm((f) => ({ ...f, agreed: !f.agreed }))}
                                        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${form.agreed ? "bg-blue-600 border-blue-600" : errors.agreed ? "border-red-400" : "border-gray-300"}`}
                                    >
                                        {form.agreed && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </button>
                                    <span className="text-sm text-gray-500 leading-relaxed">
                                        I agree to the{" "}
                                        <a href="#" className="text-blue-600 font-semibold hover:underline">Terms of Service</a>
                                        {" "}and{" "}
                                        <a href="#" className="text-blue-600 font-semibold hover:underline">Privacy Policy</a>
                                    </span>
                                </label>
                                {errors.agreed && <p className="text-xs text-red-500 ml-8">{errors.agreed}</p>}
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-gray-100">
                            {step > 0 ? (
                                <button
                                    onClick={back}
                                    className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path d="M19 12H5M12 5l-7 7 7 7" />
                                    </svg>
                                    Back
                                </button>
                            ) : (
                                <div />
                            )}

                            {step < steps.length - 1 ? (
                                <button
                                    onClick={next}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    Continue
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    Create Account
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sign in link */}
                    <p className="text-center text-sm text-gray-400 mt-5">
                        Already have an account?{" "}
                        <a href="/login" className="text-blue-600 font-bold hover:underline">Sign in</a>
                    </p>

                    {/* SSL */}
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        <span className="text-xs text-gray-400">Secured with 256-bit SSL encryption</span>
                    </div>
                </div>
            </div>
        </div>
    );
}