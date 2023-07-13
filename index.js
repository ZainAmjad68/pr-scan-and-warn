const exec2 = require('@actions/exec');
const core = require('@actions/core');
const github = require('@actions/github');
const {Toolkit} = require('actions-toolkit');
const {exec, execSync} = require('child_process');
const getDiffWithLineNumbers = require('./git_diff');

Toolkit.run(async (tools) => {
  try {
    // `words-to-scan-for` input defined in action metadata file
    const githubToken = core.getInput('token');
    const octokit = github.getOctokit(githubToken);

    const tools = new Toolkit({
      token: githubToken,
    });

    const { data: pullRequest } = await octokit.rest.pulls.get({
        owner: tools.context.repo.owner,
        repo: tools.context.repo.repo,
        pull_number: tools.context.payload.pull_request.number,
        mediaType: {
          format: 'diff'
        }
    });

    const resp = await octokit.rest.pulls.listFiles({
      owner: tools.context.repo.owner,
      repo: tools.context.repo.repo,
      pull_number: tools.context.payload.pull_request.number,
      per_page: 100
    });

    

    console.log('Pull Request Diff: ', pullRequest);
    console.log('Pull Request ListFiles: ', resp.data);
    const diff = core.getInput('diff');
    console.log('Diff from git-diff-action: ', diff);


    const keyWords = core.getInput('words-to-scan-for');
    core.setOutput("annotations", `echo '::error file=src/main.tsx,line=1::You Should Not be using ${keyWords} here.'`);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2);

    console.log(`The event payload: ${payload}`);
    console.log('context PR base ref: ', github.context.payload.pull_request.base.ref);

    let execChangedFiles = await exec2.exec(`git diff --name-only HEAD^1`);
    let getExecOutputChangedFiles = await exec2.getExecOutput(`git diff --name-only HEAD^1`);
    console.log('execChangedFiles: ', execChangedFiles);
    console.log('getExecOutputChangedFiles: ', getExecOutputChangedFiles);


    let changedFiles = await execSync(`git diff --name-only HEAD^1`).toString();
    let files = changedFiles.split('\n');
    files.pop();
    console.log('files changed: ', files);
  
    let prData = await getDiffWithLineNumbers('HEAD^1');
    console.log('All the Changes: ', prData);

  } catch (error) {
    tools.exit.failure(error.message);
  }

  // If we got this far things were a success
  tools.exit.success('PR Scan and Warn Analysis completed successfully!')
})