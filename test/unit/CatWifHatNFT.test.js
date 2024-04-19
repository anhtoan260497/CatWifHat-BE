const { ethers } = require("hardhat")
const hre = require('hardhat')
const { developmentChains } = require("../../hardhat-network-config")
const { assert, expect } = require("chai")
const chainName = hre.network.name
if (!developmentChains.includes(chainName)) describe.skip()

describe('CatWifHatNFT', () => {
    let deployer, catWifHatNFT
    beforeEach(async () => {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        await hre.deployments.fixture(['all'])
        catWifHatNFT = await hre.ethers.getContractAt('CatWifHatNFT', '0x5FbDB2315678afecb367f032d93F642f64180aa3', deployer)
    })

    describe('constructor', () => {
        it('tokenID start from zero', async () => {
            const tokenId = await catWifHatNFT.s_tokenId()
            assert.equal(tokenId.toNumber(), 0)
        })
    })

    describe('mintNFT', () => {
        // it('will failed if maximum exceeds', async () => {
        //     for(let i = 0 ; i < 100 ; i ++) {
        //         await catWifHatNFT.mintNFT()
        //     }
        //     expect(await catWifHatNFT.mintNFT()).to.be.revertedWith('CatWifHatNFT__MaximumNftExceed') // this pass
        // })

        it('will mint successfully', async () => {
            await catWifHatNFT.mintNFT()
            const owner = await catWifHatNFT.ownerOf(0)
            assert.equal(owner, await deployer.getAddress())
        })

        it('will failed if 1 address mint more than 1 NFT', async () => {
            await catWifHatNFT.mintNFT()
            await expect(catWifHatNFT.mintNFT()).to.be.revertedWith('CatWifHatNFT__MinterAlreadyHasAToken')
        })

        it('will update tokenId', async () => {
            await catWifHatNFT.mintNFT()
            const tokenId = await catWifHatNFT.s_tokenId()
            assert.equal(tokenId.toNumber(), 1)
        })
    })
})