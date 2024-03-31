import axios from "axios";

export const isContractVerifiedOnEthereum = async (
  address: string
): Promise<boolean> => {
  const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${
    process.env.ETHERSCAN_API_KEY as string
  }`;

  const resp = await axios.get(url);

  return resp.data && resp.data.status && resp.data.status === "1";
};
