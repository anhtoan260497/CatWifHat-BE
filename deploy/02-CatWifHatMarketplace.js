const hre = require('hardhat')
const { developmentChains, networkConfig } = require('../hardhat-network-config')
const { verify } = require('../utils/verify')

module.exports = async () => {
    const { deployments, getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments
    const chainName = hre.network.name
    const chainId  = hre.network.config.chainId

    const args = []

    const catWifhatMarketplace = await deploy('CatWifHatMarketplace', {
        from : deployer,
        args,
        log : true,
        waitConfirmations : developmentChains.includes(chainName) ? 1 : networkConfig[chainId].waitConfirmations
    })

    log('CatWifHatMarketplace contracts deployed!!!!!!!')
    log('--------------------------------------------------')
    
    if(!developmentChains.includes(chainName)) {
        log('Verifying...')
        await verify(catWifhatMarketplace.address, args)
        log('Verified!')
        log('--------------------------------------------------')
    }
}

module.exports.tags = ['all','marketplace']