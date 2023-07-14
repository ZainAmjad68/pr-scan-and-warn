const extractMatchingLines = require('./analyze');

let testData = [{fileName: 'src/components/Conversation.tsx',
                data: [
                {
                    lineNumber: '39',
                    endsAfter: '5',
                    line: [
                    "console.log('first log destroy()');",
                    "console.log('second log');",
                    "console.log('third log');",
                    '',
                    ''
                    ]
                },
                {
                    lineNumber: '48',
                    endsAfter: '3',
                    line: [
                    "console.log('first log (2)');",
                    "console.log('second log dropTable (2)');",
                    ''
                    ]
                },
                {
                    lineNumber: '58',
                    endsAfter: '2',
                    line: [ "console.log('first log (3)');", '' ]
                }
                ]},
                {fileName: 'gitDiffWithLineNumbers.js',
                    data: [
                      {
                        lineNumber: '1',
                        endsAfter: '51',
                        line: [
                          'import {exec, execSync} from "child_process";',
                          '',
                          "exec('git diff --name-only HEAD', (error, stdout, stderr) => {",
                          "console.log('stdout: ', stdout);",
                          "let files = stdout.split('\\n');",
                          'files.pop();',
                          "console.log('files: ', files);",
                          'let prData = [];',
                          'for (const file of files) {',
                          'const regex = /\\+([^\\n]+)/g;',
                          'let allChangedLines;',
                          'try {',
                          "allChangedLines = execSync(`git diff --unified=0 --ignore-all-space ${file} | grep -E '^\\\\+\\\\+\\\\+' -v | grep -E '^\\\\+'`).toString();",
                          '} catch (err) {',
                          'console.log(`Seems Like No New Stuff was added in ${file}. Skipping It.`);',
                          'continue;',
                          '}',
                          'allChangedLines = allChangedLines.trim();',
                          'destroy()',
                          "let linesNos = execSync(`git diff --unified=0 HEAD -- ${file} | grep -e '^@@' | awk -F'@@' '{print $2}'`).toString();",
                          'linesNos = linesNos.trim();',
                          'let matches = linesNos.match(regex).map(match => match.substring(1));',
                          'matches = matches.map(s => s.trim());',
                          '',
                          'let data = [];',
                          "let changedLineArray = allChangedLines.split('\\n');",
                          'for (const string of matches) {',
                          "if (string.includes(',')) {",
                          "const [number, iterations] = string.split(',');",
                          'if (!isNaN(Number(iterations))) {',
                          'const count = parseInt(iterations, 10);',
                          'let dataToConcat = {lineNumber: number, endsAfter: iterations, line: []};',
                          'for (let i = 0; i < count; i++) {',
                          'let lineData = changedLineArray.shift();',
                          "lineData = lineData && lineData.replace(/^\\+/, '').trim();",
                          'dataToConcat.line.push(lineData);',
                          '}',
                          'data.push(dataToConcat);',
                          '} else {',
                          "console.log('Invalid number of iterations');",
                          '}',
                          '} else {',
                          'let lineData = changedLineArray.shift();',
                          "lineData = lineData.replace(/^\\+/, '').trim();",
                          "data.push({lineNumber: string, endsAfter: '1', line: [lineData]});",
                          '}',
                          '}',
                          'prData.push({fileName: file, data});',
                          '}',
                          'return prData;',
                          '});'
                        ]
                      }
                    ]},
                    {fileName: 'src/main.tsx',
                    data: [
                      {
                        lineNumber: '12',
                        endsAfter: '10',
                        line: [
                          "console.log('this works 1');",
                          "console.log('this works 2');",
                          "console.log('this works 3');",
                          "console.log('this works 4');",
                          "console.log('this works 5 destroy() dropTable');",
                          '',
                          "console.log('this works 6');",
                          "console.log('this works 7');",
                          '',
                          ''
                        ]
                      }
                    ]},
                    {fileName: 'src/routes/index.tsx',
                    data: [
                      {
                        lineNumber: '9',
                        endsAfter: '9',
                        line: [
                          "console.log('root routes');",
                          '',
                          "console.log('test logs');",
                          "console.log('test logs2');",
                          '',
                          "console.log('end root routes');",
                          'dropTable',
                          '',
                          ''
                        ]
                      }
                    ]},
                    {fileName: 'src/pages/Login.tsx',
                    data: [
                      {
                        lineNumber: '2',
                        endsAfter: '4',
                        line: [
                          "console.log('hello');",
                          "console.log('this is a multi line');",
                          "console.log('comment');",
                          'dangerousWord'
                        ]
                      }
                    ]}
];

(async function() {
    let filesWithMatches = await extractMatchingLines(testData, ['destroy()', 'dropTable', 'dangerousWord']);
    console.log(filesWithMatches);
})();