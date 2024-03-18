/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require("child_process");

const argument = process.argv[2];

if (!argument) {
  console.error("Missing command or argument. Please provide both.");
  process.exit(1);
}

const fullCommand = `yarn run typeorm migration:create src/database/migrations/${argument}`;
execSync(fullCommand, { stdio: "inherit" });
