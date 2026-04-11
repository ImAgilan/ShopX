export default function LoadingSpinner({ size = "md", fullPage = false }) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };
  const spinner = (
    <div className={`${sizes[size]} border-[3px] border-[#FFE5D0] rounded-full animate-spin`}
      style={{ borderTopColor: "var(--primary)" }} />
  );
  if (fullPage) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50">
      {spinner}
    </div>
  );
  return <div className="flex justify-center py-10">{spinner}</div>;
}
