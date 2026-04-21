import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  addCompareItem,
  clearCompareItems,
  compareCars,
  getAllCars,
  getCarById,
  getMyCompareList,
  removeCompareItem,
} from "../api";

const MAX_COMPARE = 3;
const normalizeCompareIds = (ids = []) => [...new Set(ids.map((item) => String(item).trim()).filter(Boolean))].slice(0, MAX_COMPARE);

const SPEC_ROWS = [
  { key: "price", label: "Price", icon: "₹", format: (v) => `₹${(Number(v || 0) / 100000).toFixed(2)}L` },
  { key: "manufacturing_year", label: "Year", icon: "📅", format: (v) => v || "-" },
  { key: "kilometers_driven", label: "Kilometers", icon: "🛣", format: (v) => `${Number(v || 0).toLocaleString()} km` },
  { key: "fuel_type", label: "Fuel", icon: "⛽", format: (v) => v || "-" },
  { key: "transmission", label: "Transmission", icon: "⚙️", format: (v) => v || "-" },
  { key: "ownership", label: "Ownership", icon: "💺", format: (v) => v || "-" },
  { key: "trust_score", label: "Trust Score", icon: "🛡️", format: (v) => (v == null ? "Pending" : `${v}/100`) },
  { key: "seller_verification_status", label: "Seller Verification", icon: "✅", format: (v) => v || "PENDING" },
];

const localVerdict = (cars) => {
  if (cars.length < 2) return null;
  const bestOverall = [...cars].sort((a, b) => Number(b.trust_score || 0) - Number(a.trust_score || 0))[0];
  const bestBudget = [...cars].sort((a, b) => Number(a.price) - Number(b.price))[0];
  const bestReliability = bestOverall;

  return {
    best_overall_car_id: String(bestOverall.id),
    best_budget_car_id: String(bestBudget.id),
    best_reliability_car_id: String(bestReliability.id),
    summary: `${bestOverall.title} is best overall. ${bestBudget.title} is best for budget. ${bestReliability.title} is most reliable by trust score.`,
  };
};

export default function ComparePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allCars, setAllCars] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedCars, setSelectedCars] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [verdict, setVerdict] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPersistedCompare = async () => {
      const idsFromQuery = (searchParams.get("ids") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, MAX_COMPARE);

      if (idsFromQuery.length > 0) {
        const normalized = normalizeCompareIds(idsFromQuery);
        setSelectedIds(normalized);
        localStorage.setItem("compare_ids", JSON.stringify(normalized));
        return;
      }

      if (user) {
        try {
          const res = await getMyCompareList();
          const ids = normalizeCompareIds((res.data?.items || []).map((item) => String(item.id)));
          setSelectedIds(ids);
          localStorage.setItem("compare_ids", JSON.stringify(ids));
          return;
        } catch {
          // fallback below
        }
      }

      const localIds = JSON.parse(localStorage.getItem("compare_ids") || "[]")
        .map((item) => String(item));
      const normalizedLocalIds = normalizeCompareIds(localIds);
      setSelectedIds(normalizedLocalIds);
      localStorage.setItem("compare_ids", JSON.stringify(normalizedLocalIds));
    };

    loadPersistedCompare();
  }, [searchParams, user]);

  useEffect(() => {
    const loadCars = async () => {
      try {
        const res = await getAllCars({ status: "ACTIVE" });
        setAllCars(res.data || []);
      } catch {
        setAllCars([]);
      }
    };
    loadCars();
  }, []);

  useEffect(() => {
    const loadSelected = async () => {
      setLoading(true);
      setError("");
      try {
        if (selectedIds.length === 0) {
          setSelectedCars([]);
          setVerdict(null);
          return;
        }

        const selectedSet = new Set(selectedIds.map((id) => String(id)));
        const fromList = allCars
          .filter((car) => selectedSet.has(String(car.id)))
          .map((car) => ({
            ...car,
            id: String(car.id),
            manufacturing_year: car.manufacturing_year || car.year,
            kilometers_driven: car.kilometers_driven ?? car.km_driven ?? car.km,
            seller_verification_status: car.verified ? "APPROVED" : "PENDING",
          }));

        const foundIds = new Set(fromList.map((car) => String(car.id)));
        const missingIds = selectedIds.filter((id) => !foundIds.has(String(id)));

        let fetched = [];
        if (missingIds.length > 0) {
          const carResponses = await Promise.allSettled(missingIds.map((id) => getCarById(id)));
          fetched = carResponses
            .filter((result) => result.status === "fulfilled")
            .map((result) => ({
              ...result.value.data,
              id: String(result.value.data.id),
              manufacturing_year: result.value.data.manufacturing_year || result.value.data.year,
              kilometers_driven: result.value.data.kilometers_driven ?? result.value.data.km_driven ?? result.value.data.km,
              seller_verification_status: result.value.data.verified ? "APPROVED" : "PENDING",
            }));
        }

        const byId = new Map([...fromList, ...fetched].map((car) => [String(car.id), car]));
        const cars = selectedIds.map((id) => byId.get(String(id))).filter(Boolean);

        if (cars.length < 2) {
          setSelectedCars(cars);
          setVerdict(null);
          setError("Select at least 2 valid cars to compare.");
          return;
        }

        setSelectedCars(cars);

        try {
          const apiRes = await compareCars(cars.map((car) => car.id));
          setVerdict(apiRes.data.verdict);
        } catch {
          setVerdict(localVerdict(cars));
          setError("Server compare unavailable, showing local comparison result.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadSelected();
  }, [selectedIds, allCars]);

  const updateSelection = (nextIds) => {
    const finalIds = normalizeCompareIds(nextIds);
    setSelectedIds(finalIds);
    localStorage.setItem("compare_ids", JSON.stringify(finalIds));
    const next = new URLSearchParams(searchParams);
    if (finalIds.length === 0) next.delete("ids");
    else next.set("ids", finalIds.join(","));
    setSearchParams(next, { replace: true });
  };

  const addCar = (car) => {
    const carId = String(car.id);
    if (selectedIds.length >= MAX_COMPARE || selectedIds.includes(carId)) return;
    updateSelection([...selectedIds, carId]);

    if (user) {
      addCompareItem(carId).catch(() => {});
    }
  };

  const removeCar = (id) => {
    updateSelection(selectedIds.filter((item) => item !== String(id)));
    if (user) {
      removeCompareItem(id).catch(() => {});
    }
  };

  const clearAll = () => {
    updateSelection([]);
    if (user) {
      clearCompareItems().catch(() => {});
    }
  };

  const filtered = useMemo(
    () =>
      allCars.filter(
        (car) =>
          !selectedIds.includes(String(car.id)) &&
          `${car.title} ${car.brand}`.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [allCars, selectedIds, searchQuery]
  );

  const getWinner = (key) => {
    if (selectedCars.length < 2) return null;
    if (key === "price" || key === "kilometers_driven") {
      return String(selectedCars.reduce((best, current) =>
        Number(current[key] || 0) < Number(best[key] || 0) ? current : best
      ).id);
    }
    if (key === "manufacturing_year" || key === "trust_score") {
      return String(selectedCars.reduce((best, current) =>
        Number(current[key] || 0) > Number(best[key] || 0) ? current : best
      ).id);
    }
    return null;
  };

  const overallWinner = verdict
    ? selectedCars.find((car) => String(car.id) === String(verdict.best_overall_car_id)) || null
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#e5e7eb", padding: "90px 20px 30px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.06em", fontSize: "3rem", color: "#fff", marginBottom: 8 }}>SIDE-BY-SIDE COMPARE</h1>
        <p style={{ color: "#9ca3af", marginBottom: 20 }}>Select 2-3 cars and compare key metrics with backend verdict.</p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          {selectedCars.map((car) => (
            <button
              key={car.id}
              type="button"
              onClick={() => removeCar(car.id)}
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)", color: "#f59e0b", borderRadius: 999, padding: "6px 12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <span>{car.title}</span>
              <span aria-hidden="true">×</span>
            </button>
          ))}
          {selectedCars.length > 0 && (
            <button type="button" onClick={clearAll} style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171", borderRadius: 999, padding: "6px 12px", cursor: "pointer" }}>
              Clear All
            </button>
          )}
        </div>

        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search car to add"
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 12px", color: "#fff", marginBottom: 10 }}
        />

        {selectedCars.length < MAX_COMPARE && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10, marginBottom: 20 }}>
            {filtered.slice(0, 12).map((car) => (
              <button key={car.id} onClick={() => addCar(car)} style={{ textAlign: "left", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 12, color: "#e5e7eb", cursor: "pointer" }}>
                <div style={{ fontWeight: 600 }}>{car.title}</div>
                <div style={{ color: "#f59e0b", marginTop: 4 }}>₹{(Number(car.price || 0) / 100000).toFixed(2)}L</div>
              </button>
            ))}
          </div>
        )}

        {overallWinner && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <div style={{ color: "#f59e0b", fontWeight: 700 }}>Best Overall: {overallWinner.title}</div>
            <div style={{ color: "#d1d5db", fontSize: 14 }}>{verdict?.summary}</div>
          </div>
        )}

        {error && (
          <div style={{ marginBottom: 12, color: "#fca5a5", fontSize: 14 }}>{error}</div>
        )}

        {loading ? (
          <p style={{ color: "#9ca3af" }}>Loading comparison...</p>
        ) : (
          <div style={{ overflowX: "auto", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  <th style={{ textAlign: "left", padding: 12, color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Metric</th>
                  {[0, 1, 2].map((index) => (
                    <th key={index} style={{ textAlign: "left", padding: 12, color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      {selectedCars[index]?.title || "-"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SPEC_ROWS.map((row) => {
                  const winnerId = getWinner(row.key);
                  return (
                    <tr key={row.key}>
                      <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}>{row.icon} {row.label}</td>
                      {[0, 1, 2].map((index) => {
                        const car = selectedCars[index];
                        const isWinner = car && String(winnerId) === String(car.id);
                        return (
                          <td key={`${row.key}-${index}`} style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.08)", color: isWinner ? "#f59e0b" : "#e5e7eb" }}>
                            {car ? row.format(car[row.key]) : "-"} {isWinner ? "👑" : ""}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
