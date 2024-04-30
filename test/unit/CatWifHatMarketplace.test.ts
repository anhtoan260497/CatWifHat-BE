import {expect, assert} from 'chai'
import { Contract, Signer } from 'ethers'
import {parseEther, formatEther} from 'ethers/lib/utils'
import hre from 'hardhat'
import {CatWifHatMarketplace, CatWifHatNFT} from '../../typechain-types'


const PRICE = parseEther('0.1')
const ethers =  hre.ethers

describe('CatWifHatMarketplace', () => {
    let deployer : Signer, buyer : Signer, catWifHatMarketplace : CatWifHatMarketplace, catWifHatNFT : CatWifHatNFT
    beforeEach(async () => {
        const accounts : Signer[] = await ethers.getSigners()
        deployer = accounts[0]
        buyer = accounts[1]
        await hre.deployments.fixture(['all'])
        catWifHatMarketplace = await hre.ethers.getContractAt('CatWifHatMarketplace', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', deployer) as any as CatWifHatMarketplace
        catWifHatNFT = await hre.ethers.getContractAt('CatWifHatNFT', '0x5FbDB2315678afecb367f032d93F642f64180aa3', deployer) as any as CatWifHatNFT
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
            assert.equal(listing.price.toString(), PRICE.toString())
            assert.equal(listing.seller, await deployer.getAddress())
        })
    })

    describe('buyItem function', () => {
        it('revert if not listed', async () => {
            await expect(catWifHatMarketplace.buyItem(catWifHatNFT.address, 0)).to.be.revertedWith('CatWifHatMarketplace__NotListed')
        })

        it('revert if not enough money', async () => {
            await catWifHatNFT.mintNFT()
            await catWifHatNFT.approve(catWifHatMarketplace.address, 0)
            await catWifHatMarketplace.listingItem(catWifHatNFT.address, 0, PRICE)
            await expect(catWifHatMarketplace.buyItem(catWifHatNFT.address, 0, { value: parseEther('0.001') })).to.be.revertedWith('CatWifHatMarketplace__NotEnoughMoney')
        })

        it('buy successfully', async () => {
            await catWifHatNFT.mintNFT()
            await catWifHatNFT.approve(catWifHatMarketplace.address, 0)
            await catWifHatMarketplace.listingItem(catWifHatNFT.address, 0, PRICE)
            await catWifHatMarketplace.connect(buyer).buyItem(catWifHatNFT.address, 0, { value: PRICE })
            const owner = await catWifHatNFT.ownerOf(0)
            assert.equal(await buyer.getAddress(), owner);
            const listing = await catWifHatMarketplace.getListing(catWifHatNFT.address, 0)
            assert.equal(listing.price.toString(), "0")
            const proceed = await catWifHatMarketplace.getProceed(await deployer.getAddress())
            assert.equal(proceed.toString(), PRICE.toString())
        })
    })

    describe('cancelListing function', () => {
        it('revert if not owner', async () => {
            await catWifHatNFT.mintNFT()
            await catWifHatNFT.approve(catWifHatMarketplace.address, 0)
            await catWifHatMarketplace.listingItem(catWifHatNFT.address, 0, PRICE)
            await expect(catWifHatMarketplace.connect(buyer).cancelItem(catWifHatNFT.address, 0)).to.be.revertedWith('CatWifHatMarketplace__NotOwnedThisNFT')
        })

        it('cancel successfully', async () => {
            await catWifHatNFT.mintNFT()
            await catWifHatNFT.approve(catWifHatMarketplace.address, 0)
            await catWifHatMarketplace.listingItem(catWifHatNFT.address, 0, PRICE)
            await catWifHatMarketplace.cancelItem(catWifHatNFT.address, 0)
            const listing = await catWifHatMarketplace.getListing(catWifHatNFT.address, 0)
            assert.equal(listing.price.toString(), "0")
            const owner = await catWifHatNFT.ownerOf(0)
            assert.equal(owner, await deployer.getAddress())
        })
    })

    describe('updatePrice function', () => {
        it('updated successfully', async () => {
            const newPrice = parseEther('0.2')
            await catWifHatNFT.mintNFT()
            await catWifHatNFT.approve(catWifHatMarketplace.address, 0)
            await catWifHatMarketplace.listingItem(catWifHatNFT.address, 0, PRICE)
            await catWifHatMarketplace.updateItem(catWifHatNFT.address, 0, newPrice)
            const listing = await catWifHatMarketplace.getListing(catWifHatNFT.address, 0)
            assert.equal(listing.price.toString(), newPrice.toString())
        })
    })

    describe('widthdraw function', () => {
        it('cant widthdraw if not have proceed', async () => {
            await expect(catWifHatMarketplace.widthdrawProceeds()).to.be.revertedWith('CatWifHatMarketplace__DontHaveAnyProceeds')
        })

        it('widthdraw successfully', async () => {
            await catWifHatNFT.mintNFT()
            await catWifHatNFT.approve(catWifHatMarketplace.address, 0)
            await catWifHatMarketplace.listingItem(catWifHatNFT.address, 0, PRICE)
            await catWifHatMarketplace.connect(buyer).buyItem(catWifHatNFT.address, 0, { value: PRICE })
            let proceed = await catWifHatMarketplace.getProceed(await deployer.getAddress())
            assert.equal(proceed.toString(), PRICE.toString())
            await catWifHatMarketplace.connect(deployer).widthdrawProceeds()
            proceed = await catWifHatMarketplace.getProceed(await deployer.getAddress())
            assert.equal(proceed.toString(), "0")
        })
    })
})