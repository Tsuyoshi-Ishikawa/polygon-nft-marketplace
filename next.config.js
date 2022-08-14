/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      // 自分が管理するinfuraのipfsのサブドメインを設定する。
      // なぜならipfsに保存されたデータはサブドメインを通してアクセスしないといけないので。
      // https://docs.infura.io/infura/networks/ipfs/how-to/access-ipfs-content/dedicated-gateways
      'polygon-nft-marketplace.infura-ipfs.io'
    ],
  },
}

module.exports = nextConfig
