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
import ShortcutKeysForm from "UI/components/Views/ShortcutKeysForm";
import usePermission from "UI/hooks/usePermission";

type ModalNames =
  | 'BUSINESS DETAILS'
  | 'ROLES AND PERMISSIONS'
  | 'SHORTCUT-KEYS'
  | 'CATEGORIES'
  | 'BRANDS'
  | 'SUPPLIERS'
  | 'DISCOUNTS'
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
    refetchDevices,
    select,
  } = useBarcode();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { displayAlert } = useAlert();
  const { setPlaceHolder, setDisabled } = useSearch();
  const hasPermission = usePermission();

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
        <div className="min-w-[800px] w-[75%] max-w-[1300px] h-fit p-5">
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
            <div className="w-[350px] h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
              <Chip label="Notification" variant="outlined" color="secondary" />
              <p className="py-5 px-2 text-gray-400">
                Turn on/off notifications in your account?
              </p>
              <div className="w-full flex flex-row-reverse">
                <Switch color="secondary" checked={notificationStatus} onChange={handleToggleNotification} />
              </div>
            </div>

            {/* Roles and Permissions */}
            {
              hasPermission('view-role') && hasPermission('view-permission')
              ? (
                <div className="w-[350px] h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
                  <Chip label="Roles & Permissions" variant="outlined" color="secondary" />
                  <p className="py-5 px-2 text-gray-400">
                    Edit system's roles and permissions?
                  </p>
                  <div className="w-full flex flex-row-reverse">
                    <Button color="secondary" onClick={handleOpenModal('ROLES AND PERMISSIONS')}>Edit</Button>
                  </div>
                </div>
              )
              : null
            }

            {/* Barcode select device */}
            <div className="w-[350px] h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
              <Chip label="Barcode" variant="outlined" color="secondary" />
              <p className="py-5 px-2 text-gray-400">
                Select a device for scanning
              </p>
              <div className="w-full flex flex-row-reverse">
                <Button color="secondary" onClick={handleOpenModal('BARCODE')}>Open</Button>
              </div>
            </div>

            {/* Shortcut keys */}
            <div className="w-[350px] h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
              <Chip label="Shortcut-keys" variant="outlined" color="secondary" />
              <p className="py-5 px-2 text-gray-400">
                Update your own custom shortcut-keys
              </p>
              <div className="w-full flex flex-row-reverse">
                <Button color="secondary" onClick={handleOpenModal('SHORTCUT-KEYS')}>Open</Button>
              </div>
            </div>
          </div>

          <Divider>
            <p className="text-gray-500">Product's</p>
          </Divider>

          <div className="w-full h-fit flex flex-wrap gap-5 my-5">
            {/* Product's */}
            {
              hasPermission('view-category')
              ? (
                <div className="w-[350px] h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
                  <Chip label="Categories" variant="outlined" color="secondary" />
                  <p className="py-5 px-2 text-gray-400">
                    Check out the category list
                  </p>
                  <div className="w-full flex flex-row-reverse">
                    <Button color="secondary" onClick={handleOpenModal('CATEGORIES')}>Open</Button>
                  </div>
                </div>
              )
              : null
            }

            {
              hasPermission('view-brand')
              ? (
                <div className="w-[350px] h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
                  <Chip label="Brands" variant="outlined" color="secondary" />
                  <p className="py-5 px-2 text-gray-400">
                    Check out the brand list
                  </p>
                  <div className="w-full flex flex-row-reverse">
                    <Button color="secondary" onClick={handleOpenModal('BRANDS')}>Open</Button>
                  </div>
                </div>
              )
              : null
            }

            {
              hasPermission('view-supplier')
              ? (
                <div className="w-[350px] h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
                  <Chip label="Suppliers" variant="outlined" color="secondary" />
                  <p className="py-5 px-2 text-gray-400">
                    Check out the supplier list
                  </p>
                  <div className="w-full flex flex-row-reverse">
                    <Button color="secondary" onClick={handleOpenModal('SUPPLIERS')}>Open</Button>
                  </div>
                </div>
              )
              : null
            }

            {
              hasPermission('view-image')
              ? (
                <div className="w-[350px] h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
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
              )
              : null
            }

            {/* {
              hasPermission('view-discount')
              ? (
                <div className="w-[350px] h-fit rounded border shadow p-5 hover:shadow-lg hover:border-fuchsia-500">
                  <Chip label="Discounts" variant="outlined" color="secondary" />
                  <p className="py-5 px-2 text-gray-400">
                    Want to add new discounts?
                  </p>
                  <div className="w-full flex flex-row-reverse">
                    <Button color="secondary" onClick={handleOpenModal('DISCOUNTS')}>
                      Open
                    </Button>
                  </div>
                </div>
              )
              : null
            } */}
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
          {/* {
            modal === 'DISCOUNTS'
            ? <DiscountForm onClose={handleCloseModal} />
            : null
          } */}
          {
            modal === 'ROLES AND PERMISSIONS'
            ? <RolesAndPermissionsForm onClose={handleCloseModal} />
            : null
          }
          {
            modal === 'SHORTCUT-KEYS'
            ? <ShortcutKeysForm onClose={handleCloseModal} />
            : null
          }
        </div>
      </Dialog>
      <DeviceDialog
        loading={false}
        open={modal === 'BARCODE'}
        refresh={refetchDevices}
        devices={devices}
        onChange={select}
        onClose={handleCloseModal}
      />
    </>
  );
}
