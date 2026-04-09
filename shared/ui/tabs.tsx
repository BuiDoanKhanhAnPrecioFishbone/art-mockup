interface TabItem {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ items, activeKey, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-gray-200">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
            activeKey === item.key
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {item.label}
          {item.count !== undefined && (
            <span
              className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs ${
                activeKey === item.key
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {item.count}
            </span>
          )}
          {activeKey === item.key && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
