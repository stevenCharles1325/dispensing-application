/* eslint-disable camelcase */
import TotalDifferenceWidget from 'UI/components/Widgets/TotalDifferenceWidget';
import PaidTwoToneIcon from '@mui/icons-material/PaidTwoTone';
import TableRestaurantTwoToneIcon from '@mui/icons-material/TableRestaurantTwoTone';
import React, { useEffect, useMemo, useState } from 'react';
import {
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
import formatCurrency from 'UI/helpers/formatCurrency';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LiquidFillChart from 'UI/components/Charts/LiquidFillChart';
import GraphWithDate from 'UI/components/Graphs/GraphWithDate';

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

const UNITS_TO_SUBTRACT = 20;
const DATE = new Date();
DATE.setDate(DATE.getDate() - UNITS_TO_SUBTRACT);

export default function Report() {
  const { setPlaceHolder, setDisabled } = useSearch();
  const [startDate, setStartDate] = useState(DATE.toString());
  const [endDate, setEndDate] = useState(new Date().toString());
  const [groupBy, setGroupBy] = useState<'DAILY' | 'MONTHLY' | 'YEARLY'>('DAILY');

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

  const {
    data: reportHistory,
    isLoading: isRepHistoryLoading,
  } = useQuery({
    queryKey: ['report-history', startDate, endDate, groupBy],
    queryFn: async () => {
      const res = await getReportHistory(
        startDate.toString(),
        endDate.toString(),
        groupBy
      );

      return res;
    },
  });

  console.log(startDate, endDate, groupBy);
  const report: IReport = data?.data as IReport;
  const revenue = report?.daily_overview_reports.revenue;
  const orders = report?.daily_overview_reports.orders;
  const soldItems = report?.daily_overview_reports.sold_items;
  const currSalesReport = report?.current_sale_reports;
  const trendCategories = report?.trend_categories;
  const trendProducts = report?.trend_products;
  const dbAvailableSpace = report?.space_report;

  useEffect(() => {
    setPlaceHolder?.('Search is disabled here');
    setDisabled?.(true);
  }, [setDisabled, setPlaceHolder]);

  const dataReportHistory = useMemo(() => reportHistory?.data, [reportHistory]);
  console.log('REPORT HISTORY: ', reportHistory);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full h-fit flex flex-row justify-between items-center">
        <div className="p-3">
          <div className="py-3 text-gray-500">
            <p className="text-lg font-bold">Today total overview</p>
          </div>
          <div className="flex flex-row gap-5">
            <TotalDifferenceWidget
              total={formatCurrency(
                revenue?.total ?? 0
              )}
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
            <TotalDifferenceWidget
              total={soldItems?.total ?? 0}
              hasIncreased={soldItems?.has_increased}
              icon={<ReceiptIcon color="secondary" />}
              differenceYesterday={soldItems?.difference_yesterday}
              label="Sold Items"
            />
          </div>
        </div>
      </div>
      <div className="grow w-full mt-5">
        {/* SALES */}
        <div className="p-3 text-gray-500">
          <p className="text-lg font-bold">Sales Graphs</p>
        </div>
        <div className="flex flex-col px-3 gap-5">
          {/*Current sales report*/}
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
                    label: 'Today Sales Report',
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

          {
            dataReportHistory
            ? (
              <GraphWithDate
                loading={isRepHistoryLoading}
                title="Report History"
                data={dataReportHistory}
                onChange={(start, end, groupBy) => {
                  console.log(start, end);
                  setStartDate(() => start.toString());
                  setEndDate(() => end.toString());
                  setGroupBy(() => groupBy);
                }}
              />
            )
            : null
          }
          {/*Daily sales report*/}
          {/* <div className="border p-2 rounded shadow">
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
                    label: 'Daily Sales Report',
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
          </div> */}

          {/*Monthly sales report*/}
          {/* <div className="border p-2 rounded shadow">
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
                    label: 'Monthly Sales Report',
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
          </div> */}

          {/*Annual sales report*/}
          {/* <div className="border p-2 rounded shadow">
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
                    label: 'Annual Sales Report',
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
          </div> */}
        </div>

        {/* TRENDS */}
        <div className="p-3 text-gray-500">
          <p className="text-lg mt-[40px] font-bold">Trend Graphs</p>
        </div>
        <div className="px-3 grow flex flex-wrap justify-between items-center gap-5">
          <div className="grow h-fit p-5 border shadow-lg rounded">
            <Chip
              label="Trend Categories"
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
                width={720}
                height={500}
                series={[
                  {
                    cornerRadius: 15,
                    arcLabel: (item) => `${item.label} (${item.value})`,
                    arcLabelMinAngle: 45,
                    data: trendCategories.map(({ category_name, frequency }) => ({
                      label: category_name,
                      value: frequency ?? 0,
                    })),
                    innerRadius: 200,
                  },
                ]}
              >
                <PieCenterLabel> Trend Category </PieCenterLabel>
              </PieChart>
            )}
          </div>
          <div className="grow h-fit p-5 border shadow-lg rounded">
            <Chip
              label="Trend Products"
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
                width={720}
                height={500}
                series={[
                  {
                    cornerRadius: 15,
                    arcLabel: (item) => `${item.label} (${item.value})`,
                    arcLabelMinAngle: 45,
                    data: trendProducts.map(({ product_name, frequency }) => ({
                      label: product_name,
                      value: frequency ?? 0,
                    })),
                    innerRadius: 200,
                  },
                ]}
              >
                <PieCenterLabel> Trend Category </PieCenterLabel>
              </PieChart>
            )}
          </div>
        </div>

        {/* SYSTEM INFO */}
        <div className="p-3 text-gray-500">
          <p className="text-lg mt-[40px] font-bold">System Info</p>
        </div>
        <div className="px-3 gap-5">
          <div className="grow h-[570px] p-5 border shadow-lg rounded">
            <div className="w-full h-full">
              <Chip
                label="Device Space"
                color="secondary"
                variant="outlined"
                size="medium"
              />
              {
                dbAvailableSpace
                ? (
                  <div className='w-full h-full flex justify-center items-center'>
                    <LiquidFillChart
                      value={dbAvailableSpace.percentage * 100 ?? 0}
                    />
                  </div>
                )
                : null
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
