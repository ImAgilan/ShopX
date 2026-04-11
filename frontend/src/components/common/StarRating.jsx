import { Star } from "lucide-react";
export default function StarRating({ rating, numReviews, size = "sm" }) {
  const sz = size === "sm" ? 13 : 17;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={sz}
            fill={s <= Math.round(rating) ? "#F59E0B" : "none"}
            className={s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"} />
        ))}
      </div>
      {numReviews !== undefined && (
        <span className="text-xs text-[#6B7280]">({numReviews})</span>
      )}
    </div>
  );
}
