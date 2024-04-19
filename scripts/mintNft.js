const hre = require('hardhat')
const mintNft = async () => {
    const deployer = await hre.ethers.getSigner()
    const nft = await hre.ethers.getContractAt('CatWifHatNFT', '0x5FbDB2315678afecb367f032d93F642f64180aa3', deployer)
    await nft.mintNFT()
    console.log('minted')
}

mintNft()