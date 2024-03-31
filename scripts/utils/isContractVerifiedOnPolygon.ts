import axios from "axios";

export const isContractVerifiedOnPolygon = async (
  address: string
): Promise<boolean> => {
  const url = `https://api.polygonscan.com/api?module=contract&action=getabi&address=${address}&apikey=${
    process.env.POLYGONSCAN_API_KEY as string
  }`;

  const resp = await axios.get(url);

  return resp.data && resp.data.status && resp.data.status === "1";
};
