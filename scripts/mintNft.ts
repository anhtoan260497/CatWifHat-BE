import hre  from 'hardhat'
const mintNft = async () => {
    const signers = await hre.ethers.getSigners()
    const deployer = signers[0]
    const nft = await hre.ethers.getContractAt('CatWifHatNFT', '0x5FbDB2315678afecb367f032d93F642f64180aa3', deployer)
    await nft.mintNFT()
    console.log('minted')
}

mintNft()