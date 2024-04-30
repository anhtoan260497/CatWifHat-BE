import dotenv from 'dotenv'
dotenv.config()

export const networkConfig = {
    31337: {
        name: "localhost",
    },
    11155111: {
        name: "eth-sepolia",
        blockConfirmations: 6,
        verifyApiKey : process.env.ETHERSCAN_API_KEY,
    },

    1: {
        name: "eth-mainnet",
        blockConfirmations: 6,
        verifyApiKey : process.env.ETHERSCAN_API_KEY,
    },
    97: {
        name: "binance-testnet",
        blockConfirmations: 6,
        verifyApiKey : process.env.BSCSCAN_API_KEY,
    },
    56: {
        name: "binance-mainnet",
        blockConfirmations: 6,
        verifyApiKey : process.env.BSCSCAN_API_KEY,
    }
}


export const developmentChains = ['localhost', 'hardhat']
