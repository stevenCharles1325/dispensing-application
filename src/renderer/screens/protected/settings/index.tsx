import {
  Chip,
  Switch,
  Button,
  Divider,
  Dialog,
  useMediaQuery,
  useTheme,
  Slide
} from "@mui/material";
import { useEffect, useState } from "react";
import useAlert from "UI/hooks/useAlert";
import useSearch from "UI/hooks/useSearch";
import useAppDrive from "UI/hooks/useAppDrive";
import ProductDetailsForm from "UI/components/Views/ProductDetailsForm";
import SupplierFormV2 from "UI/components/Views/SupplierFormV2";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";
import RolesAndPermissionsForm from "UI/components/Views/RolesAndPermissionsForm";
import useBarcode from "UI/hooks/useBarcode";
import DeviceDialog from "UI/components/Dialogs/DevicesDialog";

type ModalNames =
  | 'CATEGORIES'
  | 'BRANDS'
  | 'SUPPLIERS'
  | 'BUSINESS DETAILS'
  | 'ROLES AND PERMISSIONS'
  | 'BARCODE'
  | null;

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Settings () {
  const {
    devices,
    isLoading,
    refetch,
    handleSelect,
  } = useBarcode();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { displayAlert } = useAlert();
  const { setPlaceHolder, setDisabled } = useSearch();

  const drive = useAppDrive?.();
  const [openDrive] = drive?.subscribe?.('SETTINGS') ?? [];

  // Settings
  const [notificationStatus, setNotificationStatus] = useState(true);
  const [modal, setModal] = useState<ModalNames> ();
  const isModalOpen = Boolean(modal);

  const handleOpenModal = (modalName: ModalNames) => () => {
    setModal(modalName);
  }

  const handleCloseModal = () => {
    setModal(null);
  }

  const fetchFreshUser = async () => {
    const res = await window.auth.authMe();
    const { data } = res;
    const { notification_status } = data as Record<string, any>;

    setNotificationStatus(notification_status === 'on' ? true : false);
  };

  const handleToggleNotification = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const res = await window.auth.authUpdateMe({
      notification_status: event.target.checked ? 'on' : 'off',
    });

    if (res.status === 'ERROR') {
      const errorMessage = res.errors?.[0] as unknown as string;

      return displayAlert?.(errorMessage, 'error');
    }

    await fetchFreshUser();
  }

  useEffect(() => {
    fetchFreshUser();
  }, []);

  useEffect(() => {
    setPlaceHolder?.('Search is disabled here');
    setDisabled?.(true);
  }, [setPlaceHolder, setDisabled]);

  return (
    <>
      <div className="w-full h-full flex justify-start">
        <div className="min-w-[800px] w-[70%] max-w-[1300px] h-fit p-5">
          <Divider>
            <p className="text-gray-500">System</p>
          </Divider>

          <div className="w-full h-fit my-5 flex flex-wrap gap-5">
            {/* <div className="w-fit h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
              <Chip label="Business Details" variant="outlined" color="secondary" />
              <p className="py-5 px-2 text-gray-400">
                Want to edit your business details?
              </p>
              <div className="w-full flex flex-row-reverse">
                <Button color="secondary" onClick={handleOpenModal('BUSINESS DETAILS')}>Edit</Button>
              </div>
            </div> */}

            {/* NOTIFICATION */}
            <div className="w-fit h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
              <Chip label="Notification" variant="outlined" color="secondary" />
              <p className="py-5 px-2 text-gray-400">
                Turn on/off notifications in your account?
              </p>
              <div className="w-full flex flex-row-reverse">
                <Switch color="secondary" checked={notificationStatus} onChange={handleToggleNotification} />
              </div>
            </div>

            {/* Roles and Permissions */}
            <div className="w-fit h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
              <Chip label="Roles & Permissions" variant="outlined" color="secondary" />
              <p className="py-5 px-2 text-gray-400">
                Edit system's roles and permissions?
              </p>
              <div className="w-full flex flex-row-reverse">
                <Button color="secondary" onClick={handleOpenModal('ROLES AND PERMISSIONS')}>Edit</Button>
              </div>
            </div>

            {/* Barcode select device */}
            <div className="w-fit h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
              <Chip label="Barcode" variant="outlined" color="secondary" />
              <p className="py-5 px-2 text-gray-400">
                Select a device for scanning
              </p>
              <div className="w-full flex flex-row-reverse">
                <Button color="secondary" onClick={handleOpenModal('BARCODE')}>Open</Button>
              </div>
            </div>
          </div>

          <Divider>
            <p className="text-gray-500">Product's</p>
          </Divider>

          <div className="w-full h-fit flex flex-wrap gap-5 my-5">
            {/* Product's */}
            <div className="w-fit h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
              <Chip label="Categories" variant="outlined" color="secondary" />
              <p className="py-5 px-2 text-gray-400">
                Check out the category list
              </p>
              <div className="w-full flex flex-row-reverse">
                <Button color="secondary" onClick={handleOpenModal('CATEGORIES')}>Open</Button>
              </div>
            </div>

            <div className="w-fit h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
              <Chip label="Brands" variant="outlined" color="secondary" />
              <p className="py-5 px-2 text-gray-400">
                Check out the brand list
              </p>
              <div className="w-full flex flex-row-reverse">
                <Button color="secondary" onClick={handleOpenModal('BRANDS')}>Open</Button>
              </div>
            </div>

            <div className="w-fit h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
              <Chip label="Suppliers" variant="outlined" color="secondary" />
              <p className="py-5 px-2 text-gray-400">
                Check out the supplier list
              </p>
              <div className="w-full flex flex-row-reverse">
                <Button color="secondary" onClick={handleOpenModal('SUPPLIERS')}>Open</Button>
              </div>
            </div>

            <div className="w-fit h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
              <Chip label="Images" variant="outlined" color="secondary" />
              <p className="py-5 px-2 text-gray-400">
                Want to see your image list?
              </p>
              <div className="w-full flex flex-row-reverse">
                <Button color="secondary" onClick={() => openDrive?.(true)}>
                  Open
                </Button>
              </div>
            </div>
          </div>

          <Divider />
        </div>
      </div>
      <Dialog
        fullScreen={fullScreen}
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="xl"
        TransitionComponent={Transition}
      >
        <div className="w-fit h-fit">
          {
            modal === 'BRANDS' || modal === 'CATEGORIES'
            ? <ProductDetailsForm type={modal} onClose={handleCloseModal} />
            : null
          }
          {
            modal === 'SUPPLIERS'
            ? <SupplierFormV2 onClose={handleCloseModal} />
            : null
          }
          {
            modal === 'ROLES AND PERMISSIONS'
            ? <RolesAndPermissionsForm onClose={handleCloseModal} />
            : null
          }
        </div>
      </Dialog>
      <DeviceDialog
        open={modal === 'BARCODE'}
        refresh={refetch}
        devices={devices}
        loading={isLoading}
        onChange={handleSelect}
        onClose={handleCloseModal}
      />
    </>
  );
}
