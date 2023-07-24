const core = require('@actions/core');
const github = require('@actions/github');
const {Octokit} = require('@octokit/rest');
const fetch = require("node-fetch");
const {Toolkit} = require('actions-toolkit');
const getDiffWithLineNumbers = require('./git_diff');
const extractMatchingLines = require('./analyze');

const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE;

Toolkit.run(async (tools) => {
  try {
    const githubToken = core.getInput('token');
    const octokit = new Octokit({
      previews: ['antiope'],
      auth: githubToken,
      request: {fetch}
    });
    const keyWords = core.getInput('words-to-scan-for');
    const wordsToScan = keyWords.split(",").map(item => item.trim());

    const tools = new Toolkit({
      token: githubToken,
    });

    let PR = tools.context.payload.pull_request;
    console.log('**tools.context.payload**', tools.context.payload);

    let checkData = {
      owner: tools.context.repo.owner,
      repo: tools.context.repo.repo,
      started_at: new Date().toISOString(),
      head_sha: PR.head.sha,
      status: 'in_progress',
      name: 'PR Scan and Warn',
      mediaType: {
        previews: ['antiope'],
      },
    };
    const response = await octokit.checks.create(checkData);
    let check_id = response.data.id;
    console.log(`Check Successfully Created`, check_id);

    let ref = 'HEAD^1';
    const eventType = core.getInput('action-type');
    console.log('eventType:', eventType);
    if (eventType === 'workflow_dispatch') {
      ref = 'master';
    }

    let prData = await getDiffWithLineNumbers(ref);
    
    // now use this data to first form annotations for Warnings
    // display those Annotations
    
    let filesWithMatches = await extractMatchingLines(prData, wordsToScan);


    delete checkData['name'];
    delete checkData['started_at'];
    checkData.check_run_id = check_id;
    checkData.output = {};
    if (Object.keys(filesWithMatches).length === 0) {
      checkData['output'].title = 'PR Scan Summary';
      checkData['output'].summary = 'All Good! We found No Use of any Dangerous Words/Actions.';
      checkData['output'].annotations = [];
    } else {
      let annotations = [];
      let totalFiles = Object.keys(filesWithMatches).length;
      let totalWarnings = 0;
      for (const file in filesWithMatches) {
        if (Array.isArray(filesWithMatches[file])) {
          filesWithMatches[file].forEach(annotation => {
            totalWarnings+=1;
            const filePathTrimmed = file.replace(`${GITHUB_WORKSPACE}/`, '');
            annotations.push({
              path: filePathTrimmed,
              start_line: annotation.lineNumber,
              end_line: annotation.lineNumber,
              annotation_level: 'warning',
              title: `Use of Forbidden Word: ${annotation.wordFound}`,
              message: annotation.annotationMessage
            })
          });
        }
      }
      checkData['output'].title = 'PR Scan Summary';
      checkData['output'].summary = `:::Found a Total of ${totalWarnings} Warnings in ${totalFiles} Files!:::`;
      checkData['output'].annotations = annotations;
    }
    // update the check and add annotations
    await octokit.rest.checks.update(checkData);
    console.log(`Check Successfully Updated`, checkData);

    // finally close the Check
    delete checkData['output'].annotations;
    checkData.conclusion = 'success';
    checkData.status = 'completed';
    checkData.completed_at = new Date().toISOString();
    await octokit.rest.checks.update(checkData);
    console.log(`Check Successfully Closed`, checkData);

    // work on incorporating test coverage stuff as well
    // parse how the coverage file is structured then
    // use that to form annotations and
    // display those annotations as well

  } catch (error) {
    tools.exit.failure(error.message);
  }

  // If we got this far things were a success
  tools.exit.success('PR Scan and Warn Analysis completed successfully!')
});