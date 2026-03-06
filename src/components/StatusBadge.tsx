const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  'on-track': { bg: 'bg-green-100', text: 'text-green-700', label: 'On Track' },
  'off-track': { bg: 'bg-red-100', text: 'text-red-700', label: 'Off Track' },
  'completed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
  'expected': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Expected' },
  'carry-forward': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Carry Forward' },
  'drop': { bg: 'bg-red-100', text: 'text-red-600', label: 'Drop' },
  'proposed': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Proposed' },
  'approved': { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
  'needs-discussion': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Needs Discussion' },
  'parked': { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Parked' },
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
