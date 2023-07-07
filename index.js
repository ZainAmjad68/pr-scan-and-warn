const core = require('@actions/core');
const github = require('@actions/github');

try {
  // `words-to-scan-for` input defined in action metadata file
  const keyWords = core.getInput('words-to-scan-for');
  core.setOutput("annotations", `echo '::error file=src/main.tsx,line=1::You Should Not be using ${keyWords} here.'`);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
