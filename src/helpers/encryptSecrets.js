/* Import required modules */
const sodium = require('tweetsodium');
const axios = require('axios');
const chalk = require('chalk');

/* Encryption function to encrypt a secret */
function encrypt(publicKey, secretValue) {
	// Convert the message and key to Uint8Array's (Buffer implements that interface)
	const messageBytes = Buffer.from(secretValue);
	const keyBytes = Buffer.from(publicKey, 'base64');

	// Encrypt using LibSodium.
	const encryptedBytes = sodium.seal(messageBytes, keyBytes);

	// Base64 the encrypted secret
	const encrypted = Buffer.from(encryptedBytes).toString('base64');

	return encrypted;
}

/* Get GH public key ID and key */
function configureSecrets(accessToken, repoOwner, repoName) {
	const headers = { Authorization: 'token ' + accessToken };
	const URL = `https://api.github.com/repos/${repoOwner}/${repoName}/actions/secrets/public-key`;
	// get request to retreive public key ID and key
	const keyObj = axios
		.get(URL, { headers })
		.then((result) => {
			return result.data;
		})
		.catch((err) => {
			console.error(chalk.red('ERROR config'));
		});

	return keyObj;
}

/* Generate encrypted secrets */
function generateEncryptedSecrets(publicKey, secrets) {
	const encryptedSecrets = {};

	// loop through secrets and encrypt each secret
	for (secret in secrets) {
		encryptedSecrets[secret] = encrypt(publicKey, secret);
	}

	return encryptedSecrets;
}

/* Create or update secrets to Github repo */
function createUpdateSecrets(accessToken, publicKeyID, repoOwner, repoName, secrets) {
	// iterate through each secret
	for (secret in secrets) {
		const headers = {
			Authorization: 'token ' + accessToken,
			'Content-Type': 'application/json'
		};
		const URL = `https://api.github.com/repos/${repoOwner}/${repoName}/actions/secrets/${secret}`;
		const secretObj = {
			key_id: publicKeyID,
			encrypted_value: secrets[secret]
		};
		axios
			.put(URL, secretObj, { headers })
			.then((result) => {
				console.log(chalk.bold.black.bgGreen('Created/Updated Secrets!'));
			})
			.catch((err) => {
				console.error(chalk.red('ERROR Update'));
			});
	}
}

/* Function to configure, encrypt, and create/update secrets to Github repo*/
function createEncryptedSecrets(repoOwner, repoName, accessToken, secrets) {
	const keyObj = configureSecrets(accessToken, repoOwner, repoName);
	keyObj
		.then((result) => {
			const publicKeyID = result.key_id;
			const publicKey = result.key;

			const encryptedSecrets = generateEncryptedSecrets(publicKey, secrets);
			createUpdateSecrets(accessToken, publicKeyID, repoOwner, repoName, encryptedSecrets);
		})
		.catch((err) => {
			console.error(chalk.red('ERROR create'));
		});
}

module.exports = createEncryptedSecrets;
