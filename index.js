const core = require('@actions/core');
const github = require('@actions/github');
const {Toolkit} = require('actions-toolkit');

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
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
  } catch (error) {
    tools.exit.failure(error.message);
  }

  // If we got this far things were a success
  tools.exit.success('PR Scan and Warn Analysis completed successfully!')
})