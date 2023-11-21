import Loading from "../Loading";
import { LineChart } from "@mui/x-charts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Chip, IconButton, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import IReport from "App/interfaces/report/report.interface";
import { useQuery } from "@tanstack/react-query";

const UNITS_TO_SUBTRACT = 20;

const views = ['DAILY', 'MONTHLY', 'YEARLY'] as const;

type GraphData = { period: string; count: number };

interface GrapWithDateProps {
  title: string;
  loading?: boolean;
  height?: number;
  onChange?: (startDate: Date, endDate: Date, groupBy: (typeof views)[number]) => void
}

const getReportHistory = async (
  startDate: string | null = null,
  endDate: string = new Date().toString(),
  groupBy: 'DAILY' | 'MONTHLY' | 'YEARLY' = 'DAILY'
): Promise<
  IResponse<IReport | IPOSError[] | string[]>
> => {
  const res = await window.report.getReportHistory(
    startDate,
    endDate,
    groupBy,
  );

  return res;
};

const GraphWithDate = (props: GrapWithDateProps) => {
  const {
    loading,
    title,
    height,
    onChange,
  } = props;

  const [view, setView] = useState<(typeof views)[number]>('DAILY');

  const [startingDate, setStartingDate] = useState<Date | null>(null);
  const [endingDate, setEndingDate] = useState<Date>(new Date());

  const generateStartDate = useCallback(() => {
    const date = new Date(endingDate);

    switch (view) {
      case 'DAILY':
        date.setDate(date.getDate() - UNITS_TO_SUBTRACT);
        return date;

      case 'MONTHLY':
        date.setMonth(date.getMonth() - (UNITS_TO_SUBTRACT - 1));
        return date;

      case 'YEARLY':
        date.setFullYear(date.getFullYear() - UNITS_TO_SUBTRACT);
        return date;

      default:
        date.setDate(date.getDate() - UNITS_TO_SUBTRACT);
        return date;
    }
  }, [view, endingDate]);

  const dateArray = useMemo(() => {
    if (!startingDate) return [];

    const arrayOfDates = Array.from({ length: UNITS_TO_SUBTRACT }, (_, index) => {
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
  }, [view, startingDate]);

  const {
    data: reportHistory,
    isLoading: isRepHistoryLoading,
  } = useQuery({
    queryKey: ['report-history', startingDate, endingDate, view],
    queryFn: async () => {
      if (startingDate) {
        const res = await getReportHistory(
          startingDate.toString(),
          endingDate.toString(),
          view
        );

        return res;
      }

      return null;
    },
  });

  const dataReportHistory: GraphData[] | null = useMemo(() =>
    (reportHistory?.data as unknown as GraphData[]) ?? [],
    [reportHistory]
  );

  const filledReports = useMemo(() => {
    if (!dateArray || !dateArray?.length) return [];

    return dateArray.map((date) => {
      const existingReport = dataReportHistory?.find?.((report) => {
        if (!date) return false;

        const dataDate = new Date(report.period).toLocaleDateString(
          'default',
          {
            month: view !== 'YEARLY' ? 'short' : undefined,
            day: view === 'DAILY' ? 'numeric' : undefined,
            year: 'numeric'
          }
        )

        const labelDate = date.toLocaleDateString(
          'default',
          {
            month: view !== 'YEARLY' ? 'short' : undefined,
            day: view === 'DAILY' ? 'numeric' : undefined,
            year: 'numeric'
          }
        )

        return dataDate === labelDate;
      });

      return existingReport
        ? {
          period: new Date(existingReport.period).toLocaleDateString(),
          count: existingReport.count,
        }
        : { period: date?.toLocaleDateString(), count: 0 };
    }) ?? [];
  }, [dataReportHistory, dateArray, view]);

  useEffect(() => {
    setStartingDate(generateStartDate());
  }, [view]);

  const handleReset = useCallback(() => {
    const endDate = new Date();
    const startDate = new Date();
    setEndingDate(endDate);

    switch (view) {
      case 'DAILY':
        startDate.setDate(startDate.getDate() - UNITS_TO_SUBTRACT);
        break;

      case 'MONTHLY':
        startDate.setMonth(startDate.getMonth() - (UNITS_TO_SUBTRACT - 1));
        break;

      case 'YEARLY':
        startDate.setFullYear(startDate.getFullYear() - UNITS_TO_SUBTRACT);
        break;

      default:
        startDate.setDate(startDate.getDate() - UNITS_TO_SUBTRACT);
        break;
    }

    setStartingDate(startDate);
  }, [view, onChange]);

  const handleIncreaseDate = useCallback(() => {
    if (startingDate && endingDate) {
      setStartingDate((date) => {
        if (!date) return date;
        const startDate = new Date(date);

        switch (view) {
          case 'DAILY':
            startDate.setDate(startDate.getDate() + 1);
            break;

          case 'MONTHLY':
            startDate.setMonth(startDate.getMonth() + 1);
            break;

          case 'YEARLY':
            startDate.setFullYear(startDate.getFullYear() + 1);
            break;

          default:
            startDate.setDate(startDate.getDate() + 1);
            break;
        }

        return startDate;
      });

      setEndingDate((date) => {
        if (!date) return date;
        const endDate = new Date(date);

        switch (view) {
          case 'DAILY':
            endDate.setDate(endDate.getDate() + 1);
            break;

          case 'MONTHLY':
            endDate.setMonth(endDate.getMonth() + 1);
            break;

          case 'YEARLY':
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;

          default:
            endDate.setDate(endDate.getDate() + 1);
            break;
        }

        return endDate;
      });
    }
  }, [startingDate, endingDate, view]);

  const handleDecreaseDate = useCallback(() => {
    if (startingDate && endingDate) {
      setStartingDate((date) => {
        if (!date) return date;
        const startDate = new Date(date);

        switch (view) {
          case 'DAILY':
            startDate.setDate(startDate.getDate() - 1);
            break;

          case 'MONTHLY':
            startDate.setMonth(startDate.getMonth() - 1);
            break;

          case 'YEARLY':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;

          default:
            startDate.setDate(startDate.getDate() - 1);
            break;
        }

        return startDate;
      });

      setEndingDate((date) => {
        if (!date) return date;
        const endDate = new Date(date);

        switch (view) {
          case 'DAILY':
            endDate.setDate(endDate.getDate() - 1);
            break;

          case 'MONTHLY':
            endDate.setMonth(endDate.getMonth() - 1);
            break;

          case 'YEARLY':
            endDate.setFullYear(endDate.getFullYear() - 1);
            break;

          default:
            endDate.setDate(endDate.getDate() - 1);
            break;
        }

        return endDate;
      });
    }
  }, [startingDate, endingDate, view]);

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
              label={`From: ${startingDate?.toLocaleDateString(
                'default',
                {
                  month: view !== 'YEARLY' ? 'short' : undefined,
                  day: view === 'DAILY' ? 'numeric' : undefined,
                  year: 'numeric'
                })
              } To: ${endingDate?.toLocaleDateString(
                'default',
                {
                  month: view !== 'YEARLY' ? 'short' : undefined,
                  day: view === 'DAILY' ? 'numeric' : undefined,
                  year: 'numeric'
                })
              }`}
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
                Current
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
                <IconButton onClick={handleDecreaseDate} onTouchEnd={handleDecreaseDate}>
                  <ChevronLeft/>
                </IconButton>
                <IconButton onClick={handleIncreaseDate} onTouchEnd={handleIncreaseDate}>
                  <ChevronRight/>
                </IconButton>
              </div>
            </div>
          </div>
          <div className="w-full h-full">
            {
              !isRepHistoryLoading && dateArray.length
              ? (
                <LineChart
                  height={height ?? 500}
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
                      data: dateArray?.map?.((date) => date?.toLocaleDateString(
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
              : (
                <div className="w-full h-[500px]">
                  <Loading />
                </div>
              )
            }
          </div>
        </div>
      )}
    </div>
  )
}

export default GraphWithDate;
