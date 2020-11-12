const { Command, flags } = require('@oclif/command');
const inquirer = require('inquirer');
const chalk = require('chalk');
const createEncryptedSecrets = require('../helpers/encryptSecrets');

class ConfigCommand extends Command {
	static args = [
		{
			name: 'repoOwner',
		},
		{
			name: 'repoName',
		},
		{
			name: 'accessToken',
		},
		{
			name: 'OC_SERVER_URL',
		},
		{
			name: 'OC_API_TOKEN',
		}
	]
	async run() {

		const { args } = this.parse(ConfigCommand);
		const { flags } = this.parse(ConfigCommand);
		let responses;
		let repoOwner = args.repoOwner || flags.repoOwner;
		let repoName = args.repoName || flags.repoName;
		let accessToken = args.accessToken || flags.accessToken;
		let OC_SERVER_URL = args.OC_SERVER_URL || flags.OC_SERVER_URL;
		let OC_API_TOKEN = args.OC_API_TOKEN || flags.OC_API_TOKEN;

		if (!(repoOwner && repoName && accessToken && OC_SERVER_URL && OC_API_TOKEN)) {
			responses = await inquirer.prompt([
				{
					name: 'repoOwner',
					message: 'Enter the username of the repo owner',
					type: 'input'
				},
				{
					name: 'repoName',
					message: 'Enter the name of GitHub repo',
					type: 'input'
				},
				{
					name: 'accessToken',
					message: 'Enter the access token',
					type: 'password'
				},
				{
					name: 'OC_SERVER_URL',
					message: 'Enter the server url',
					type: 'password'
				},
				{
					name: 'OC_API_TOKEN',
					message: 'Enter the api token',
					type: 'password'
				}
			]);
		}
		repoOwner = responses ? responses.repoOwner : repoOwner;
		repoName = responses ? responses.repoName : repoName;
		accessToken = responses ? responses.accessToken : accessToken;
		OC_SERVER_URL = responses ? responses.OC_SERVER_URL : OC_SERVER_URL;
		OC_API_TOKEN = responses ? responses.OC_API_TOKEN : OC_API_TOKEN;
		const secrets = { OC_SERVER_URL: OC_SERVER_URL, OC_API_TOKEN: OC_API_TOKEN };

		try {
			createEncryptedSecrets(repoOwner, repoName, accessToken, secrets);
		} catch (error) {
			this.warning('wrong')
		}
	}
}

ConfigCommand.description = `Configure secrets for the GitHub Actions workflow
Enter your credentials and it will be encrypted
			`;
ConfigCommand.flags = {
	repoOwner: flags.string({ char: 'o', description: 'owner of GitHub repo' }),
	repoName: flags.string({ char: 'n', description: 'name of GitHub repo' }),
	accessToken: flags.string({ char: 'a', description: 'GitHub Access Token with repo access' }),
	OC_SERVER_URL: flags.string({ char: 's', description: 'OpenShift server url' }),
	OC_API_TOKEN: flags.string({ char: 't', description: 'Openshift API token' }),
};

module.exports = ConfigCommand;
