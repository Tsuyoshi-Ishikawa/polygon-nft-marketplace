export type MarketItem = {
  tokenId: string;
  seller: string;
  owner: string;
  price: number;
  sold: boolean;
}

export type Nft = {
  price: string,
  tokenId: number,
  tokenURI?: string,
  seller: string,
  owner: string,
  image: string,
  name: string,
  description: string,
}