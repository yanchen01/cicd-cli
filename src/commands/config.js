const { Command, flags } = require('@oclif/command');
const inquirer = require('inquirer');
const createEncryptedSecrets = require('./encryptSecrets');


class ConfigCommand extends Command {
	async run() {
		const { flags } = this.parse(ConfigCommand);
		let responses;

		let repoOwner = flags.repoOwner;
		if (!repoOwner) {
			responses = await inquirer.prompt([
				{
					name: 'repoOwner',
					message: 'Enter the name of GitHub repo',
					type: 'input'
				}
			]);
		}
		repoOwner = responses ? responses.repoOwner : repoOwner;
    this.log(`the repo owner is ${repoOwner}`);
    
    // createEncryptedSecrets(repoOwner, repoName, accessToken, secrets);
	}
}

ConfigCommand.description = `Describe the command here
...
Extra documentation goes here
`;

ConfigCommand.flags = {
	repoOwner: flags.string({ char: 'o', description: 'owner of GitHub repo' })
};

module.exports = ConfigCommand;
