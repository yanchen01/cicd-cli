/* Import required modules */
const request_log = require('request');
const { request } = require("@octokit/request");
// const { Octokit } = require('@octokit/rest')
// const octokit = new Octokit({auth: "82ecb34ca797b2099bf0ef22f113c05d8a810818", baseUrl: 'https://api.github.com',
// log: {
//     debug: () => {},
//     info: () => {},
//     warn: console.warn,
//     error: console.error
//   },
//   request: {
//     agent: undefined,
//     fetch: undefined,
//     timeout: 0
//   }
// });

/* Check all list of runs */
async function checkListRuns(accessToken, repoOwner, repoName) {
    const result = await request('GET /repos/{owner}/{repo}/actions/runs', {
        owner: repoOwner,
        repo: repoName,
        headers: {
            authorization: accessToken,
            accept : 'application/vnd.github.v3+json'
          },
      })
    //   console.log(result);
    // for result.data['workflow_runs'].length
    var url_List = []
    console.log("There are " + result.data['workflow_runs'].length + ' jobs found');
    for (i = 0; i < result.data['workflow_runs'].length; i++) {
        let branch = result.data['workflow_runs'][i]['head_branch']
        let id = result.data['workflow_runs'][i]['id']
        let status = result.data['workflow_runs'][i]['status']
        let event = result.data['workflow_runs'][i]['event']
        let logs_url = result.data['workflow_runs'][i]['logs_url']
        url_List[i] = logs_url
        // console.log("Json Data: %j", result.data['workflow_runs'].length);
        console.log(`The NO.${i} job is a ${event} event with ID = ${id}, the status is ${status}`);
      }
      console.log(url_List)
    //   console.log("Json Data: %j", result.data['workflow_runs'].length);
      return url_List
}
async function test(owner, repo, run_id) {
    const result = octokit.actions.listWorkflowRunLogs({
        owner,
        repo,
        run_id
      });
      console.log(result)
    }



async function download_logs(download_url, accessToken) {
    var d = {
        'request' : {
            'method' : 'getuser'
        }
    };
    const fs = require('fs');
    request_log.get({
        url: download_url,
        headers: {
            'Authorization': "token " + accessToken,
            "Accept": "application/vnd.github.golden-comet-preview+json",
            'User-Agent' : 'https://api.github.com/meta'
          },
        body:JSON.stringify(d)
        }).pipe(fs.createWriteStream('logs.zip')).on('close', function () {
        console.log('Response File written!');});
}


// var list = checkListRuns('<GH_SECRET>', '<GH_username>', '<GH_REPO_NAME>')
//try https://api.github.com/repos/SweetSourPeter/Building_CI_CD_for_API/actions/runs/353689125/logs
download_logs('<download_url>', '<GH_SECRET>')