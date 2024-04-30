// this script is use to pin data to IPFS on Pinata


import { config } from 'dotenv';
import * as fs from 'fs';
import pinataSDK from '@pinata/sdk';
config();
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SERECT)

const pinFileToIPFS = async () => {
    const readableStreamForFile = fs.createReadStream('./cat-wif-hat.png');
    const options = {
        pinataMetadata: {
            name: 'CatWifHat',
        }
    };
    const res = await pinata.pinFileToIPFS(readableStreamForFile, options)
    const metadata = {
        images : `https://ipfs.io/ipfs/${res.IPFSHash}`
    }
    pinJSONToIPFS(metadata)
}
// images https://ipfs.io/ipfs/QmcZhjggNUxrEvp8Ps3JyZU1UComeRuxAQrAje2AazMc6f
// json https://orange-historic-reptile-492.mypinata.cloud/ipfs/QmZA1dfkaPAV8jUvpEfaLd2SVBJpXX1WVCAD71adVi5Gig

const pinJSONToIPFS = async (metadata : any) => {
    const options = {
        pinataMetadata: {
            name: 'CatWifHat',
        },
    };
    const res = await pinata.pinJSONToIPFS(metadata, options)
    console.log('JSON pinata hash is', res.IpfsHash)
}

pinFileToIPFS()