const readline = require('readline');
const fs = require('fs');
const { access, constants } = require('fs');
const request = require('request');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const args = process.argv.slice(2);
const url = args[0];
const fileToSave = args[1];

const isUrlValid = (string) => {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
};

const fetcher = (url, fileToSave) => {
  if (!isUrlValid(url)) {
    process.stdout.write('URL invalid please try again. \n');
    process.exit();
  }

  access(fileToSave, constants.F_OK, (err) => {
    if (err) {
      console.log(`${fileToSave} does not exist`);
      process.exit();
    }
    console.log(`${fileToSave} exists`);
  });

  if (fs.existsSync(fileToSave)) {
    rl.question(
      `File already exists.
    Do you want to overwrite? Press Y to continue: `,
      (answer) => {
        if (answer === 'y' || answer === 'Y') {
          request(url, (error, response, body) => {
            if (error) console.log('URL request error:', error); // Print the error if occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code

            const content = body;

            fs.writeFile(fileToSave, content, (err) => {
              if (err) console.log('Error:', err);
            });
            console.log(
              `Downloaded and saved ${content.length} bytes to ${fileToSave}`
            );
          });
          rl.close();
        }

        if (answer === 'n' || answer === 'N') {
          process.exit();
        }
      }
    );
  } else {
    request(url, (error, response, body) => {
      console.log('error:', error); // Print error if occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

      const content = body;

      fs.writeFile(fileToSave, content, { flag: 'a+' }, (err) => {});
      console.log(
        `Downloaded and saved ${content.length} bytes to ${fileToSave}`
      );
    });
  }
};

fetcher(url, fileToSave);
