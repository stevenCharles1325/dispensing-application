/* eslint-disable camelcase */
import TotalDifferenceWidget from 'UI/components/Widgets/TotalDifferenceWidget';
import PaidTwoToneIcon from '@mui/icons-material/PaidTwoTone';
import TableRestaurantTwoToneIcon from '@mui/icons-material/TableRestaurantTwoTone';
import React, { useEffect } from 'react';
import {
  BarChart,
  LineChart,
  PieChart,
  pieArcLabelClasses,
  useDrawingArea,
} from '@mui/x-charts';
import { useQuery } from '@tanstack/react-query';
import IReport from 'App/interfaces/report/report.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import Loading from 'UI/components/Loading';
import styled from '@mui/material/styles/styled';
import { Chip } from '@mui/material';
import useSearch from 'UI/hooks/useSearch';

const colorsPalette = ['#9C27B0', '#B02780', '#5727B0'];

const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontSize: 20,
}));

function PieCenterLabel({ children }: { children: React.ReactNode }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

const getReport = async (): Promise<
  IResponse<IReport | IPOSError[] | string[]>
> => {
  const res = await window.report.getReport();

  return res;
};

export default function Report() {
  const { setPlaceHolder, setDisabled } = useSearch();
  const {
    data,
    isLoading,
    refetch: refetchItems,
  } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await getReport();

      return res;
    },
  });

  const report: IReport = data?.data as IReport;
  const revenue = report?.daily_overview_reports.revenue;
  const orders = report?.daily_overview_reports.orders;
  const currSalesReport = report?.current_sale_reports;
  const trendSales = report?.trend_sales;

  useEffect(() => {
    setPlaceHolder?.('Search is disabled here');
    setDisabled?.(true);
  }, [setDisabled, setPlaceHolder]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full h-fit flex flex-row justify-between items-center">
        <div className="p-3">
          <div className="py-3 text-gray-500">
            <p className="text-lg font-bold">Total overview</p>
          </div>
          <div className="flex flex-row gap-5">
            <TotalDifferenceWidget
              total={revenue?.total ?? 0}
              hasIncreased={revenue?.has_increased}
              icon={<PaidTwoToneIcon color="secondary" />}
              differenceYesterday={revenue?.difference_yesterday ?? 0}
              label="Revenue"
            />
            <TotalDifferenceWidget
              total={orders?.total ?? 0}
              hasIncreased={orders?.has_increased}
              icon={<TableRestaurantTwoToneIcon color="secondary" />}
              differenceYesterday={orders?.difference_yesterday}
              label="Orders"
            />
          </div>
        </div>
      </div>
      <div className="grow w-full mt-5">
        <div className="p-3 text-gray-500">
          <p className="text-lg font-bold">Sales Graphs</p>
        </div>
        <div className="flex flex-col px-3 gap-5">
          <div className="border p-2 rounded shadow">
            {isLoading ? (
              <div className="w-[1000px] h-[500px]">
                <Loading />
              </div>
            ) : (
              <LineChart
                height={500}
                series={[
                  {
                    data: currSalesReport?.map?.(({ count }) => count),
                    label: 'Current Sales Report',
                    area: true,
                    showMark: false,
                    color: '#9c27b0',
                  },
                ]}
                xAxis={[
                  {
                    scaleType: 'point',
                    label: 'Time',
                    data: currSalesReport?.map?.(({ hour }) => `${hour}:00`),
                  },
                ]}
                sx={{
                  '.MuiLineElement-root': {
                    display: 'none',
                  },
                }}
              />
            )}
          </div>
          <div className="grow flex flex-row justify-between items-center gap-5">
            <div className="w-fit h-fit p-5 border shadow-lg rounded">
              <Chip
                label="Trends"
                color="secondary"
                variant="outlined"
                size="medium"
              />
              {isLoading ? (
                <Loading />
              ) : (
                <PieChart
                  colors={colorsPalette}
                  sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                      fill: 'rgba(0, 0, 0, 0.7)',
                      fontWeight: 'bold',
                    },
                  }}
                  margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  width={800}
                  height={500}
                  series={[
                    {
                      cornerRadius: 15,
                      arcLabel: (item) => `${item.label} (${item.value})`,
                      arcLabelMinAngle: 45,
                      data: trendSales.map(({ category_name, frequency }) => ({
                        label: category_name,
                        value: frequency,
                      })),
                      innerRadius: 200,
                    },
                  ]}
                >
                  <PieCenterLabel> Trend Category </PieCenterLabel>
                </PieChart>
              )}
            </div>
            <div className="grow h-[570px] p-5 border shadow-lg rounded">
              <div>
                <p>Feature coming soon</p>
              </div>
              {/* <BarChart
                dataset={[]}
                yAxis={[{ scaleType: 'band', dataKey: 'month' }]}
                series={[{ dataKey: 'seoul', label: 'Seoul rainfall', valueFormatter }]}
                layout="horizontal"
                xAxis={[
                  {
                    label: 'rainfall (mm)',
                  },
                ]}
                width={500}
                height={400}
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
