// this file is use to encrypt and decrypt .env
import cryptoJS from 'crypto-js'
import fs from 'fs'

const password =  fs.readFileSync('password.txt', 'utf8')

export const encryptEnv = () => {
    const envFile = fs.readFileSync('./.env', 'utf8')
    const encrypted = cryptoJS.AES.encrypt(envFile.toString(), password).toString();
    fs.writeFileSync('envEncrypted.txt', encrypted)
}

export const decryptEnv = () => {
    const envText = fs.readFileSync('envEncrypted.txt', 'utf8')
    const bytes = cryptoJS.AES.decrypt(envText, password)
    const originalText = bytes.toString(cryptoJS.enc.Utf8)
    fs.writeFileSync('.env', originalText, { encoding: 'utf8', flag: 'w+' })
}