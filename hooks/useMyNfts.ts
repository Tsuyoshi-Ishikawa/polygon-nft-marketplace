import { useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ethers } from 'ethers';
import axios from 'axios';
import Web3Modal from 'web3modal';

// deployしたときに../configにaddressが書かれる。
// そのaddressを使ってcontractを実行する。
import {
  marketplaceAddress
} from '../config';
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import { Nft, MarketItem } from '../types/nft'

const SWR_KEY = 'MyNfts';

const fetchMyNfts = async (
  ): Promise<Nft[]> => {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data: MarketItem[] = await contract.fetchMyNFTs()
  
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
        tokenUri
      }
      return item
    }));
    return items;
  };
  
  export const useMyNfts = () => {
    const { data, error } = useSWR(SWR_KEY, async () => {
      return await fetchMyNfts();
    });
    return {
      nfts: data,
      isLoading: !error && !data,
      isError: error,
    };
  }
  
  export const useRefreshMyNfts = () => {
    const { mutate } = useSWRConfig();
    return useCallback(() => mutate(SWR_KEY), [mutate]);
  };