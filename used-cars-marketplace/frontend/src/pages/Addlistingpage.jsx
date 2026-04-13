import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const STEPS = ["Basic Info", "Vehicle Details", "Photos & Price", "Review"];
const BRANDS = ["Maruti Suzuki","Hyundai","Honda","Toyota","Tata","Mahindra","Kia","Ford","Volkswagen","Skoda","MG","Renault","Nissan","BMW","Mercedes-Benz","Audi","Other"];
const FUEL_TYPES = ["Petrol","Diesel","CNG","Electric","Hybrid"];
const TRANSMISSIONS = ["Manual","Automatic","CVT","AMT"];
const CITIES = ["Delhi","Mumbai","Bangalore","Chennai","Hyderabad","Pune","Kolkata","Ahmedabad","Jaipur","Surat","Lucknow","Chandigarh"];
const CONDITIONS = ["Excellent","Good","Fair","Needs Work"];
const COLORS = ["White","Silver","Black","Grey","Red","Blue","Brown","Orange","Green","Yellow","Other"];
const FEATURE_OPTIONS = ["ABS","Airbags","Power Windows","Central Locking","Sunroof","Music System","Reverse Camera","Parking Sensors","Cruise Control","Apple CarPlay","Android Auto","Keyless Entry","Push Start","Heated Seats","Ventilated Seats","360° Camera","Lane Assist"];

export default function AddListingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    brand:"", model:"", year:"", variant:"",
    fuel:"", transmission:"", km:"", owners:"1",
    color:"", condition:"Good", city:"",
    price:"", description:"", mileage:"",
    features:[],
    contactName: user?.name||"", contactPhone:"", contactEmail: user?.email||"",
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: "" }));
  };

  const toggleFeature = (f) =>
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(f)
        ? prev.features.filter(x => x !== f)
        : [...prev.features, f],
    }));

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.brand) e.brand = "Required";
      if (!form.model.trim()) e.model = "Required";
      if (!form.year || form.year < 1990 || form.year > new Date().getFullYear() + 1) e.year = "Enter a valid year";
      if (!form.city) e.city = "Required";
    }
    if (step === 1) {
      if (!form.fuel) e.fuel = "Required";
      if (!form.transmission) e.transmission = "Required";
      if (!form.km || isNaN(form.km) || Number(form.km) < 0) e.km = "Enter valid km";
    }
    if (step === 2) {
      if (!form.price || isNaN(form.price) || Number(form.price) < 10000) e.price = "Enter a valid price (min ₹10,000)";
      if (!form.description.trim() || form.description.length < 20) e.description = "Write at least 20 characters";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);
    setSubmitted(true);
  };

  const fmt = (v) => v && !isNaN(v) && Number(v) > 0 ? `₹${(Number(v)/100000).toFixed(1)}L` : "—";

  if (submitted) {
    return (
      <div style={{ minHeight:"100vh", background:"#080808", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans', sans-serif", paddingTop:70 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap'); @keyframes popIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}`}</style>
        <div style={{ textAlign:"center", padding:"3rem 2rem", animation:"popIn 0.5s ease both" }}>
          <div style={{ fontSize:"5rem", marginBottom:"1.5rem" }}>🎉</div>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"3rem", color:"#fff", letterSpacing:"0.05em", marginBottom:"0.75rem" }}>LISTING SUBMITTED!</h2>
          <p style={{ color:"#9ca3af", fontSize:"1rem", lineHeight:1.7, maxWidth:400, margin:"0 auto 2rem" }}>
            Your car is under review. We'll verify and publish it within 24 hours.
          </p>
          <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:14, padding:"1.25rem 2rem", display:"inline-block", marginBottom:"2rem" }}>
            <div style={{ color:"#f59e0b", fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.1rem", letterSpacing:"0.1em" }}>
              {form.year} {form.brand} {form.model} {form.variant} · {fmt(form.price)}
            </div>
          </div>
          <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => navigate("/dashboard/seller")} style={{ background:"#f59e0b", border:"none", borderRadius:10, padding:"0.85rem 2rem", color:"#000", fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.1rem", letterSpacing:"0.08em", cursor:"pointer" }}>GO TO DASHBOARD</button>
            <button onClick={() => { setSubmitted(false); setStep(0); }} style={{ background:"transparent", border:"1px solid rgba(245,158,11,0.4)", borderRadius:10, padding:"0.85rem 2rem", color:"#f59e0b", fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.1rem", letterSpacing:"0.08em", cursor:"pointer" }}>ADD ANOTHER</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:"#080808", minHeight:"100vh", color:"#e5e7eb", fontFamily:"'DM Sans', sans-serif", paddingTop:70 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#f59e0b;border-radius:2px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .al-input{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px 14px;color:#e5e7eb;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:all 0.2s;}
        .al-input:focus{border-color:rgba(245,158,11,0.5);background:rgba(245,158,11,0.04);box-shadow:0 0 0 3px rgba(245,158,11,0.08);}
        .al-input.err{border-color:rgba(239,68,68,0.5);}
        .al-select{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px 14px;color:#e5e7eb;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;cursor:pointer;color-scheme:dark;}
        .al-select:focus{border-color:rgba(245,158,11,0.5);}
        .al-chip{padding:6px 14px;border-radius:100px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#9ca3af;font-size:13px;cursor:pointer;transition:all 0.18s;white-space:nowrap;}
        .al-chip:hover{border-color:rgba(245,158,11,0.35);color:rgba(255,255,255,0.8);}
        .al-chip.on{background:rgba(245,158,11,0.12);border-color:rgba(245,158,11,0.5);color:#f59e0b;}
        .al-feat{padding:5px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);color:#6b7280;font-size:12px;cursor:pointer;transition:all 0.18s;}
        .al-feat:hover{border-color:rgba(245,158,11,0.3);color:#e5e7eb;}
        .al-feat.on{background:rgba(245,158,11,0.1);border-color:rgba(245,158,11,0.4);color:#f59e0b;}
        .al-next{background:#f59e0b;border:none;border-radius:12px;padding:13px 32px;color:#000;font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:0.08em;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 20px rgba(245,158,11,0.25);}
        .al-next:hover{background:#fbbf24;transform:translateY(-1px);}
        .al-next:disabled{opacity:0.65;cursor:not-allowed;transform:none;}
        .al-back{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:13px 24px;color:rgba(255,255,255,0.5);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;}
        .al-back:hover{background:rgba(255,255,255,0.08);color:#fff;}
        .photo-slot{aspect-ratio:4/3;border-radius:10px;border:2px dashed rgba(255,255,255,0.12);background:rgba(255,255,255,0.03);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;gap:6px;}
        .photo-slot:hover{border-color:rgba(245,158,11,0.4);background:rgba(245,158,11,0.04);}
      `}</style>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"2.5rem 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom:"2.5rem", animation:"fadeUp 0.5s ease both" }}>
          <button onClick={() => navigate(-1)} style={{ background:"none", border:"none", color:"#f59e0b", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:"0.1em", marginBottom:"1rem", display:"flex", alignItems:"center", gap:6, padding:0 }}>← BACK</button>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(2rem,5vw,3rem)", letterSpacing:"0.04em", color:"#fff", lineHeight:1, marginBottom:"0.4rem" }}>
            POST YOUR <span style={{ color:"#f59e0b" }}>LISTING</span>
          </h1>
          <p style={{ color:"#6b7280", fontSize:"0.9rem" }}>Sell your car fast — reach 12,000+ verified buyers.</p>
        </div>

        {/* Step bar */}
        <div style={{ display:"flex", gap:0, marginBottom:"2.5rem", animation:"fadeUp 0.5s 0.05s ease both" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", width:"100%" }}>
                {i > 0 && <div style={{ flex:1, height:2, background:i<=step?"#f59e0b":"rgba(255,255,255,0.08)", transition:"background 0.3s" }} />}
                <div style={{ width:32, height:32, borderRadius:"50%", background:i<step?"#f59e0b":i===step?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.06)", border:`2px solid ${i<=step?"#f59e0b":"rgba(255,255,255,0.1)"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.3s", fontSize:"0.8rem", color:i<step?"#000":i===step?"#f59e0b":"#6b7280", fontWeight:700 }}>
                  {i < step ? "✓" : i+1}
                </div>
                {i < STEPS.length-1 && <div style={{ flex:1, height:2, background:i<step?"#f59e0b":"rgba(255,255,255,0.08)", transition:"background 0.3s" }} />}
              </div>
              <div style={{ marginTop:6, fontSize:"0.7rem", color:i===step?"#f59e0b":"#4b5563", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div style={{ background:"#111", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"2rem", animation:"fadeUp 0.4s 0.1s ease both" }}>

          {/* ── STEP 0: Basic Info ── */}
          {step === 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
              <STitle>Basic Information</STitle>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                <FW label="Brand *" err={errors.brand}>
                  <select className="al-select" value={form.brand} onChange={e => set("brand",e.target.value)}>
                    <option value="">Select brand</option>
                    {BRANDS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </FW>
                <FW label="Model *" err={errors.model}>
                  <input className={`al-input${errors.model?" err":""}`} placeholder="e.g. Swift, Creta, City" value={form.model} onChange={e => set("model",e.target.value)} />
                </FW>
                <FW label="Year *" err={errors.year}>
                  <input className={`al-input${errors.year?" err":""}`} type="number" placeholder="e.g. 2021" value={form.year} onChange={e => set("year",e.target.value)} />
                </FW>
                <FW label="Variant / Trim">
                  <input className="al-input" placeholder="e.g. VXI, ZX, SX+" value={form.variant} onChange={e => set("variant",e.target.value)} />
                </FW>
              </div>
              <FW label="City *" err={errors.city}>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
                  {CITIES.map(c => <button key={c} type="button" className={`al-chip${form.city===c?" on":""}`} onClick={()=>set("city",c)}>{c}</button>)}
                </div>
              </FW>
              <FW label="Your Name">
                <input className="al-input" placeholder="Full name" value={form.contactName} onChange={e=>set("contactName",e.target.value)} />
              </FW>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                <FW label="Phone">
                  <input className="al-input" type="tel" placeholder="+91 98765 43210" value={form.contactPhone} onChange={e=>set("contactPhone",e.target.value)} />
                </FW>
                <FW label="Email">
                  <input className="al-input" type="email" placeholder="you@example.com" value={form.contactEmail} onChange={e=>set("contactEmail",e.target.value)} />
                </FW>
              </div>
            </div>
          )}

          {/* ── STEP 1: Vehicle Details ── */}
          {step === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
              <STitle>Vehicle Details</STitle>
              <FW label="Fuel Type *" err={errors.fuel}>
                <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
                  {FUEL_TYPES.map(f => <button key={f} type="button" className={`al-chip${form.fuel===f?" on":""}`} onClick={()=>set("fuel",f)}>{f}</button>)}
                </div>
              </FW>
              <FW label="Transmission *" err={errors.transmission}>
                <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
                  {TRANSMISSIONS.map(t => <button key={t} type="button" className={`al-chip${form.transmission===t?" on":""}`} onClick={()=>set("transmission",t)}>{t}</button>)}
                </div>
              </FW>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                <FW label="Kilometers Driven *" err={errors.km}>
                  <input className={`al-input${errors.km?" err":""}`} type="number" placeholder="e.g. 45000" value={form.km} onChange={e=>set("km",e.target.value)} />
                </FW>
                <FW label="No. of Owners">
                  <select className="al-select" value={form.owners} onChange={e=>set("owners",e.target.value)}>
                    {["1","2","3","4+"].map(o=><option key={o} value={o}>{o} Owner{o!=="1"?"s":""}</option>)}
                  </select>
                </FW>
                <FW label="Color">
                  <select className="al-select" value={form.color} onChange={e=>set("color",e.target.value)}>
                    <option value="">Select color</option>
                    {COLORS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </FW>
                <FW label="Fuel Efficiency">
                  <input className="al-input" placeholder="e.g. 22 kmpl / 300 km range" value={form.mileage} onChange={e=>set("mileage",e.target.value)} />
                </FW>
              </div>
              <FW label="Condition">
                <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
                  {CONDITIONS.map(c=><button key={c} type="button" className={`al-chip${form.condition===c?" on":""}`} onClick={()=>set("condition",c)}>{c}</button>)}
                </div>
              </FW>
              <FW label="Features & Extras">
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
                  {FEATURE_OPTIONS.map(f=><button key={f} type="button" className={`al-feat${form.features.includes(f)?" on":""}`} onClick={()=>toggleFeature(f)}>{f}</button>)}
                </div>
              </FW>
            </div>
          )}

          {/* ── STEP 2: Photos & Price ── */}
          {step === 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
              <STitle>Photos & Pricing</STitle>
              <FW label="Photos (up to 10)">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem" }}>
                  {[0,1,2,3].map(i=>(
                    <div key={i} className="photo-slot">
                      <span style={{ fontSize:"1.5rem" }}>{i===0?"📸":"+"}</span>
                      <span style={{ fontSize:"0.68rem", color:"#4b5563" }}>{i===0?"Main Photo":"Add Photo"}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize:"0.75rem", color:"#4b5563", marginTop:"0.5rem" }}>Clear photos get 3× more buyer inquiries.</p>
              </FW>
              <FW label="Asking Price (₹) *" err={errors.price}>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#f59e0b", fontWeight:700, fontSize:"1rem" }}>₹</span>
                  <input className={`al-input${errors.price?" err":""}`} type="number" placeholder="e.g. 650000" value={form.price} onChange={e=>set("price",e.target.value)} style={{ paddingLeft:30 }} />
                </div>
                {form.price && !isNaN(form.price) && Number(form.price)>0 && (
                  <p style={{ fontSize:"0.78rem", color:"#f59e0b", marginTop:"0.35rem" }}>= {fmt(form.price)}</p>
                )}
              </FW>
              <FW label="Description *" err={errors.description}>
                <textarea className="al-input" rows={5} placeholder="Describe the car — service history, modifications, reason for selling, any issues..." value={form.description} onChange={e=>set("description",e.target.value)} style={{ resize:"vertical", minHeight:120 }} />
                <p style={{ fontSize:"0.75rem", color:form.description.length<20?"#6b7280":"#22c55e", marginTop:"0.35rem" }}>
                  {form.description.length} / 20 min characters
                </p>
              </FW>
            </div>
          )}

          {/* ── STEP 3: Review ── */}
          {step === 3 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
              <STitle>Review Your Listing</STitle>
              <div style={{ background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.15)", borderRadius:14, padding:"1.5rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" }}>
                  <div>
                    <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.8rem", color:"#fff", letterSpacing:"0.04em", lineHeight:1 }}>
                      {form.year} {form.brand} {form.model} {form.variant}
                    </h3>
                    <p style={{ color:"#6b7280", fontSize:"0.85rem", marginTop:4 }}>📍 {form.city}</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2rem", color:"#f59e0b" }}>{fmt(form.price)}</div>
                    <div style={{ fontSize:"0.72rem", color:"#4b5563" }}>Asking price</div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.75rem", marginBottom:"1rem" }}>
                  {[
                    {label:"Fuel",value:form.fuel},{label:"Transmission",value:form.transmission},
                    {label:"KM Driven",value:form.km?`${Number(form.km).toLocaleString()} km`:"—"},
                    {label:"Owners",value:`${form.owners} Owner${form.owners!=="1"?"s":""}`},
                    {label:"Color",value:form.color||"—"},{label:"Condition",value:form.condition},
                  ].map(({label,value})=>(
                    <div key={label} style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"0.75rem 1rem" }}>
                      <div style={{ fontSize:"0.7rem", color:"#4b5563", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>{label}</div>
                      <div style={{ fontSize:"0.9rem", color:"#e5e7eb", fontWeight:600 }}>{value||"—"}</div>
                    </div>
                  ))}
                </div>
                {form.features.length>0 && (
                  <div style={{ marginBottom:"1rem" }}>
                    <div style={{ fontSize:"0.75rem", color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"0.5rem" }}>Features</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
                      {form.features.map(f=><span key={f} style={{ background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:6, padding:"2px 10px", fontSize:"0.75rem", color:"#f59e0b" }}>{f}</span>)}
                    </div>
                  </div>
                )}
                {form.description && (
                  <p style={{ fontSize:"0.85rem", color:"#9ca3af", lineHeight:1.6, borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:"1rem" }}>{form.description}</p>
                )}
              </div>
              <div style={{ background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.15)", borderRadius:12, padding:"1rem 1.25rem", display:"flex", gap:"0.75rem", alignItems:"flex-start" }}>
                <span style={{ fontSize:"1.2rem" }}>🛡️</span>
                <div>
                  <div style={{ color:"#10b981", fontWeight:700, fontSize:"0.85rem", marginBottom:3 }}>Protected by AutoBazaar</div>
                  <div style={{ color:"#6b7280", fontSize:"0.8rem", lineHeight:1.5 }}>All listings are reviewed by our team. Buyers can only contact you through our secure platform.</div>
                </div>
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"2rem", paddingTop:"1.5rem", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            <div>{step>0 && <button className="al-back" onClick={back}>← Back</button>}</div>
            <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
              <span style={{ fontSize:"0.78rem", color:"#4b5563" }}>Step {step+1} of {STEPS.length}</span>
              {step < STEPS.length-1
                ? <button className="al-next" onClick={next}>NEXT →</button>
                : <button className="al-next" onClick={handleSubmit} disabled={loading}>{loading?"SUBMITTING...":"SUBMIT LISTING 🚀"}</button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function STitle({ children }) {
  return <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.4rem", letterSpacing:"0.06em", color:"#fff", margin:0, paddingBottom:"0.75rem", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>{children}</h2>;
}

function FW({ label, err, children }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:err?"#ef4444":"#9ca3af", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"0.5rem" }}>{label}</label>
      {children}
      {err && <p style={{ color:"#ef4444", fontSize:"0.75rem", marginTop:"0.3rem" }}>⚠ {err}</p>}
    </div>
  );
}