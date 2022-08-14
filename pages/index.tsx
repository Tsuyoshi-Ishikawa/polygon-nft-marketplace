import type { NextPage } from 'next'
import Image from 'next/image'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import { useNfts, useRefreshNfts, Nfts } from '../hooks/useNfts'
// deployしたときに../configにaddressが書かれる。
// そのaddressを使ってcontractを実行する。
import {
  marketplaceAddress
} from '../config';
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

const Home: NextPage = () => {
  const { nfts, isLoading } =
    useNfts();
  const refreshNfts = useRefreshNfts();
  
  async function buyNft(nft: Nfts) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    // Web3Providerでwalletにつないで認証する
    // https://github.com/WalletConnect/web3modal
    // transaction実行に認証が必要なのでJsonRpcProviderではなく、Web3Providerを用いる
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)

    /* user will be prompted to pay the asking process to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')   
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price
    })
    await transaction.wait()
    refreshNfts();
  }

  if (isLoading) return (<div>loading...</div>);

  if (!isLoading && !nfts?.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts &&
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <Image src={nft.image} alt="nft image" width="350" height="350" />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">{nft.price} ETH</p>
                  <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Home
