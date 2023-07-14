const exec2 = require('@actions/exec');
const core = require('@actions/core');
const github = require('@actions/github');
const {Toolkit} = require('actions-toolkit');
const getDiffWithLineNumbers = require('./git_diff');
const extractMatchingLines = require('./analyze');


Toolkit.run(async (tools) => {
  try {
    // `words-to-scan-for` input defined in action metadata file
    const githubToken = core.getInput('token');

    const keyWords = core.getInput('words-to-scan-for');
  
    let prData = await getDiffWithLineNumbers('HEAD^1');
    let filesWithMatches = await extractMatchingLines(prData, keyWords);

    // now use this data to first form annotations for Warnings
    // display those Annotations

    // work on incorporating test coverage stuff as well
    // parse how the coverage file is structured then
    // use that to form annotations and
    // display those annotations as well

  } catch (error) {
    tools.exit.failure(error.message);
  }

  // If we got this far things were a success
  tools.exit.success('PR Scan and Warn Analysis completed successfully!')
})