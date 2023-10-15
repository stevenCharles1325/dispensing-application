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
import Loading from '../Loading';

interface ImageListProps {
  images: ImageDTO[];
  selectedIds: number[];
  onPreviewImage?: (image: ImageDTO) => void;
  onSelectImage?: (id: number) => void;
  onScroll?: any;
  loading?: boolean;
  multiple?: boolean;
}
/*

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
  return (
    <ImageList sx={{ width: 800, height: 600 }} cols={2} onScroll={onScroll}>
      {images.map((image) => (
        <ImageListItem key={image.id}>
          <img
            src={image.url}
            alt={image.name}
            loading="lazy"
            width={248}
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
        </ImageListItem>
      ))}
      <div className="w-full h-[100px]">{loading && <p>loading...</p>}</div>
    </ImageList>
  );
}
