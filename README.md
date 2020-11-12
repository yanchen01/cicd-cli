cicd
====



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cicd.svg)](https://npmjs.org/package/cicd)
[![Downloads/week](https://img.shields.io/npm/dw/cicd.svg)](https://npmjs.org/package/cicd)
[![License](https://img.shields.io/npm/l/cicd.svg)](https://github.com/yanchen01/cicd_cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g cicd
$ cicd COMMAND
running command...
$ cicd (-v|--version|version)
cicd/0.0.0 win32-x64 node-v14.15.0
$ cicd --help [COMMAND]
USAGE
  $ cicd COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`cicd config [REPOOWNER] [REPONAME] [ACCESSTOKEN] [OC_SERVER_URL] [OC_API_TOKEN]`](#cicd-config-repoowner-reponame-accesstoken-oc_server_url-oc_api_token)
* [`cicd help [COMMAND]`](#cicd-help-command)

## `cicd config [REPOOWNER] [REPONAME] [ACCESSTOKEN] [OC_SERVER_URL] [OC_API_TOKEN]`

Configure secrets for the GitHub Actions workflow

```
USAGE
  $ cicd config [REPOOWNER] [REPONAME] [ACCESSTOKEN] [OC_SERVER_URL] [OC_API_TOKEN]

OPTIONS
  -a, --accessToken=accessToken      GitHub Access Token with repo access
  -n, --repoName=repoName            name of GitHub repo
  -o, --repoOwner=repoOwner          owner of GitHub repo
  -s, --OC_SERVER_URL=OC_SERVER_URL  OpenShift server url
  -t, --OC_API_TOKEN=OC_API_TOKEN    Openshift API token

DESCRIPTION
  Enter your credentials and it will be encrypted
```

_See code: [src\commands\config.js](https://github.com/yanchen01/cicd_cli/blob/v0.0.0/src\commands\config.js)_

## `cicd help [COMMAND]`

display help for cicd

```
USAGE
  $ cicd help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src\commands\help.ts)_
<!-- commandsstop -->
