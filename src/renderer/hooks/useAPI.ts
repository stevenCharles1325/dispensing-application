import axios from "UI/config/axios";

const getMasterKey = async () => {
  try {
    const res = await axios.get('');

    return res.data;
  } catch (err: any) {
    console.log(err?.toJson());

    return null;
  }
}

export default function useAPI () {
  return {
    getMasterKey,
  }
}
