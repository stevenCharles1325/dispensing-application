/* eslint-disable promise/catch-or-return */
/* eslint-disable camelcase */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable consistent-return */
import React, { useCallback, useMemo, useState, useTransition } from 'react';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Dialog,
  DialogActions,
  Button,
  Tab,
  Tabs,
  useTheme,
  ListItemButton,
  ListItemText,
  styled,
  ListItemIcon,
} from '@mui/material';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';

import useAlert from 'UI/hooks/useAlert';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import driveTabs from 'UI/data/defaults/tabs/driveTabs';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import ImageDTO from 'App/data-transfer-objects/image.dto';
import bucketNames from 'src/globals/object-storage/bucket-names';
import { CloudUpload, Folder } from '@mui/icons-material';
import AppImageList from './ImagesList';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import IResponse from 'App/interfaces/pos/pos.response.interface';

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

const getAllImages = async (
  bucket_name: any,
  page: number
): Promise<IPagination<ImageDTO>> => {
  const res = await window.image.getImages(
    { bucket_name: [bucket_name] },
    page
  );

  if (res.status === 'ERROR') {
    const errorMessage =
      typeof res.errors?.[0] === 'string'
        ? res.errors?.[0]
        : (res.errors?.[0] as unknown as IPOSError).message;

    return Promise.reject(errorMessage);
  }

  const data = res.data as unknown as IPagination<ImageDTO>;
  return Promise.resolve(data);
};

export default function AppDrive({
  multiple = true,
  open,
  onClose,
  onSelect,
}: AppDriveProps) {
  const { displayAlert } = useAlert();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [bucketName, setBucketName] = useState<
    (typeof bucketNames)[number] | null
  >(null);
  const [previewImage, setPreviewImage] = useState<ImageDTO | null>();
  const [imagesPage, setImagesPage] = useState<number>(1);

  const [currentTab, setCurrentTab] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data, error, isLoading, isPreviousData, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ['images'],
      queryFn: () => getAllImages(bucketName, imagesPage),
      getNextPageParam: (lastPage, pages) => lastPage?.nextPage,
      getPreviousPageParam: (lastPage, pages) => lastPage?.previousPage,
    });

  if (error) {
    throw error;
  }

  // const images =
  //   data?.pages?.reduce<ImageDTO[]>(
  //     (prev, curr) => [...prev, ...curr.data],
  //     []
  //   ) ?? [];

  console.log(data);
  // const selectedImages = images.filter(({ id }) => selectedIds.includes(id));

  const handleSelectImage = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((ids) => ids.filter((imgId) => imgId !== id));
    } else {
      setSelectedIds((ids) => [id, ...ids]);
    }
  };

  const handleSaveImage = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const newImage = event.target.files?.[0];

      if (newImage && bucketName && displayAlert) {
        const res = await window.image.createImage(bucketName, {
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

        setTimeout(() => {
          setCurrentTab(0);
        }, 500);
        return displayAlert?.('Successfully uploaded image', 'success');
      }
    },
    [bucketName, displayAlert]
  );

  const handleOnClose = () => {
    setImagesPage(1);
    setSelectedIds([]);
    setBucketName(null);
    onClose();

    setTimeout(() => {
      onSelect([]);
    }, 1000);
  };

  // const handleScroll = useCallback(
  //   async ({ clientHeight, scrollHeight, scrollTop }) => {
  //     const bottom = scrollHeight - scrollTop === clientHeight;

  //     const top = scrollTop === 0;

  //     console.log(scrollHeight, clientHeight);
  //     if (bottom && hasNextPage && bucketName) {
  //       setImagesPage((page) => page + 1);
  //     }

  //     if (top && bucketName) {
  //       setImagesPage((page) => (page <= 0 ? page : page - 1));
  //     }
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [imagesPage, bucketName, hasNextPage]
  // );

  return (
    <div>tae</div>
    // <>
    //   <Dialog
    //     open={open && Boolean(driveTabs && driveTabs?.length)}
    //     fullScreen={fullScreen}
    //     maxWidth="xl"
    //     onClose={handleOnClose}
    //   >
    //     <div className="h-full w-full p-5">
    //       <Tabs
    //         value={currentTab}
    //         onChange={(_, value) => {
    //           setCurrentTab(value);
    //         }}
    //         aria-label="Drive tabs"
    //       >
    //         {driveTabs.map((label) => (
    //           <Tab
    //             key={label}
    //             disabled={!bucketName}
    //             label={label}
    //             {...a11yProps}
    //           />
    //         ))}
    //       </Tabs>
    //       {bucketName ? (
    //         <div className="my-3">
    //           <Button
    //             startIcon={<ChevronLeftIcon />}
    //             onClick={() => {
    //               setImagesPage(1);
    //               setBucketName(null);
    //             }}
    //           >
    //             Back
    //           </Button>
    //         </div>
    //       ) : null}
    //       {bucketName ? (
    //         currentTab === 0 ? (
    //           <>
    //             <AppImageList
    //               fetchNext={fetchNextPage}
    //               loading={isLoading}
    //               images={images}
    //               multiple={multiple}
    //               selectedIds={selectedIds}
    //               onSelectImage={handleSelectImage}
    //               onPreviewImage={(image) => setPreviewImage(image)}
    //             />
    //           </>
    //         ) : (
    //           <div className="w-[800px] h-[600px] p-5 flex justify-center items-center">
    //             <Button
    //               component="label"
    //               variant="outlined"
    //               startIcon={<CloudUpload />}
    //             >
    //               Upload file
    //               <VisuallyHiddenInput
    //                 type="file"
    //                 onChange={handleSaveImage}
    //                 accept="image/png, image/gif, image/jpeg"
    //               />
    //             </Button>
    //           </div>
    //         )
    //       ) : (
    //         <div className="w-[800px] h-[600px] p-5">
    //           <p>Please select a folder</p>
    //           <br />
    //           {bucketNames?.map((name) => (
    //             <ListItemButton
    //               key={name}
    //               onClick={async () => {
    //                 setBucketName(() => name);
    //               }}
    //             >
    //               <ListItemIcon>
    //                 <Folder />
    //               </ListItemIcon>
    //               <ListItemText primary={name} />
    //             </ListItemButton>
    //           ))}
    //         </div>
    //       )}
    //     </div>
    //     <DialogActions>
    //       <Button
    //         // disabled={!selectedImages.length}
    //         onClick={() => {
    //           // onSelect(selectedImages);
    //           handleOnClose();
    //         }}
    //         color="primary"
    //       >
    //         Select
    //       </Button>
    //       <Button onClick={handleOnClose} color="error">
    //         Close
    //       </Button>
    //     </DialogActions>
    //   </Dialog>

    //   {/* PREVIEW IMAGE */}
    //   <Dialog
    //     open={Boolean(previewImage)}
    //     maxWidth="md"
    //     onClose={() => setPreviewImage(null)}
    //   >
    //     <div className="absolute top-0 right-0">
    //       <IconButton onClick={() => setPreviewImage(null)}>
    //         <CloseIcon color="primary" />
    //       </IconButton>
    //     </div>
    //     {previewImage && (
    //       <img
    //         src={previewImage.url}
    //         alt={previewImage.name}
    //         loading="lazy"
    //         style={{
    //           aspectRatio: 'auto',
    //         }}
    //       />
    //     )}
    //   </Dialog>
    // </>
  );
}
