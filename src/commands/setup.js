const fs = require('fs');
const yaml = require('js-yaml');

const { Command, flags } = require('@oclif/command');

class SetupCommand extends Command {
	async run() {
		// Yaml content in object
		let CIContent = {
			name: 'Continuous Integration Pipeline',
			on: 'pull_request',
			jobs: {
				formatting: {
					name: 'Formatting Python Files',
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
								'pytest -vv --cov=backend/resources --cov-fail-under=90 -W ignore::DeprecationWarning\n'
						}
					]
				},
				deployForIT: {
					needs: 'pyTest',
					name: 'Deploying Branch to OpenShift for IT',
					'runs-on': 'ubuntu-latest',
					steps: [
						{
							uses: 'actions/checkout@v2'
						},
						{
							name: 'Setting up OpenShift Actions',
							uses: 'redhat-developer/openshift-actions@v2.1.0',
							with: {
								version: 'latest'
							}
						},
						{
							name: 'Executing OC commands',
							run:
								'oc login --token=${{ secrets.OC_API_TOKEN }} --server=${{ secrets.OC_SERVER_URL }}\noc new-app https://www.github.com/${{ github.repository }}#${{ github.head_ref }} --name=${{ github.head_ref }}\n'
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
							name: 'Setting up OpenShift Actions',
							uses: 'redhat-developer/openshift-actions@v2.1.0',
							with: {
								version: 'latest'
							}
						},
						{
							name: 'Executing OpenShift commands',
							run:
								'oc login --token=${{ secrets.OC_API_TOKEN }} --server=${{ secrets.OC_SERVER_URL }}\noc delete all --selector app=${{ github.head_ref }}\n'
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
							name: 'Setting up OpenShift Actions',
							uses: 'redhat-developer/openshift-actions@v2.1.0',
							with: {
								version: 'latest'
							}
						},
						{
							name: 'Executing OpenShift commands',
							run:
								'oc login --token=${{ secrets.OC_API_TOKEN }} --server=${{ secrets.OC_SERVER_URL }}\noc start-build production --follow || oc new-app https://www.github.com/${{ github.repository }} --name=production\n'
						}
					]
				}
			}
		};
		// convert js obj to yaml string
		let CIYamlStr = yaml.safeDump(CIContent);
		let CDYamlStr = yaml.safeDump(CDContent);

		// create directory for workflow yaml files
		fs.mkdir('./.github/workflows', { recursive: true }, function(err) {
			if (err) {
				console.log(err);
			} else {
				console.log('GitHub Action workflow directory created.');
				// write to yaml file
				fs.writeFile('./.github/workflows/ci.yaml', CIYamlStr, 'utf8', function(err) {
					if (err) {
						console.log(err);
					} else {
						console.log('CI workflow file created.');
					}
				});
				fs.writeFile('./.github/workflows/cd.yaml', CDYamlStr, 'utf8', function(err) {
					if (err) {
						console.log(err);
					} else {
						console.log('CD workflow file created.');
					}
				});
			}
		});
	}
}

SetupCommand.description = `Setup the CI/CD pipeline
...
This command generates the GitHub Action workflow yaml files to setup the CI/CD pipeline
`;

SetupCommand.flags = {
	name: flags.string({ char: 'n', description: 'name to print' })
};

module.exports = SetupCommand;