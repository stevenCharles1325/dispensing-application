/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  ImageListItem,
  ImageListItemBar,
  IconButton,
  ImageList,
} from '@mui/material';
import ImageDTO from 'App/data-transfer-objects/image.dto';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import {
  CellMeasurer,
  CellMeasurerCache,
  createMasonryCellPositioner,
  Masonry,
} from 'react-virtualized';
import { useCallback, useMemo, useState } from 'react';
import ImageMeasurer from 'react-virtualized-image-measurer';
import Loading from '../Loading';

// const ImageMeasurer = require('react-virtualized-image-measurer');

interface MainMansoryProps {
  // totalSize: number;
  totalSize: number;
  selectedIds: number[];
  itemsWithSizes: any;
  onPreviewImage?: (image: ImageDTO) => void;
  onSelectImage?: (id: number) => void;
  onScroll?: any;
  loading?: boolean;
  multiple?: boolean;
  onLoad?: (loadCount: number) => void;
}

interface ImageListProps
  extends Omit<MainMansoryProps, 'itemsWithSizes' | 'totalSize'> {
  images: ImageDTO[];
  // totalSize: number;
}

const columnWidth = 370;
const defaultHeight = 370;
const defaultWidth = columnWidth;

function MainMansory({
  loading,
  multiple,
  selectedIds,
  onPreviewImage,
  onSelectImage,
  onScroll,
  itemsWithSizes,
  onLoad,
}: MainMansoryProps) {
  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        defaultWidth,
        fixedWidth: true,
      }),
    []
  );

  const cellPositioner = useMemo(
    () =>
      createMasonryCellPositioner({
        cellMeasurerCache: cache,
        columnCount: 2,
        columnWidth,
        spacer: 10,
      }),
    [cache]
  );

  const cellRenderer = useCallback(
    ({ index, key, parent, style }: Record<string, any>) => {
      const { item: image, size } = itemsWithSizes[index];
      const height = columnWidth * (size.height / size.width) || defaultHeight;

      onLoad?.(index + 1);

      return (
        <CellMeasurer cache={cache} index={index} key={key} parent={parent}>
          <div style={style}>
            <img
              src={image.url}
              alt={image.name}
              loading="lazy"
              height={height}
              width={columnWidth}
              className="cursor-pointer"
              onClick={() => onPreviewImage?.(image)}
            />
            <ImageListItemBar
              title={image.name}
              subtitle={`Uploaded By: ${
                `${image.uploader?.first_name} ${image.uploader?.last_name}` ??
                'Please try again'
              }`}
              actionIcon={
                <IconButton
                  sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                  aria-label={`info about ${image.name}`}
                  onClick={() => onSelectImage?.(image.id)}
                  disabled={Boolean(
                    !multiple &&
                      selectedIds.length >= 1 &&
                      selectedIds[0] !== image.id
                  )}
                >
                  {selectedIds.includes(image.id) ? (
                    <CheckBoxIcon />
                  ) : (
                    <CheckBoxOutlineBlankIcon />
                  )}
                </IconButton>
              }
            />
          </div>
        </CellMeasurer>
      );
    },
    [
      cache,
      itemsWithSizes,
      multiple,
      onLoad,
      onPreviewImage,
      onSelectImage,
      selectedIds,
    ]
  );

  return (
    <Masonry
      autoHeight
      cellCount={itemsWithSizes.length}
      cellMeasurerCache={cache}
      cellPositioner={cellPositioner}
      cellRenderer={cellRenderer}
      height={2000}
      width={750}
    />
  );
}

/*
  TO ADD:
    Infinite-scroll
      - https://www.npmjs.com/package/react-infinite-scroll-component

    Then whenever the scroll is almost at the end or top, fetch new data
    and add it to the image-list
*/

export default function AppImageList({
  images,
  loading,
  multiple,
  selectedIds,
  onPreviewImage,
  onSelectImage,
  onScroll,
}: ImageListProps) {
  const [loadedCount, setLoadedCount] = useState(0);
  const isLoading = loadedCount !== images.length;

  return (
    <ImageMeasurer
      items={images}
      image={(item: ImageDTO) => item.url}
      defaultHeight={defaultHeight}
      defaultWidth={defaultWidth}
      onScroll={onScroll}
    >
      {({ itemsWithSizes }: any) => (
        <>
          <MainMansory
            totalSize={images.length}
            onLoad={(count) =>
              setLoadedCount((loadCount) =>
                loadCount > count ? loadCount : count
              )
            }
            loading={loading}
            multiple={multiple}
            selectedIds={selectedIds}
            onPreviewImage={onPreviewImage}
            onSelectImage={onSelectImage}
            onScroll={onScroll}
            itemsWithSizes={itemsWithSizes}
          />
          {isLoading || loading ? (
            <div className="w-full h-auto p-3">
              <Loading />
            </div>
          ) : null}
        </>
      )}
    </ImageMeasurer>
  );
}
