/* test/sample-test.js */
describe("NFTMarket", function() {
  it("Should create and execute market sales", async function() {
    /* deploy the marketplace */

    // NFTMarketplaceは/contractsで作ったcontract名
    // https://hardhat.org/hardhat-runner/docs/other-guides/waffle-testing#testing
    // ここのethersはether.jsのethersではなく、hardhatが定期要しているethers
    // https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-ethers#helpers
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace")
    const nftMarketplace = await NFTMarketplace.deploy()
    await nftMarketplace.deployed()

    let listingPrice = await nftMarketplace.getListingPrice()
    listingPrice = listingPrice.toString()

    const auctionPrice = ethers.utils.parseUnits('1', 'ether')

    /* create two tokens */
    await nftMarketplace.createToken("https://www.mytokenlocation.com", auctionPrice, { value: listingPrice })
    await nftMarketplace.createToken("https://www.mytokenlocation2.com", auctionPrice, { value: listingPrice })
    
    // hardhatではテスト用にsignする洋のアカウント(_)と、
    // そうではないアカウント(buyerAddress)が用意されている
    // https://hardhat.org/hardhat-runner/docs/other-guides/waffle-testing#testing-from-a-different-account
    const [_, buyerAddress] = await ethers.getSigners()
  
    /* execute sale of token to another user */
    // connectを使うことで引数で指定したアカウントとしてスマコンを実行できる
    // https://hardhat.org/hardhat-runner/docs/other-guides/waffle-testing#testing-from-a-different-account
    await nftMarketplace.connect(buyerAddress).createMarketSale(1, { value: auctionPrice })

    /* resell a token */
    await nftMarketplace.connect(buyerAddress).resellToken(1, auctionPrice, { value: listingPrice })

    /* query for and return the unsold items */
    items = await nftMarketplace.fetchMarketItems()
    // Promise.allでは引数で渡されたArrayに入っているpromiseをすべて処理して上げる
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nftMarketplace.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)
  })
})
