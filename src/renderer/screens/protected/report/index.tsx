/* eslint-disable camelcase */
import TotalDifferenceWidget from 'UI/components/Widgets/TotalDifferenceWidget';
import PaidTwoToneIcon from '@mui/icons-material/PaidTwoTone';
import TableRestaurantTwoToneIcon from '@mui/icons-material/TableRestaurantTwoTone';
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
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
import { Button, ButtonGroup, Chip } from '@mui/material';
import useSearch from 'UI/hooks/useSearch';
// import formatCurrency from 'UI/helpers/formatCurrency';
// import ReceiptIcon from '@mui/icons-material/Receipt';
import LiquidFillChart from 'UI/components/Charts/LiquidFillChart';
import GraphWithDate from 'UI/components/Graphs/GraphWithDate';
import useErrorHandler from 'UI/hooks/useErrorHandler';
import useAlert from 'UI/hooks/useAlert';
import useConfirm from 'UI/hooks/useConfirm';

const colorsPalette = ['#9C27B0', '#B02780', '#5727B0'];

const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontSize: 20,
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

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
  const errorHandler = useErrorHandler();
  const confirm = useConfirm();
  const { displayAlert } = useAlert();
  const { setPlaceHolder, setDisabled } = useSearch();
  const hiddenInputRef = useRef<any>();

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
  // const revenue = report?.daily_overview_reports.revenue;
  const orders = report?.daily_overview_reports?.orders ?? {
    total: 0,
    has_increased: false,
    difference_yesterday: 0,
  };
  // const soldItems = report?.daily_overview_reports.sold_items;
  const currSalesReport = report?.current_sale_reports ?? [];
  const trendCategories = report?.trend_categories ?? [];
  const trendProducts = report?.trend_products ?? [];
  const dbAvailableSpace = report?.space_report ?? { percentage: 0 };

  useEffect(() => {
    setPlaceHolder?.('Search is disabled here');
    setDisabled?.(true);
  }, [setDisabled, setPlaceHolder]);

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      confirm?.('Do you really want to import this file?', async (agreed) => {
        if (agreed) {
          const res = await window.import.importDatabase(file.path);

          if (res.status === 'ERROR') {
            errorHandler({
              errors: res.errors,
            });

            return;
          }

          displayAlert?.('Successfully imported database', 'success');
        }
      })
    }
  }

  const handleImportBegin = () => {
    hiddenInputRef.current?.click();
  }

  const handleExport = async () => {
    const res = await window.export.exportDatabase();

    if (res.status === 'ERROR') {
      return errorHandler({
        errors: res.errors,
      });
    }

    displayAlert?.('Successfully backed-up database', 'success');
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full h-fit flex flex-row justify-between items-center">
        <div className="p-3">
          <div className="py-3 text-gray-500">
            <p className="text-lg font-bold">Today total overview</p>
          </div>
          <div className="flex flex-row gap-5">
            {/* <TotalDifferenceWidget
              total={formatCurrency(
                Math.abs(revenue?.total) ?? 0
              )}
              hasIncreased={revenue?.has_increased}
              icon={<PaidTwoToneIcon color="secondary" />}
              differenceYesterday={revenue?.difference_yesterday ?? 0}
              label="Revenue"
            /> */}
            <TotalDifferenceWidget
              total={orders?.total ?? 0}
              hasIncreased={orders?.has_increased}
              icon={<TableRestaurantTwoToneIcon color="secondary" />}
              differenceYesterday={orders?.difference_yesterday}
              label="Releases"
            />
            {/* <TotalDifferenceWidget
              total={soldItems?.total ?? 0}
              hasIncreased={soldItems?.has_increased}
              icon={<ReceiptIcon color="secondary" />}
              differenceYesterday={soldItems?.difference_yesterday}
              label="Released Items"
            /> */}
          </div>
        </div>
      </div>
      <div className="grow w-full mt-5">
        {/* SALES */}
        <div className="p-3 text-gray-500">
          <p className="text-lg font-bold">Release Graphs</p>
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
                    label: 'Today Release Report',
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

          <GraphWithDate title="Report History" />
        </div>

        {/* TRENDS */}
        <div className="p-3 text-gray-500">
          <p className="text-lg mt-[40px] font-bold">Trend Graphs</p>
        </div>
        <div className="px-3 flex flex-wrap justify-between items-center gap-5 transition-all">
          <div className="grow min-w-[700px] h-fit p-5 border shadow-lg rounded relative flex">
            <div className='absolute top-5 left-5'>
              <Chip
                label="Trend Categories"
                color="secondary"
                variant="outlined"
                size="medium"
              />
            </div>
            {isLoading ? (
              <Loading />
            ) : (
              <PieChart
                colors={colorsPalette}
                sx={{
                  [`& .${pieArcLabelClasses.root}`]: {
                    fill: 'rgba(0, 0, 0, 0.6)',
                    fontWeight: 'bold',
                    position: 'relative',
                  },
                }}
                height={300}
                series={[
                  {
                    cornerRadius: 7,
                    data: trendCategories?.map?.(({ category_name, frequency }) => ({
                      label: category_name,
                      value: frequency ?? 0,
                    })),
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    faded: { innerRadius: 90, additionalRadius: -5 },
                    innerRadius: 100,
                  },
                ]}
              >
                <PieCenterLabel> Trend Category </PieCenterLabel>
              </PieChart>
            )}
          </div>
          <div className="grow min-w-[700px] h-fit p-5 border shadow-lg rounded relative flex">
            <div className='absolute top-5 left-5'>
              <Chip
                label="Trend Products"
                color="secondary"
                variant="outlined"
                size="medium"
              />
            </div>
            {isLoading ? (
              <Loading />
            ) : (
              <PieChart
                colors={colorsPalette}
                sx={{
                  [`& .${pieArcLabelClasses.root}`]: {
                    fill: 'rgba(0, 0, 0, 0.6)',
                    fontWeight: 'bold',
                  },
                }}
                height={300}
                series={[
                  {
                    cornerRadius: 7,
                    data: trendProducts?.map?.(({ product_name, frequency }) => ({
                      label: product_name,
                      value: frequency ?? 0,
                    })),
                    arcLabelMinAngle: 10,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    faded: { innerRadius: 90, additionalRadius: -5 },
                    innerRadius: 100,
                  },
                ]}
              >
                <PieCenterLabel> Trend Products </PieCenterLabel>
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
              <div className='w-full h-fit flex justify-between'>
                <Chip
                  label="Device Space"
                  color="secondary"
                  variant="outlined"
                  size="medium"
                />

                <VisuallyHiddenInput
                  ref={hiddenInputRef}
                  type="file"
                  accept=".sqlite, .db"
                  onChange={handleImport}
                />

                <ButtonGroup color="secondary" size='small'>
                  {/* <Button onClick={handleImportBegin}>Import</Button> */}
                  <Button onClick={handleExport}>Export</Button>
                </ButtonGroup>
              </div>
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
