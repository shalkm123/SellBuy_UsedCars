import { Heart, MapPin, Gauge, Fuel, Zap, Shield, TrendingDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice, getPriceTagColor, getFuelIcon } from "../data/mockData";

export default function CarCard({ car, wishlisted = false, onWishlist, showBid = false }) {
  const [liked, setLiked] = useState(wishlisted);
  const navigate = useNavigate();
  const trustScoreLabel = car.trustScore == null ? "Pending" : `${car.trustScore}% trust`;
  const trustScoreTone = car.trustScore == null ? "#6b7280" : car.trustScore >= 90 ? "#22c55e" : car.trustScore >= 75 ? "#f59e0b" : "#ef4444";

  const handleWishlist = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    if (onWishlist) onWishlist(car.id);
  };

  const discount = Math.round(((car.originalPrice - car.price) / car.originalPrice) * 100);

  return (
    <div
      className="glass rounded-2xl overflow-hidden card-hover cursor-pointer group"
      onClick={() => navigate(`/car/${car.id}`)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={car.image}
          alt={car.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon-900/80 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {car.verified && (
            <span className="badge bg-green-500/90 text-white text-[10px]">
              <Shield size={9} className="mr-1" /> Verified
            </span>
          )}
          {discount > 0 && (
            <span className="badge bg-amber-500/90 text-carbon-950 text-[10px]">
              <TrendingDown size={9} className="mr-1" /> {discount}% off
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            liked ? "bg-red-500 text-white" : "bg-black/40 text-white hover:bg-black/60"
          }`}
        >
          <Heart size={14} fill={liked ? "currentColor" : "none"} />
        </button>

        {/* Price tag overlay */}
        <div className="absolute bottom-3 left-3">
          <span className={`badge text-[10px] ${getPriceTagColor(car.priceTag)}`}>{car.priceTag}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-heading font-semibold text-white text-lg leading-tight line-clamp-1">
              {car.title}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-gray-500" />
              <span className="text-xs text-gray-500">{car.city}</span>
              <span className="text-gray-600 mx-1">·</span>
              <span className="text-xs text-gray-500">{car.owners} Owner</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-amber-400 font-heading font-bold text-xl">{formatPrice(car.price)}</div>
            {car.originalPrice > car.price && (
              <div className="text-gray-600 text-xs line-through">{formatPrice(car.originalPrice)}</div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 py-3 border-y border-carbon-700 my-3">
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Gauge size={12} />
            <span>{(car.km / 1000).toFixed(0)}k km</span>
          </div>
          <div className="w-px h-3 bg-carbon-600" />
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <span>{getFuelIcon(car.fuel)}</span>
            <span>{car.fuel}</span>
          </div>
          <div className="w-px h-3 bg-carbon-600" />
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <span>{car.transmission === "Automatic" ? "🔄" : "⚙️"}</span>
            <span>{car.transmission === "Automatic" ? "Auto" : "Manual"}</span>
          </div>
          <div className="w-px h-3 bg-carbon-600" />
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Zap size={11} />
            <span>{car.mileage}</span>
          </div>
        </div>

        {/* Trust score + CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div
                className="w-16 h-1.5 rounded-full bg-carbon-700 overflow-hidden"
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: car.trustScore == null ? "24%" : `${car.trustScore}%`,
                    background: trustScoreTone
                  }}
                />
              </div>
              <span className="text-xs" style={{ color: trustScoreTone }}>{trustScoreLabel}</span>
            </div>
          </div>
          {showBid ? (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/car/${car.id}`); }}
              className="text-xs font-medium bg-amber-500/20 border border-amber-500/40 text-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-500/30 transition-all"
            >
              Place Bid
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/car/${car.id}`); }}
              className="text-xs font-medium bg-amber-500 text-carbon-950 px-3 py-1.5 rounded-lg hover:bg-amber-400 transition-all"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}