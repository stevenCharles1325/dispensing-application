import Loading from "../Loading";
import { LineChart } from "@mui/x-charts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Chip, IconButton, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

const views = ['DAILY', 'MONTHLY', 'YEARLY'] as const;

interface GrapWithDateProps {
  data: { period: string, count: number }[];
  title: string;
  loading: boolean;
  height?: number;
  onChange?: (startDate: Date, endDate: Date, groupBy: (typeof views)[number]) => void
}

const GraphWithDate = (props: GrapWithDateProps) => {
  const {
    loading,
    data,
    title,
    height,
    onChange,
  } = props;

  const [view, setView] = useState<(typeof views)[number]>('DAILY');

  const [startingDate, setStartingDate] = useState<Date | null>(null);
  const [endingDate, setEndingDate] = useState<Date>(new Date());

  const generateStartDate = useCallback(() => {
    const date = new Date(endingDate);
    const unitsToSubtract = 20;

    switch (view) {
      case 'DAILY':
        date.setDate(date.getDate() - unitsToSubtract);
        return date;

      case 'MONTHLY':
        date.setMonth(date.getMonth() - unitsToSubtract);
        return date;

      case 'YEARLY':
        date.setFullYear(date.getFullYear() - unitsToSubtract);
        return date;

      default:
        date.setDate(date.getDate() - unitsToSubtract);
        return date;
    }
  }, [view, endingDate]);

  const dateArray = useMemo(() => {
    const arrayOfDates = Array.from({ length: 20 }, (_, index) => {
      if (!startingDate) return null;
      const date = new Date(startingDate);

      switch (view) {
        case 'DAILY':
          date.setDate(date.getDate() + index);
          return date;

        case 'MONTHLY':
          date.setMonth(date.getMonth() + index);
          return date;

        case 'YEARLY':
          date.setFullYear(date.getFullYear() + index);
          return date;

        default:
          date.setDate(date.getDate() + index);
          return date;
      }
    });

    return arrayOfDates;
  }, [view, startingDate, endingDate]);

  const filledReports = useMemo(() => {
    if (!dateArray?.length || !data?.length) return [];

    return dateArray.map((date) => {
      const existingReport = data.find((report) => {
        if (!date) return false;

        return new Date(report.period).toLocaleDateString() === date.toLocaleDateString();
      });

      return existingReport
        ? {
          period: new Date(existingReport.period).toLocaleDateString(),
          count: existingReport.count,
        }
        : { period: date?.toLocaleDateString(), count: 0 };
    });
  }, [data, dateArray]);

  useEffect(() => {
    setStartingDate(generateStartDate());
  }, [generateStartDate, view]);

  const handleReset = useCallback(() => {
    const startDate = generateStartDate();
    const endDate = new Date();

    setEndingDate(startDate);
    setStartingDate(endDate);

    onChange?.(startDate, endDate, view);
  }, [view, onChange, generateStartDate]);

  const handleIncreaseDate = useCallback(() => {
    if (startingDate && endingDate) {
      const startDate = new Date(startingDate);
      const endDate = new Date(endingDate);

      switch (view) {
        case 'DAILY':
          startDate.setDate(startDate.getDate() + 1);
          endDate.setDate(endDate.getDate() + 1);
          break;

        case 'MONTHLY':
          startDate.setMonth(startDate.getMonth() + 1);
          endDate.setMonth(endDate.getMonth() + 1);
          break;

        case 'YEARLY':
          startDate.setFullYear(startDate.getFullYear() + 1);
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;

        default:
          startDate.setDate(startDate.getDate() + 1);
          endDate.setDate(endDate.getDate() + 1);
          break;
      }

      setStartingDate(startDate);
      setEndingDate(endDate);
      onChange?.(startDate, endDate, view);
    }
  }, [startingDate, endingDate, view, onChange]);

  const handleDecreaseDate = useCallback(() => {
    if (startingDate && endingDate) {
      const startDate = new Date(startingDate);
      const endDate = new Date(endingDate);

      switch (view) {
        case 'DAILY':
          startDate.setDate(startDate.getDate() - 1);
          endDate.setDate(endDate.getDate() - 1);
          break;

        case 'MONTHLY':
          startDate.setMonth(startDate.getMonth() - 1);
          endDate.setMonth(endDate.getMonth() - 1);
          break;

        case 'YEARLY':
          startDate.setFullYear(startDate.getFullYear() - 1);
          endDate.setFullYear(endDate.getFullYear() - 1);
          break;

        default:
          startDate.setDate(startDate.getDate() - 1);
          endDate.setDate(endDate.getDate() - 1);
          break;
      }

      setStartingDate(startDate);
      setEndingDate(endDate);
      onChange?.(startDate, endDate, view);
    }
  }, [startingDate, endingDate, view, onChange]);

  return (
    <div className="border p-2 rounded shadow">
      {loading ? (
        <div className="w-[1000px] h-[500px]">
          <Loading />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center gap-5 pl-3">
            <Chip
              label={`From: ${startingDate?.toDateString()} To: ${endingDate?.toDateString()}`}
              color="secondary"
              variant="outlined"
            />
            <div className="flex gap-5">
              <Button
                size="small"
                color="secondary"
                variant="outlined"
                onClick={handleReset}
              >
                Current Year
              </Button>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={view}
                onChange={(_, newValue) => {
                  if (newValue) {
                    setView(newValue);
                  }
                }}
                color="secondary"
                aria-label="Report-date-type"
              >
                <ToggleButton value="DAILY">Daily</ToggleButton>
                <ToggleButton value="MONTHLY">Monthly</ToggleButton>
                <ToggleButton value="YEARLY">Yearly</ToggleButton>
              </ToggleButtonGroup>
              <div>
                <IconButton onClick={handleDecreaseDate}>
                  <ChevronLeft/>
                </IconButton>
                <IconButton onClick={handleIncreaseDate}>
                  <ChevronRight/>
                </IconButton>
              </div>
            </div>
          </div>
          <div className="w-full h-full">
            {
              filledReports?.length && dateArray?.length
              ? (
                <LineChart
                  height={500}
                  series={[
                    {
                      data: filledReports?.map?.(({ count }) => count),
                      label: title,
                      area: true,
                      showMark: false,
                      color: '#9c27b0',
                    },
                  ]}
                  xAxis={[
                    {
                      scaleType: 'point',
                      label: 'Date',
                      data: dateArray.map((date) => date?.toLocaleDateString(
                        'default',
                        {
                          month: view !== 'YEARLY' ? 'short' : undefined,
                          day: view === 'DAILY' ? 'numeric' : undefined,
                          year: 'numeric'
                        }
                      )),
                    },
                  ]}
                  sx={{
                    '.MuiLineElement-root': {
                      display: 'none',
                    },
                  }}
                />
              )
              : null
            }
          </div>
        </div>
      )}
    </div>
  )
}

export default GraphWithDate;
