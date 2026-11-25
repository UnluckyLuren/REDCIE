export default function SelloAuditoria({ fecha, estado }) {
  return (
    <div className="flex items-center gap-2 bg-surface-container-low px-4 py-3 rounded-lg shadow-sm border border-surface-container">
      <span className="material-symbols-outlined text-primary">verified_user</span>
      <div className="flex flex-col">
        <span className="text-label-sm text-on-surface-variant uppercase">Última Auditoría</span>
        <span className="text-label-md font-bold text-primary">{fecha || 'Sin auditoría'}</span>
      </div>
    </div>
  );
}
