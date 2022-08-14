# Polygon Nft Marketplace
![画面収録 2022-08-14 11 42 31](https://user-images.githubusercontent.com/57980707/184520422-93ef190f-ea43-4de8-b069-fe5a77359ef5.gif)

## The stack
- Web application framework - [Next.js](https://nextjs.org/)
- Solidity development environment - [Hardhat](https://hardhat.org/)
- File Storage - [IPFS](https://ipfs.io/)
- Blockchain infrastructure - [Infura](https://infura.io/)
- Ethereum Web Client Library - [Ethers.js](https://docs.ethers.io/)

## Setup
1. Install the dependencies
```bash
npm install
# or
yarn
```
2. Start the local Hardhat node
```bash
npx hardhat node
```
3. Deploy the contracts to the local network
```bash
npx hardhat run scripts/deploy.js --network localhost
```
This command create config.js for contract accessing from frontend.

4. Create ipfs_project in Infura.
<br>
[INFURA](https://infura.io/)

5. Set environment variable to Next.js
```bash
# matamask private key
NEXT_PUBLIC_PRIVATE_KEY=

# infura_ipfs settings
NEXT_PUBLIC_PROJECT_ID=
NEXT_PUBLIC_PROJECT_SECRET=
NEXT_PUBLIC_INFURA_IPFS_DEDICATED_GATEWAYS_SUBDOMAIN=
``` 

6. Modify next.config.js
Enable to access external image url.
```javascript
  images: {
    domains: [
      // https://docs.infura.io/infura/networks/ipfs/how-to/access-ipfs-content/dedicated-gateways
      '${YOUR_INFURA_IPFS_DEDICATED_GATEWAYS_SUBDOMAIN}.infura-ipfs.io'
    ],
  },
```

7. Start Next.js
```bash
npm run dev
# or
yarn dev
```

## Contract test
```bash
npx hardhat test
```
This command executes script of /test

## Reference
- [How to Build a Full Stack NFT Marketplace on Ethereum with Polygon and Next.js - [2021 Tutorial]](https://www.youtube.com/watch?v=GKJBEEXUha0)
