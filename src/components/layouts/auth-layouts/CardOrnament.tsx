export function CardOrnament() {
  return (
    <>
      <span className="absolute top-0.75 left-0.75 w-3 h-3 border-t border-l border-[#e0a83a]/60 pointer-events-none" />
      <span className="absolute top-0.75 right-0.75 w-3 h-3 border-t border-r border-[#e0a83a]/60 pointer-events-none" />
      <span className="absolute bottom-0.75 left-0.75 w-3 h-3 border-b border-l border-[#e0a83a]/60 pointer-events-none" />
      <span className="absolute bottom-0.75 right-0.75 w-3 h-3 border-b border-r border-[#e0a83a]/60 pointer-events-none" />
      <span
        className="absolute -top-px left-6 w-12 h-0.5 bg-[#e0a83a] pointer-events-none"
        style={{ boxShadow: "0 0 8px rgba(224,168,58,0.6)" }}
      />
    </>
  );
}
