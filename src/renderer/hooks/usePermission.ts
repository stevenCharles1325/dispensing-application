import { PermissionsKebabType } from "Main/data/defaults/permissions";
import useUser from "UI/stores/user";
import { useCallback } from "react";

const usePermission = () => {
  const { role } = useUser((store) => store);
  const hasPermission = useCallback((...permissions: PermissionsKebabType[]): Boolean => {
    try {
      return role?.permissions!.some(({ kebab }) =>
        permissions.includes(kebab as PermissionsKebabType)
      ) ?? false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }, [role]);

  return hasPermission;
}

export default usePermission;
