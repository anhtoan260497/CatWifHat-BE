// this file is use to encrypt and decrypt .env

const cryptoJS = require('crypto-js')
const fs = require('fs')

const password =  fs.readFileSync('password.txt', 'utf8')

const encryptEnv = () => {
    const envFile = fs.readFileSync('./.env', 'utf8')
    const encrypted = cryptoJS.AES.encrypt(envFile.toString(), password).toString();
    fs.writeFileSync('envEncrypted.txt', encrypted)
}

const decryptEnv = () => {
    const envText = fs.readFileSync('envEncrypted.txt', 'utf8')
    const bytes = cryptoJS.AES.decrypt(envText, password)
    const originalText = bytes.toString(cryptoJS.enc.Utf8)
    fs.writeFileSync('.env', originalText, { encoding: 'utf8', flag: 'w+' })
}



module.exports = {
    encryptEnv, decryptEnv
}