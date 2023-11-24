import UserDTO from "App/data-transfer-objects/user.dto";
import useUser from "UI/stores/user";

const useFreshUser = () => {
  const { setUser } = useUser((store) => store);

  const getFreshUser = async () => {
    const res = await window.auth.authMe();
    const data = res.data as unknown as Partial<UserDTO>;

    setUser(data);
  };

  return getFreshUser;
}

export default useFreshUser;
