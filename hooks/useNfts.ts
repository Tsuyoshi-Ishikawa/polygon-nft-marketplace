import { useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ethers } from 'ethers';
import axios from 'axios';

// deployしたときに../configにaddressが書かれる。
// そのaddressを使ってcontractを実行する。
import {
  marketplaceAddress
} from '../config';
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

const SWR_KEY = 'Nfts';

type MarketItem = {
  tokenId: string;
  seller: string;
  owner: string;
  price: number;
  sold: boolean;
}

export type Nfts = {
  price: string,
  tokenId: number,
  seller: string,
  owner: string,
  image: string,
  name: string,
  description: string,
}

const fetchNfts = async (
): Promise<Nfts[]> => {
  /* create a generic provider and query for unsold market items */
  // JsonRpcProviderでethereumと接続を行えるproviderを提供する
  // https://docs.ethers.io/v5/api/providers/jsonrpc-provider/
  const provider = new ethers.providers.JsonRpcProvider()
  const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, provider)
  const data: MarketItem[] = await contract.fetchMarketItems()

  /*
  *  map over items returned from smart contract and format 
  *  them as well as fetch their token metadata
  */
  const items = await Promise.all(data.map(async i => {
    const tokenUri = await contract.tokenURI(i.tokenId)
    const meta = await axios.get(tokenUri) // tokenUriはipfsとかの場合があり、そこにtokenのdescriptionやimageを補zんしている
    let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
    let item = {
      price,
      tokenId: Number(i.tokenId),
      seller: i.seller,
      owner: i.owner,
      image: meta.data.image,
      name: meta.data.name,
      description: meta.data.description,
    }
    return item
  }));
  return items;
};

export const useNfts = () => {
  const { data, error } = useSWR(SWR_KEY, async () => {
    return await fetchNfts();
  });
  return {
    nfts: data,
    isLoading: !error && !data,
    isError: error,
  };
}

export const useRefreshNfts = () => {
  const { mutate } = useSWRConfig();
  return useCallback(() => mutate(SWR_KEY), [mutate]);
};