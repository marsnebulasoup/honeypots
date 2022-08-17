# HoneyPots

Conversational AI for Telegram built in Node.js with OpenAI's GPT-3 API.

## Usage

``` typescript
import { TLClient } from './tl/client';
import { StringSession } from "telegram/sessions";

// This is basically a wrapper around gram.js's TelegramClient with some helpful methods
const tlClient = new TLClient({ 
  apiId, // Telegram API ID
  apiHash, // Telegram API Hash
  session: new StringSession("") // if you have an existing session, pass it here to skip the login
});

await client.init({
  getPhoneNumberIfNeeded: async () => ..., // called if phone number is needed
  getPasswordIfNeeded: async () => ...,    // called if password is needed
  getPhoneCodeIfNeeded: async () => ...,   // called if phone code is needed
});

const honeypots = new HoneyPots({
  // TLClient instance
  client: tlClient,

  // name of the folder in telegram to watch
  honeypotFolderName: AI_FOLDER_NAME,

  config: {
    honeypotConfig: {
      // any OpenAI configs you want to pass along.
      openai: new Configuration({
        apiKey: OPENAI_API_KEY
      }),

      // how many messages to send to the AI to preserve the conversation
      messageHistoryLimit: 10, 

      // personality of the AI
      personality: (name: string, recipientName: string): string => `${name} is a friend that enjoys hockey and lives in Canada. ${name} is a bit grumpy, and is always mad at the neighborhood kids, for making too much noise.`,
    }
  }
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
