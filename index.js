const core = require('@actions/core');
const github = require('@actions/github');
const {Toolkit} = require('actions-toolkit');

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

  console.log('Pull Request Diff: ', pullRequest);

  const keyWords = core.getInput('words-to-scan-for');
  core.setOutput("annotations", `echo '::error file=src/main.tsx,line=1::You Should Not be using ${keyWords} here.'`);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
