import React from 'react';
import ChangeHistoryTwoToneIcon from '@mui/icons-material/ChangeHistoryTwoTone';

interface TotalDifferenceWidgetProps {
  icon: React.ReactNode;
  label: string;
  differenceYesterday: number;
  hasIncreased: boolean;
  // eslint-disable-next-line react/require-default-props
  total?: string | number;
}

export default function TotalDifferenceWidget({
  icon,
  label,
  total,
  differenceYesterday,
  hasIncreased,
}: TotalDifferenceWidgetProps) {
  return (
    <div className="p-5 min-w-[200px] w-fit h-[150px] flex flex-col justify-around rounded border shadow hover:shadow-md">
      <div className="w-full">
        <div className="gap-2 flex flex-row justify-start items-center">
          <h1 className="text-7xl" style={{ color: 'var(--text-color)' }}>
            {total ?? 0}
          </h1>
          <div className="w-fit h-fit">{icon}</div>
        </div>
        <div className="flex flex-row justify-between">
          <b
            className="text-center capitalize"
            style={{ color: 'var(--info-text-color)' }}
          >
            {label}
          </b>
          {differenceYesterday ? (
            <p className="text-sm text-gray-400">
              {hasIncreased ? (
                <ChangeHistoryTwoToneIcon color="success" fontSize="inherit" />
              ) : (
                <ChangeHistoryTwoToneIcon
                  color="error"
                  className="rotate-180"
                  fontSize="inherit"
                />
              )}
              {`${hasIncreased ? '+' : '-'} ${differenceYesterday}%`}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
