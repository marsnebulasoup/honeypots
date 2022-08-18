# HoneyPots

Conversational AI for Telegram built in Node.js with OpenAI's GPT-3 API.

The idea is that a user adds a chat to a specific folder in Telegram, and the AI will begin responding to it.

## Usage
Run
```
git submodule add LINK_TO_THIS_REPO.git
npm install --save PATH_TO_THIS_REPO
```
...then import as with any other module.

``` typescript
import { TLClient, HoneyPots, Configuration, StringSession } from "honeypots";

const OPENAI_API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // OpenAI API Key
const TL_API_ID = 1234567; // Telegram API ID
const TL_API_HASH = "xxxxxxx"; // Telegram API Hash
const TL_SESSION = new StringSession(""); // Optional
const TL_FOLDER_NAME = "HONEYPOT";

const tlClient = new TLClient({
  apiId: TL_API_ID, // Telegram API ID
  apiHash: TL_API_HASH, // Telegram API Hash
  session: TL_SESSION, // if you have an existing session, pass it here to skip the login
});

await tlClient.init({
  getPhoneNumberIfNeeded: async () => prompt("Phone") || "", // called if phone number is needed
  getPasswordIfNeeded: async () => prompt("Password") || "", // called if password is needed
  getPhoneCodeIfNeeded: async () => prompt("Code") || "", // called if phone code is needed
});

const honeypots = new HoneyPots({
  // TLClient instance
  client: tlClient,

  // name of the folder in telegram to watch
  honeypotFolderName: TL_FOLDER_NAME,

  config: {
    honeypotConfig: {
      // any OpenAI configs you want to pass along.
      openai: new Configuration({
        apiKey: OPENAI_API_KEY,
      }),

      // how many messages to send to the AI to preserve the conversation
      messageHistoryLimit: 10,

      // personality of the AI
      personality: (name: string, recipientName: string): string =>
        `${name} is a friend that enjoys hockey and lives in Canada. ${name} is a bit grumpy, and is always mad at the neighborhood kids, for making too much noise.`,
    },
  },
});

await honeypots.watch(); // start watching for messages
```

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
