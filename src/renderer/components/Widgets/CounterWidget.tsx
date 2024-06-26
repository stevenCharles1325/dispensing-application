import React from 'react';

interface CounterWidgetProps {
  icon: React.ReactNode;
  label: string;
  // eslint-disable-next-line react/require-default-props
  count?: string | number;
}

export default function CounterWidget({
  icon,
  label,
  count,
}: CounterWidgetProps) {
  return (
    <div className="p-5 min-w-[200px] w-fit h-[150px] flex flex-col justify-around rounded-md border shadow hover:shadow-md">
      <div className="w-full">
        <div className="gap-2 flex flex-row justify-start items-center">
          <h1 className="text-7xl" style={{ color: 'var(--text-color)' }}>
            {count ?? 0}
          </h1>
          <div className="w-fit h-fit">{icon}</div>
        </div>
        <b
          className="text-center capitalize"
          style={{ color: 'var(--info-text-color)' }}
        >
          {label}
        </b>
      </div>
    </div>
  );
}
