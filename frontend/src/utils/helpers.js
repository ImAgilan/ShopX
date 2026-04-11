export const getImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return "https://placehold.co/400x400?text=No+Image";
  }
  if (url.startsWith("http")) return url;
  return `/uploads/${url}`;
};

export const truncate = (str, n = 100) => str?.length > n ? str.slice(0, n) + "..." : str;

export const getOrderStatusColor = (status) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    paid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    processing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export const getPaymentStatusColor = (status) => {
  const colors = {
    pending: "text-yellow-600", paid: "text-green-600",
    failed: "text-red-600", refunded: "text-blue-600",
  };
  return colors[status] || "text-gray-600";
};

export const getRatingStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => ({
    filled: i < Math.floor(rating),
    half: i === Math.floor(rating) && rating % 1 >= 0.5,
  }));
};

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
};