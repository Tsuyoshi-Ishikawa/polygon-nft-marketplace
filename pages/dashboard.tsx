import Image from 'next/image'
import { useMySellingNfts } from '../hooks/useMySellingNfts'

// 自分が売っているnftを確認する
export default function CreatorDashboard() {
  const { nfts, isLoading } =
    useMySellingNfts();
  
  if (!isLoading && !nfts?.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>)
  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Listed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts &&
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <Image src={nft.image} alt="nft image" className="rounded" width="350" height="350"/>
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}