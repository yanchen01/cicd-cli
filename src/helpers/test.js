/* An example on how to import and use the encryptSecrets script */
const createEncryptedSecrets = require('./encryptSecrets');

const repoOwner = 'yanchen01';
const repoName = 'cicd-cli';
const accessToken = 'YOUR TOKEN';
const secrets = {
	OC_SERVER_URL: 'localhost',
	OC_API_TOKEN: '12345'
};

createEncryptedSecrets(repoOwner, repoName, accessToken, secrets);
