import { ConfirmContext } from "UI/providers/ConfirmationProvider";
import { useContext } from "react";

export default function useConfirm() {
  const { confirm } = useContext(ConfirmContext);

  return confirm;
}
