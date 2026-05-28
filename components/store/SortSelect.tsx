'use client'

export default function SortSelect({ value }: { value: string }) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const url = new URL(window.location.href)
    url.searchParams.set('tri', e.target.value)
    url.searchParams.delete('page')
    window.location.href = url.toString()
  }

  return (
    <select
      defaultValue={value}
      onChange={handleChange}
      className="rounded-md border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
    >
      <option value="recent">Plus récents</option>
      <option value="prix-asc">Prix croissant</option>
      <option value="prix-desc">Prix décroissant</option>
    </select>
  )
}
