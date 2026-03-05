import { getPillar } from '@/lib/constants';

export default function PillarBadge({ pillarId }: { pillarId: string }) {
  const pillar = getPillar(pillarId);
  if (!pillar) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: pillar.bgColor, color: pillar.color }}
    >
      {pillar.icon} {pillar.name}
    </span>
  );
}
