# HoneyPots

Conversational AI for Telegram built in Node.js with OpenAI's GPT-3 API. Built to fight scam.

[View a basic demo.](https://honeychat-dashboard.onrender.com/#/)

Flow:
 - user logs into Telegram
 - define a new AI personality
 - user adds a chat to a specific folder in Telegram
   - AI reads messages, establishes converation history
   - when a new message is recieved, AI reads it, then responds.

## Usage
Run
```
git submodule add LINK_TO_THIS_REPO.git
npm install --save PATH_TO_THIS_REPO
```
...then import as with any other module.


## Development
Run 
```
npm run prep
```
to install dependencies & build, or
```
tsc
```
to just build.

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
