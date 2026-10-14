export const CATEGORIES = ['Produce', 'Dairy', 'Meat & Fish', 'Grains', 'Pantry Staples', 'Spices', 'Frozen', 'Beverages', 'Other']
export const DIET_OPTIONS = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Halal', 'Kosher', 'Dairy-Free', 'Nut Allergy', 'Shellfish Allergy', 'Egg Allergy']

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((new Date(y, m - 1, d) - today) / 86400000)
}

export function freshness(dateStr) {
  const d = daysUntil(dateStr)
  if (d === null) return { label: 'No expiry', cls: 'bg-slate-500/15 text-slate-500 dark:text-slate-300', level: 'none' }
  if (d < 0) return { label: `Expired ${-d}d ago`, cls: 'bg-rose-600 text-white', level: 'expired' }
  if (d === 0) return { label: 'Expires today', cls: 'bg-rose-500 text-white', level: 'soon' }
  if (d <= 3) return { label: `${d}d left`, cls: 'bg-amber-400 text-black', level: 'soon' }
  if (d <= 7) return { label: `${d}d left`, cls: 'bg-yellow-300/90 text-black', level: 'ok' }
  return { label: 'Fresh', cls: 'bg-emerald-500 text-white', level: 'fresh' }
}
