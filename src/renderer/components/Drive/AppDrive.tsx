/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable consistent-return */
import React, { createRef, useCallback, useEffect, useState } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import ListSubheader from '@mui/material/ListSubheader';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import ImageDTO from 'App/data-transfer-objects/image.dto';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Dialog,
  DialogActions,
  Button,
  Tab,
  Tabs,
  DialogContent,
  useTheme,
} from '@mui/material';

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import useAlert from 'UI/hooks/useAlert';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import driveTabs from 'UI/data/defaults/tabs/driveTabs';
import IPagination from 'App/interfaces/pagination/pagination.interface';

interface AppDriveProps {
  multiple: boolean;
  open: boolean;
  onClose: () => void;
  onSelect: (objects: Array<Record<string, any>>) => void;
}

function a11yProps(index: number) {
  return {
    id: `drive-tab-${index}`,
    'aria-controls': `drive-tabpanel-${index}`,
  };
}

export default function AppDrive({
  multiple = true,
  open,
  onClose,
  onSelect,
}: AppDriveProps) {
  const { displayAlert } = useAlert();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const inputEl = createRef<HTMLInputElement>();

  const [images, setImages] = useState<ImageDTO[]>([]);
  const [previewImage, setPreviewImage] = useState<ImageDTO | null>();
  const [imagesPage, setImagesPage] = useState<number>(0);

  const [currentTab, setCurrentTab] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const selectedImages = images.filter(({ id }) => selectedIds.includes(id));

  const handleSelectImage = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((ids) => ids.filter((imgId) => imgId !== id));
    } else {
      setSelectedIds((ids) => [id, ...ids]);
    }
  };

  const getAllImages = useCallback(async () => {
    const res = await window.image.getImages('all', imagesPage);

    if (res.status === 'ERROR') {
      const errorMessage =
        typeof res.errors?.[0] === 'string'
          ? res.errors?.[0]
          : (res.errors?.[0] as unknown as IPOSError).message;

      console.log('ERROR: ', res.errors);
      return displayAlert?.(errorMessage ?? 'Please try again', 'error');
    }

    const data = res.data as unknown as IPagination<ImageDTO>;
    console.log('IMAGES: ', data[0]);

    setImagesPage(data?.[1].currentPage);
    setImages(data?.[0]);
  }, [displayAlert, imagesPage]);

  const handleSaveImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newImage = event.target.files?.[0];

    if (newImage) {
      const res = await window.image.createImage({
        name: newImage.name,
        url: newImage.path,
        type: newImage.type,
      });

      if (res.status === 'ERROR') {
        const errorMessage =
          typeof res.errors?.[0] === 'string'
            ? res.errors?.[0]
            : (res.errors?.[0] as unknown as IPOSError).message;

        console.log('ERROR: ', res.errors);
        return displayAlert?.(errorMessage ?? 'Please try again', 'error');
      }

      await getAllImages();
      return displayAlert?.('Successfully uploaded image', 'success');
    }
  };

  useEffect(() => {
    getAllImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Dialog
        open={open && Boolean(driveTabs && driveTabs?.length)}
        fullScreen={fullScreen}
        maxWidth="xl"
        onClose={onClose}
      >
        <div className="h-full w-full p-5">
          <Tabs
            value={currentTab}
            onChange={(_, value) => setCurrentTab(value)}
            aria-label="Drive tabs"
          >
            {driveTabs.map((label) => (
              <Tab key={label} label={label} {...a11yProps} />
            ))}
          </Tabs>
          <ImageList sx={{ width: 800, height: 600 }}>
            {images.map((image) => (
              <ImageListItem key={image.id}>
                <img
                  src={image.url}
                  alt={image.name}
                  loading="lazy"
                  width={248}
                  className="cursor-pointer"
                  onClick={() => setPreviewImage(image)}
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
                      onClick={() => handleSelectImage(image.id)}
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
          </ImageList>
        </div>
        <DialogActions>
          <input
            ref={inputEl}
            className="hidden"
            accept="image/*, png, jpeg, jpg"
            type="file"
            onChange={handleSaveImage}
          />
          <Button
            disabled={!selectedImages.length}
            onClick={() => {
              onSelect(selectedImages);
              onClose();
            }}
            color="primary"
          >
            Select
          </Button>
          <Button onClick={() => inputEl.current?.click()} color="primary">
            Upload New Image
          </Button>
          <Button onClick={onClose} color="error">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* PREVIEW IMAGE */}
      <Dialog
        open={Boolean(previewImage)}
        maxWidth="md"
        onClose={() => setPreviewImage(null)}
      >
        {previewImage && (
          <img
            src={previewImage.url}
            alt={previewImage.name}
            loading="lazy"
            style={{
              aspectRatio: 'auto',
            }}
          />
        )}
      </Dialog>
    </>
  );
}
