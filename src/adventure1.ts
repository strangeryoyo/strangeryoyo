import OpenAI from "openai";
import { display_html } from './display_message';

// WARNING: API key was exposed - you should rotate it!
const OPENAI_API_KEY = "YOUR_API_KEY_HERE";

const openAiClient = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

const PERSONA = `
You are an author of pick your own adventure books.
You like to write exciting stories in fantastic worlds wich capture the imagination of the readers.
You play with their emotions: sad, funny, scared...
`;

const INSTRUCTIONS = `
Write between one and three paragraphs that describe what happens and the reader current situation.
Then suggest between one and five choices of what the reader could do.

Use HTML tags for formatting the text.We can click on choice then reload the page. When the user clicks on one choice, call the function pickChoice with the text of the choice as the argument.
Ex: pickChoice('You move forward')
`;

const BOOK_1 = `
The story starts with an adventurer at the entrance of a ruined castle. He has to find an amulet buried deep into his dungeon.
`;

type Message = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

const messages: Message[] = [
    { role: 'system', content: PERSONA },
    { role: 'system', content: INSTRUCTIONS },
    { role: 'system', content: BOOK_1 }
];

async function run(): Promise<void> {
    display_html('<p>Thinking... please wait</p>');

    const chatCompletion = await openAiClient.chat.completions.create({
        messages: messages,
        model: 'gpt-4o'
    });

    const chaptMessage = chatCompletion.choices[0].message;
    display_html(chaptMessage.content ?? '');
    messages.push(chaptMessage as Message);
}

declare global {
    interface Window {
        pickChoice: (choice: string) => void;
    }
}

window.pickChoice = (choice: string) => {
    messages.push({ role: 'user', content: choice });
    run();
};

run();
