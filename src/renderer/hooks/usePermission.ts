import { PermissionsKebabType } from "Main/data/defaults/permissions";
import useErrorHandler from "./useErrorHandler";
import useUser from "UI/stores/user";



const usePermission = () => {
  const { role } = useUser((store) => store);

  const hasPermission = (...permissions: PermissionsKebabType[]): Boolean => {
    try {
      return role?.permissions!.some(({ kebab }) =>
        permissions.includes(kebab as PermissionsKebabType)
      ) ?? false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  return hasPermission;
}

export default usePermission;
