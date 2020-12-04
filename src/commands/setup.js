const fs = require('fs');
const yaml = require('js-yaml');
const chalk = require('chalk');
const inquirer = require('inquirer');

const { Command, flags } = require('@oclif/command');

const generateYAMLWorkflows = function(CIContent, CDContent) {
	// convert js obj to yaml string
	let CIYamlStr = yaml.safeDump(CIContent);
	let CDYamlStr = yaml.safeDump(CDContent);

	// create directory for workflow yaml files
	fs.mkdir('./.github/workflows', { recursive: true }, function(err) {
		if (err) {
			console.error(chalk.red('ERROR creating directories'));
		} else {
			console.log(chalk.blue('GitHub Action workflow directory created.'));
			// write to yaml file
			fs.writeFile('./.github/workflows/ci.yaml', CIYamlStr, 'utf8', function(err) {
				if (err) {
					console.error(chalk.red('ERROR generating CI YAML file'));
				} else {
					console.log(chalk.green('CI workflow file created.'));
				}
			});
			fs.writeFile('./.github/workflows/cd.yaml', CDYamlStr, 'utf8', function(err) {
				if (err) {
					console.error(chalk.red('ERROR generating CD YAML file'));
				} else {
					console.log(chalk.green('CD workflow file created.'));
				}
			});
		}
	});
};
class SetupCommand extends Command {
	async run() {
		// Yaml content in object
		let CIContent = {
			name: 'Continuous Integration Pipeline',
			on: 'pull_request',
			jobs: {
				formatting: {
					name: 'Autoyapf PEP-8 Formatting',
					'runs-on': 'ubuntu-latest',
					steps: [
						{
							uses: 'actions/checkout@v2',
							with: {
								ref: '${{ github.head_ref }}'
							}
						},
						{
							name: 'Importing formatting',
							uses: 'mritunjaysharma394/autoyapf@v2',
							with: {
								args: '--style pep8 --recursive --in-place .'
							}
						},
						{
							name: 'Checking for modified files',
							run:
								'echo ::set-output name=modified::$(if git diff-index --quiet HEAD --; then echo "false"; else echo "true"; fi)'
						},
						{
							name: 'Pushing changes',
							if: "steps.git-check.outputs.modified == 'true'",
							run:
								'git config --global user.name github-actions\ngit config --global user.email \'${GITHUB_ACTOR}@users.noreply.github.com\'  \ngit remote set-url origin https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}\ngit commit -am "Automated autoyapf fixes"\ngit push\n'
						}
					]
				},
				pyTest: {
					needs: 'formatting',
					name: 'Unit Test - PyTest',
					'runs-on': 'ubuntu-latest',
					steps: [
						{
							uses: 'actions/checkout@v2'
						},
						{
							name: 'Setting up Python 3.6',
							uses: 'actions/setup-python@v2',
							with: {
								'python-version': 3.6
							}
						},
						{
							name: 'Installing Python dependencies from requirements.txt',
							uses: 'py-actions/py-dependency-install@v2',
							with: {
								path: './requirements.txt'
							}
						},
						{
							name: 'Testing with PyTest',
							run:
								'python3 -m pytest -rsA tests/ -vv --cov-fail-under=90 -W ignore::DeprecationWarning\n'
						}
					]
				},
				deployForIT: {
					needs: 'pyTest',
					name: 'Deploying Branch to OpenShift for Testing',
					'runs-on': 'ubuntu-latest',
					steps: [
						{
							uses: 'actions/checkout@v2'
						},
						{
							name: 'Install OpenShift Actions',
							uses: 'redhat-actions/oc-installer@v1',
							with: {
								version: '3.11.230'
							}
						},
						{
							name: 'Executing OC Commands',
							run: "#!/bin/bash\nbranchName=`(echo ${{ github.head_ref }} | tr '[:upper:]' '[:lower:]') | sed -e 's/[^a-z0-9]//g'`\noc login --token=${{ secrets.OC_API_TOKEN }} --server=${{ secrets.OC_SERVER_URL }}\noc start-build $branchName --follow || oc new-app https://www.github.com/${{ github.repository }}#${{ github.head_ref }} --name=$branchName\n"
						}
					]
				},
				cleaningOC: {
					needs: 'deployForIT',
					name: 'Cleaning OpenShift Env',
					'runs-on': 'ubuntu-latest',
					steps: [
						{
							uses: 'actions/checkout@v2'
						},
						{
							name: 'Install OpenShift Actions',
							uses: 'redhat-actions/oc-installer@v1',
							with: {
								version: '3.11.230'
							}
						},
						{
							name: 'Executing OC Commands',
							run: "#!/bin/bash\nbranchName=`(echo ${{ github.head_ref }} | tr '[:upper:]' '[:lower:]') | sed -e 's/[^a-z0-9]//g'`\noc login --token=${{ secrets.OC_API_TOKEN }} --server=${{ secrets.OC_SERVER_URL }}\noc delete all --selector app=$branchName\n"
						}
					]
				}
			}
		};
		let CDContent = {
			name: 'Continuous Delivery Pipeline',
			on: {
				push: {
					branches: [ 'master' ]
				}
			},
			jobs: {
				deployingProd: {
					name: 'Deployment to Production',
					'runs-on': 'ubuntu-latest',
					steps: [
						{
							uses: 'actions/checkout@v2'
						},
						{
							name: 'Install OpenShift Actions',
							uses: 'redhat-actions/oc-installer@v1',
							with: {
								version: '3.11.230'
							}
						},
						{
							name: 'Executing OC Commands',
							run: "#!/bin/bash\nrepoName=`(echo ${{ github.event.repository.name }} | tr '[:upper:]' '[:lower:]') | sed -e 's/[^a-z0-9]//g'`\noc login --token=${{ secrets.OC_API_TOKEN }} --server=${{ secrets.OC_SERVER_URL }}\noc start-build $repoName --follow || oc new-app https://www.github.com/${{ github.repository }} --name=$repoName\n"
						}
					]
				}
			}
		};

		// select user's choice of formatter
		inquirer
			.prompt([
				{
					type: 'list',
					name: 'formatter',
					message: 'Which of the following auto formatter would you like to use?',
					choices: [ 'yapf', 'black' ]
				}
			])
			.then((responses) => {
				if (responses.formatter === 'black') {
					// black formatter job, default was yapf
					CIContent.jobs.formatting = {
						name: 'Black Formatting',
						'runs-on': 'ubuntu-latest',
						steps: [
							{
								uses: 'actions/checkout@v2'
							},
							{
								uses: 'lgeiger/black-action@master',
								with: {
									args: '.'
								}
							}
						]
					};
				}
				generateYAMLWorkflows(CIContent, CDContent);
			})
			.catch((err) => {
				console.error(chalk.red(err));
			});
	}
}

SetupCommand.description = `Setup the CI/CD pipeline
...
This command generates the GitHub Action workflow yaml files to setup the CI/CD pipeline
`;

module.exports = SetupCommand;
