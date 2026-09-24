export function StatusPill({ active }) {
  return (
    <span className={`status-pill ${active ? "active" : "inactive"}`}>
      <span className="status-dot" />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
