////////////////////////////////////////////////////////////////////////////////
// Name: OpenAI ConversationalAI in Node.js
// Purpose: ConversationalAI test in Node with GPT-3 in the CLI
//
// OpenAI Data usage and costs:
// https://beta.openai.com/account/usage
//
// OpenAI API keysL
// https://beta.openai.com/account/api-keys
//
// Compare AI engines:
// https://gpttools.com/comparisontool
//
// GPT-3/Python tutorial:
// https://www.youtube.com/watch?v=9971sxBhEyQ
// https://www.youtube.com/watch?v=ePdmv4ucmb8
////////////////////////////////////////////////////////////////////////////////

const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');
const path = require('path');
var readlineSync = require('readline-sync');

// Turn on the AI component of code
AI_ON = true;


// Load secret API key that is not in the repo
require('dotenv').config()
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


// Language model for GPT-3: https://beta.openai.com/docs/models/gpt-3
// Compare AI engines: https://gpttools.com/comparisontool
var ADA, BABBAGE, CURIE, DA_VINCI, ENGINE_TYPE, MAX_PROMPT_LENGTH, NAME;
DA_VINCI = "text-davinci-002";      // Best (most expensive) engine
CURIE = "text-curie-001";
BABBAGE = "text-babbage-001";
ADA = "text-ada-001";               // Worst (cheapest) AI engine
ENGINE_TYPE = DA_VINCI;             // Which engine to use
NAME = "Jarvis";                    // Name of AI "person"
MAX_PROMPT_LENGTH = 10;             // TODO: Prompt should not be too long


// Read from a file
// https://stackoverflow.com/questions/34980249/returning-undefined-from-readfile
function open_file(filepath) {
    const data = fs.readFileSync(path.join(__dirname, 'data', filepath), 'utf8');
    return data;
};


// Append to a file
function append(filepath, content) {
    fs.writeFileSync(path.join(__dirname, 'data', filepath), content, { encoding: 'utf8', flag: 'a' });
    // Data written to file
}


// Janky way to test non-AI code
if (AI_ON) {
    (async () => {
        // Store our counversation in the AI's "memory"
        var conversation = [];
        // Our loop will allow us to chat with AI until we send a signal interrupt
        while (true) {
            // Get user input
            var user_input = await readlineSync.question('User: ');
            // Load the user input into the AI's "memory"
            await conversation.push('User: ' + user_input);
            // Preoare AI memory for AI prompt
            var text_block = await conversation.join("\n");
            // Clever way to combine prompt with AI memory
            var prompt = await open_file("chat_prompt.txt").replace("<<BLOCK>>", text_block) + `${NAME}:`;
            // Get rid of errors when using weird unicode characters
            // https://stackoverflow.com/questions/20856197/remove-non-ascii-character-in-string
            // var prompt = await Buffer.from(raw_prompt).toString('ASCII');
            // Get AI response
            var raw_response = await openai.createCompletion({
                model: ENGINE_TYPE,
                prompt: prompt,
                temperature: 0.75,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0.5,
                max_tokens: 150,
                stop: ["User:", `${NAME}: `, ".\n", "?\n"]
            });
            var response = await raw_response.data.choices[0].text.trim();
            // Print AI response to CLI
            await console.log(`${NAME}: ${response}`);
            // // Store AI response in AI "memory"
            await conversation.push(`${NAME}: ${response}`);
            // // Log USER conversation to file
            await append("chat_log.txt", conversation.slice(-2)[0] + "\n");
            // // Log AI conversation to file
            await append("chat_log.txt", conversation.slice(-1)[0] + "\n");
        }
    })();
}