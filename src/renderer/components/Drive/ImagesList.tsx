/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { ImageListItemBar, IconButton } from '@mui/material';
import ImageDTO from 'App/data-transfer-objects/image.dto';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import {
  CellMeasurer,
  CellMeasurerCache,
  createMasonryCellPositioner,
  Masonry,
} from 'react-virtualized';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Loading from '../Loading';
import useAlert from 'UI/hooks/useAlert';

interface MainMansoryProps {
  editMode: boolean;
  images: ImageDTO[];
  totalSize: number;
  selectedIds: number[];
  onPreviewImage?: (image: ImageDTO) => void;
  onSelectImage?: (id: number) => void;
  loading?: boolean;
  multiple?: boolean;
  onLoad?: (loadCount: number) => void;
  onDelete?: (id: number) => void;
}

interface ImageListProps
  extends Omit<MainMansoryProps, 'itemsWithSizes' | 'totalSize' | 'height'> {
  hasNextPage: boolean;
  fetchNext?: (() => void) | null | undefined;
}

const columnWidth = 370;
const defaultHeight = 370;
const defaultWidth = columnWidth;

function MainMansory({
  editMode,
  multiple,
  selectedIds,
  onPreviewImage,
  onSelectImage,
  onLoad,
  images,
  onDelete,
}: MainMansoryProps) {
  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        defaultWidth,
        defaultHeight: 2000,
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
      if (!images[index]) return null;

      const image = images[index];
      const cardHeight = defaultHeight;

      return (
        <CellMeasurer cache={cache} index={index} key={key} parent={parent}>
          <div
            style={{ ...style }}
            className="border-2 rounded shadow bg-gray-100"
          >
            <img
              src={image.url}
              alt={image.name}
              style={{
                objectFit: 'cover',
                width: `${columnWidth}px`,
                height: `${cardHeight}px`,
              }}
              loading="lazy"
              className="cursor-pointer"
              onLoad={() => onLoad?.(index + 1)}
              onClick={() => onPreviewImage?.(image)}
            />
            <ImageListItemBar
              sx={{
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
                  'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
              }}
              position="top"
              actionIcon={
                <IconButton
                  aria-label={`delete ${image.name}`}
                  title="Delete"
                  onClick={() => onDelete?.(image.id)}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              }
              actionPosition="right"
            />
            <ImageListItemBar
              title={image.name}
              subtitle={`Uploaded By: ${
                `${image.uploader?.first_name} ${image.uploader?.last_name}` ??
                'Please try again'
              }`}
              actionIcon={
                editMode
                ? null
                : (
                  <IconButton
                    sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                    aria-label={`info about ${image.name}`}
                    onClick={() => onSelectImage?.(image.id)}
                    disabled={Boolean(
                      !multiple &&
                        selectedIds.length >= 1 &&
                        selectedIds[0] !== image.id
                    )}
                    title={selectedIds[0] !== image.id ? 'Select' : 'Deselect'}
                  >
                    {selectedIds.includes(image.id) ? (
                      <CheckBoxIcon />
                    ) : (
                      <CheckBoxOutlineBlankIcon />
                    )}
                  </IconButton>
                )
              }
            />
          </div>
        </CellMeasurer>
      );
    },
    [
      cache,
      images,
      multiple,
      onDelete,
      onLoad,
      onPreviewImage,
      onSelectImage,
      selectedIds,
    ]
  );

  return (
    <Masonry
      autoHeight
      cellCount={images.length}
      cellMeasurerCache={cache}
      cellPositioner={cellPositioner}
      cellRenderer={cellRenderer}
      height={defaultHeight * images.length}
      width={750}
    />
  );
}

export default function AppImageList({
  editMode,
  images,
  loading,
  multiple,
  selectedIds,
  onPreviewImage,
  onSelectImage,
  fetchNext,
  hasNextPage,
  onDelete,
}: ImageListProps) {
  const { displayAlert } = useAlert();
  const [loadedCount, setLoadedCount] = useState(0);
  const isLoading = loadedCount !== images.length || hasNextPage;

  useEffect(() => {
    if (fetchNext && loadedCount >= images.length && hasNextPage) {
      fetchNext();
    }
  }, [fetchNext, hasNextPage, loadedCount, images.length]);

  return (
    <div className="overflow-auto" style={{ height: '70vh' }}>
      <MainMansory
        editMode={editMode}
        images={images}
        totalSize={images.length}
        onLoad={(count) =>
          setLoadedCount((loadCount) => (loadCount > count ? loadCount : count))
        }
        loading={loading}
        multiple={multiple}
        selectedIds={selectedIds}
        onPreviewImage={onPreviewImage}
        onSelectImage={onSelectImage}
        onDelete={(id) => {
          onDelete?.(id);
          setLoadedCount((loadCount) => loadCount - 1);
        }}
      />
      {!images.length ? (
        <div className="flex justify-center items-center">
          <h5 style={{ color: 'var(--info-text-color)' }}>No Images</h5>
        </div>
      ) : null}
      {isLoading || loading ? (
        <div className="w-full h-auto p-3">
          <Loading />
        </div>
      ) : null}
    </div>
  );
}
