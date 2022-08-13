// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 listingPrice = 0.025 ether;
    address payable owner;

    mapping(uint256 => MarketItem) private idToMarketItem;

    struct MarketItem {
      uint256 tokenId;
      address payable seller;
      address payable owner;
      uint256 price;
      bool sold;
    }

    event MarketItemCreated (
      uint256 indexed tokenId,
      address seller,
      address owner,
      uint256 price,
      bool sold
    );

    constructor() ERC721("Metaverse Tokens", "METT") {
      owner = payable(msg.sender);
    }

    // listingPriceをupdateする
    function updateListingPrice(uint _listingPrice) public payable {
      require(owner == msg.sender, "Only marketplace owner can update listing price.");
      listingPrice = _listingPrice;
    }

    // listingPriceを取得、listingPrice分の通貨が必要なfunction実行の前に呼ばれる
    function getListingPrice() public view returns (uint256) {
      return listingPrice;
    }

    // トークンを作るためのfunction
    function createToken(string memory tokenURI, uint256 price) public payable returns (uint) {
      _tokenIds.increment();
      uint256 newTokenId = _tokenIds.current();

      // senderが権限を持つようなTokenを作る
      // https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721-_mint-address-uint256-
      _mint(msg.sender, newTokenId);

      // newTokenIdをキーにtokenURIを値としてセットする。
      // tokenURIにはinfuraのipfsで管理しているnftのmatadataのurlをセット
      // 詳細は/pages/create-nftを確認
      _setTokenURI(newTokenId, tokenURI);
      createMarketItem(newTokenId, price);
      return newTokenId;
    }

    // マーケットでトークンがあつかるようにitemを作る。
    // トークンの権限はconstaractのownerに移譲
    function createMarketItem(
      uint256 tokenId,
      uint256 price
    ) private {
      require(price > 0, "Price must be at least 1 wei");
      require(msg.value == listingPrice, "Price must be equal to listing price");

      idToMarketItem[tokenId] =  MarketItem(
        tokenId,
        payable(msg.sender),
        payable(address(this)),
        price,
        false
      );

      // これでnftのownershipをconstractのownerに渡せる
      // https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721-_transfer-address-address-uint256-
      _transfer(msg.sender, address(this), tokenId);

      // frontendのeventが発火するようにする
      emit MarketItemCreated(
        tokenId,
        msg.sender,
        address(this), //ここにはownerが入る
        price,
        false
      );
    }

    // 持っているNFTを再度売りに出す
    function resellToken(uint256 tokenId, uint256 price) public payable {
      require(idToMarketItem[tokenId].owner == msg.sender, "Only item owner can perform this operation");
      require(msg.value == listingPrice, "Price must be equal to listing price");
      idToMarketItem[tokenId].sold = false;
      idToMarketItem[tokenId].price = price;
      idToMarketItem[tokenId].seller = payable(msg.sender);
      idToMarketItem[tokenId].owner = payable(address(this));
      _itemsSold.decrement();
      
      // nftを作ったとき同様に権限をcontractのownerにわたす
      _transfer(msg.sender, address(this), tokenId);
    }

    // NFTの売買を行う、その取引のための通貨が必要なのでpayableになっている
    // NFTのownershipもtransferさせる
    function createMarketSale(
      uint256 tokenId
      ) public payable {
      uint price = idToMarketItem[tokenId].price;
      address seller = idToMarketItem[tokenId].seller;
      require(msg.value == price, "Please submit the asking price in order to complete the purchase");
      idToMarketItem[tokenId].owner = payable(msg.sender);
      idToMarketItem[tokenId].sold = true;
      idToMarketItem[tokenId].seller = payable(address(0)); // 空のアドレスを入れる
      _itemsSold.increment();

      // address(this)からmsg.senderにトークンの権限を渡す(ERC721のfunction)
      // address(this)はスマコンのオーナー
      _transfer(address(this), msg.sender, tokenId);

      // 仮想通貨の送金をする。
      // payable(アドレス).transfer(額)でアドレスに、額の通貨を送る
      // https://solidity-by-example.org/sending-ether/
      payable(owner).transfer(listingPrice); // ownerにlistingPrice分送金する。売買がされれば手数料を運営側がもらう
      payable(seller).transfer(msg.value); // sellerにmsg.value分送金する
    }

    // すべての売れ残っているNFTを取得
    function fetchMarketItems() public view returns (MarketItem[] memory) {
      uint itemCount = _tokenIds.current();
      uint unsoldItemCount = _tokenIds.current() - _itemsSold.current();
      uint currentIndex = 0;

      MarketItem[] memory items = new MarketItem[](unsoldItemCount);
      for (uint i = 0; i < itemCount; i++) {
        if (idToMarketItem[i + 1].owner == address(this)) {
          uint currentId = i + 1;
          MarketItem storage currentItem = idToMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    // 自分が持っているNFTを取得
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
      uint totalItemCount = _tokenIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].owner == msg.sender) {
          itemCount += 1;
        }
      }

      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].owner == msg.sender) {
          uint currentId = i + 1;
          MarketItem storage currentItem = idToMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    // 自分が現在売っているnftを得る
    function fetchItemsListed() public view returns (MarketItem[] memory) {
      uint totalItemCount = _tokenIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].seller == msg.sender) {
          itemCount += 1;
        }
      }

      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].seller == msg.sender) {
          uint currentId = i + 1;
          MarketItem storage currentItem = idToMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }
}