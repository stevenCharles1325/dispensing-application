/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable consistent-return */
import React, { useEffect, useState } from 'react';
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
  open: boolean;
  onClose: () => void;
  onSelect: (object: Record<string, any>) => void;
}

function a11yProps(index: number) {
  return {
    id: `drive-tab-${index}`,
    'aria-controls': `drive-tabpanel-${index}`,
  };
}

export default function AppDrive({ open, onClose, onSelect }: AppDriveProps) {
  const { displayAlert } = useAlert();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [images, setImages] = useState<ImageDTO[]>([]);
  const [imagesPage, setImagesPage] = useState<number>(0);

  const [currentTab, setCurrentTab] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSelectImage = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((ids) => ids.filter((imgId) => imgId !== id));
    } else {
      setSelectedIds((ids) => [id, ...ids]);
    }
  };

  const getAllImages = async () => {
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
    setImagesPage(data?.[1].currentPage);
    setImages(data?.[0]);
  };

  useEffect(() => {
    getAllImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log('IMAGES: ', images);

  return (
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
              />
              <ImageListItemBar
                title={image.name}
                subtitle={image.uploader?.first_name ?? 'unknown'}
                actionIcon={
                  <IconButton
                    sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                    aria-label={`info about ${image.name}`}
                    onClick={() => handleSelectImage(image.id)}
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
        <Button onClick={onClose} color="primary">
          Upload New Image
        </Button>
        <Button onClick={onClose} color="error">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
