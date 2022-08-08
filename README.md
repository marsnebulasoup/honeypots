# OpenAI ConversationalAI in Node.js

ConversationalAI test in Node.js with GPT-3 in the CLI

## Running
Run 
```
npm run prep
```
to install dependencies & build, and
```
npm run dev
```
to launch.

To watch for changes and build on save, run
```
tsc -w
```
-----

OR you can install everything manually:

### Dependencies
Install TypeScript globally (ignore if already installed)
```
npm install typescript@latest -g
```
Install dependencies
```
npm install
```

### Building
If you make changes to any TypeScript files in `src/` it helps to run the watcher which auto-complies them to JS as you save.
```
tsc -w
```
...OR you can just run 
```
tsc
```
to build once.

### Running
Run `ts-built/ai.js`
```
node ts-built/ai.js
```
