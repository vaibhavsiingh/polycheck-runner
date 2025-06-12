
# README
Polycheck Runner is a VS Code extension that lets you right-click a file, open a side panel to enter “pre” and “post” condition files, and then runs a bundled binary on the original file. Output is shown in the panel.


## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Installation
1. Clone the repository:

```bash
git clone https://github.com/vaibhavsiingh/polycheck-runner
cd polycheck-runner
```
Install dependencies and compile Typescript:

```bash
npm install
npm run compile
```
Package or run in development:

To test in VS Code: press F5 in the Extension Development Host.

To package: vsce package (ensure bin/ contains your binaries with executable permissions).
