import hre from 'hardhat'
import {developmentChains, networkConfig} from '../hardhat-network-config'
import {verify} from '../utils/verify'
import { DeployFunction } from 'hardhat-deploy/dist/types'
const deployCatWifHatNFT : DeployFunction = async () => {
    const { deployments, getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments
    const chainName = hre.network.name
    const chainId  = hre.network.config.chainId || 31337

    const args = ['https://orange-historic-reptile-492.mypinata.cloud/ipfs/QmZA1dfkaPAV8jUvpEfaLd2SVBJpXX1WVCAD71adVi5Gig']

    const catWifhatNFT = await deploy('CatWifHatNFT', {
        from : deployer,
        args,
        log : true,
        waitConfirmations : developmentChains.includes(chainName) ? 1 : networkConfig[chainId].waitConfirmations
    })

    log('CatWifHatNFT contracts deployed!!!!!!!')
    log('--------------------------------------------------')
    
    if(!developmentChains.includes(chainName)) {
        log('Verifying...')
        await verify(catWifhatNFT.address, args)
        log('Verified!')
        log('--------------------------------------------------')
    }
}

export default deployCatWifHatNFT

deployCatWifHatNFT.tags = ['CatWifHatNFT', 'all']