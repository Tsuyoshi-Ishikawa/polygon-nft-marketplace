import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import Image from 'next/image'

// ipfsHttpClientを使用して、ipfsに画像を配置しに行く
// これはcreateと同義(create as ipfsHttpClient)
// https://www.npmjs.com/package/ipfs-http-client#createoptions

// infuraが管理するipfsに対してAPI実行をしたい場合は
// 基本ipfs.infura.io: 5001 / api / v0に対して実行する。
// https://docs.infura.io/infura/networks/ipfs/http-api-methods

// またinfuraが管理するipfsに対してAPI実行をしたい場合は、
// project_idとproject_secretがauthorizationヘッダにセットする必要あり
// https://docs.infura.io/infura/networks/ipfs/how-to/make-requests
// https://community.infura.io/t/add-file-to-ipfs-node-js/5148/3

const auth =
    'Basic ' + Buffer.from(process.env.NEXT_PUBLIC_PROJECT_ID + ':' + process.env.NEXT_PUBLIC_PROJECT_SECRET).toString('base64');
const client = ipfsHttpClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
      authorization: auth,
  },
});

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState('');
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  // NFTで使用する写真データだけをipfsに配置
  async function uploadImageToIPFS(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files ? e.target.files[0] : null;
    try {
      // client.addしたときにはpfs-http-clientのfileを扱うためのcoreAPIであるaddが使用される。
      // https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options
      if (!file) throw new Error('file is not set.');

      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )

      // 自分ipfsの専用のurlを発行するために、subdomainを発行する必要がある
      // それを設定してあげれば画像やメタデータが確認できる。
      // https://blog.infura.io/post/ipfs-public-api-and-gateway-deprecation
      // https://docs.infura.io/infura/networks/ipfs/how-to/access-ipfs-content/dedicated-gateways
      const url = `https://${process.env.NEXT_PUBLIC_INFURA_IPFS_DEDICATED_GATEWAYS_SUBDOMAIN}.infura-ipfs.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  // NFTで使用するmetaデータだけをipfsに配置。imageにipfsで管理している写真のurlをセット
  async function uploadMetaToIPFS() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://${process.env.NEXT_PUBLIC_INFURA_IPFS_DEDICATED_GATEWAYS_SUBDOMAIN}.infura-ipfs.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function listNFTForSale() {
    const url = await uploadMetaToIPFS()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* next, create the item */
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()

    // tokenUrlとしてipfsで管理しているmetadataのurlをセットする
    let transaction = await contract.createToken(url, price, { value: listingPrice })

    // transaction実行によって、下記が発生
    // 1. createTokenを実行するのに必要なgas代
    // 2. createTokenで要求されているgas代(listingPrice)
    // https://youtu.be/GKJBEEXUha0?t=7025
    await transaction.wait()
   
    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input 
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={(e) => uploadImageToIPFS(e)}
        />
        {
          fileUrl && (
            <Image className="rounded mt-4" alt="fileUrl" width="350" height="350" src={fileUrl}/>
          )
        }
        <button onClick={listNFTForSale} className="font-bold mt-4 bg-green-500 text-white rounded p-4 shadow-lg">
          Create NFT
        </button>
      </div>
    </div>
  )
}