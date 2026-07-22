export default function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-slate-400 leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white/20 shrink-0"></span>
          {item}
        </li>
      ))}
    </ul>
  );
}
