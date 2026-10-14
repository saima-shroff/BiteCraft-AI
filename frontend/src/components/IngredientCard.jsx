import { freshness } from '../utils'

export default function IngredientCard({ item, onEdit, onDelete, selected, onSelect }) {
  const f = freshness(item.expiration_date)
  const selectable = !!onSelect
  return (
    <div
      onClick={selectable ? () => onSelect(item.id) : undefined}
      className={`card card-hover animate-pop ${selectable ? 'cursor-pointer' : ''} ${selected ? '!border-brand-500 shadow-glow' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{item.name}</h3>
          <p className="text-xs text-slate-500">{item.category}</p>
        </div>
        {selectable
          ? <input type="checkbox" readOnly checked={!!selected} className="mt-1 h-4 w-4 accent-violet-500" />
          : <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${f.cls}`}>{f.label}</span>}
      </div>
      <p className="mt-3 text-2xl font-extrabold">{item.quantity} <span className="text-sm font-medium text-slate-500">{item.unit}</span></p>
      {selectable && <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${f.cls}`}>{f.label}</span>}
      {!selectable && (
        <div className="mt-4 flex gap-2">
          <button className="btn-ghost flex-1 !py-1.5" onClick={() => onEdit(item)}>Edit</button>
          <button className="btn-danger !py-1.5" onClick={() => onDelete(item)}>Delete</button>
        </div>
      )}
    </div>
  )
}
