import { useRouter } from 'next/router'
import Image from 'next/image'
import { useMyNfts } from '../hooks/useMyNfts'
import { Nft } from '../types/nft'

export default function MyAssets() {
  const router = useRouter();
  const { nfts, isLoading } =
    useMyNfts();
  
  function listNFT(nft: Nft) {
    console.log('nft:', nft)
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenUri}`)
  }
  
  if (!isLoading && !nfts?.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>)
  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts &&
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <Image src={nft.image} alt="nft image" className="rounded" width="350" height="350"/>
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                  <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => listNFT(nft)}>List</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}