const core = require('@actions/core');
const github = require('@actions/github');
const {Octokit} = require('@octokit/rest');
const {Toolkit} = require('actions-toolkit');
const getDiffWithLineNumbers = require('./git_diff');
const extractMatchingLines = require('./analyze');


Toolkit.run(async (tools) => {
  try {
    const githubToken = core.getInput('token');
    const octokit = new Octokit({
      previews: ['antiope'],
      auth: githubToken,
    });
    const keyWords = core.getInput('words-to-scan-for');
    const wordsToScan = keyWords.split(",").map(item => item.trim());

    let prData = await getDiffWithLineNumbers('HEAD^1');
    
    // now use this data to first form annotations for Warnings
    // display those Annotations
    
    let filesWithMatches = await extractMatchingLines(prData, wordsToScan);

    let checkData = {      
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      name: 'PR Scan and Warn',
      head_sha: github.context.sha,
      status: 'completed',
      conclusion: 'neutral',
      output: { title: 'PR Scan Report' },
      mediaType: {
        previews: ['antiope'],
      }
    };

    if (Object.keys(filesWithMatches).length === 0) {
      checkData.output.summary = 'All Good! We found No Use of any Dangerous Words/Actions.';
      checkData.output.annotations = [];
    } else {
      let annotations = [];
      let totalFiles = Object.keys(filesWithMatches).length;
      let totalWarnings = 0;
      for (const file in filesWithMatches) {
        if (Array.isArray(filesWithMatches[file])) {
          filesWithMatches[file].forEach(annotation => {
            totalWarnings+=1;
            annotations.push({
              path: file,
              start_line: annotation.lineNumber,
              end_line: annotation.lineNumber,
              annotation_level: 'warning',
              title: `Use of Forbidden Word: ${annotation.wordFound}`,
              message: annotation.annotationMessage
            })
          });
        }
      }
      checkData.output.summary = `:::Found a Total of ${totalWarnings} Warnings in ${totalFiles} Files!:::`;
      checkData.output.annotations = annotations;
    }
    
    const check = await octokit.rest.checks.create(checkData);
    console.log(`Check Successfully Created :`, check);

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