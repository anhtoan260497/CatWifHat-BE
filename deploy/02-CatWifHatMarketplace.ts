import { DeployFunction } from 'hardhat-deploy/dist/types'
import hre from 'hardhat'
import {developmentChains, networkConfig} from '../hardhat-network-config'
import { verify } from '../utils/verify'

const deployCatWifHatMarketplace : DeployFunction = async () => {
    const { deployments, getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments
    const chainName = hre.network.name
    const chainId  = hre.network.config.chainId || 31337

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

export default deployCatWifHatMarketplace

deployCatWifHatMarketplace.tags = ['all','marketplace']