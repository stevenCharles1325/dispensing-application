import usb from 'usb';

export default interface PrinterDTO extends usb.Device {
  selected: boolean;
}
