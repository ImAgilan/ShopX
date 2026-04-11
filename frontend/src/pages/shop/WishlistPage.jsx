import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import ProductCard from "../../components/common/ProductCard";

export default function WishlistPage() {
  const { user } = useSelector((s) => s.auth);
  const wishlist = user?.wishlist || [];
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8" style={{ color: "#1F2937" }}>Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={64} className="mx-auto mb-4 opacity-30" style={{ color: "#1F2937" }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: "#1F2937" }}>Your wishlist is empty</h3>
          <Link to="/products"><button className="btn-primary mt-4">Browse Products</button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(product => <ProductCard key={product._id} product={product} />)}
        </div>
      )}
    </div>
  );
}
