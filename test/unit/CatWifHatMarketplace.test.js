const { expect, assert } = require("chai")
const { parseEther, formatEther } = require("ethers/lib/utils")

const PRICE = parseEther('0.1')

describe('CatWifHatMarketplace', () => {
    let deployer, buyer, catWifHatMarketplace
    beforeEach(async () => {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        buyer = accounts[1]
        await hre.deployments.fixture(['all'])
        catWifHatMarketplace = await hre.ethers.getContractAt('CatWifHatMarketplace', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', deployer)
        catWifHatNFT = await hre.ethers.getContractAt('CatWifHatNFT', '0x5FbDB2315678afecb367f032d93F642f64180aa3', deployer)
    })

    describe('listingItem function', () => {
        it('revert if price is zero', async () => {
            await catWifHatNFT.mintNFT()
            await expect(catWifHatMarketplace.listingItem(catWifHatNFT.address, 0, 0)).to.be.revertedWith('CatWifHatMarketplace__PriceMustBeAboveZero')
        })

        it('revert if sender not owned NFT', async () => {
            await catWifHatNFT.mintNFT()
            await expect(catWifHatMarketplace.connect(buyer).listingItem(catWifHatNFT.address, 0, PRICE)).to.be.revertedWith('CatWifHatMarketplace__NotOwnedThisNFT')
        })

        it('revert if not approved', async () => {
            await catWifHatNFT.mintNFT()
            await expect(catWifHatMarketplace.listingItem(catWifHatNFT.address, 0, PRICE)).to.be.revertedWith('CatWifHatMarketplace__NotApproved')
        })

        it('listing successfully', async () => {
            await catWifHatNFT.mintNFT()
            await catWifHatNFT.approve(catWifHatMarketplace.address, 0)
            await catWifHatMarketplace.listingItem(catWifHatNFT.address, 0, PRICE)
            const listing = await catWifHatMarketplace.getListing(catWifHatNFT.address, 0)
            assert.equal(listing.price.toString(), PRICE)
            assert.equal(listing.seller, await deployer.getAddress())
        })
    })
})