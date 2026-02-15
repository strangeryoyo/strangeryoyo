import { display_message } from './display_message';

export function prompt_user(message: string): Promise<string> {
    return new Promise((resolve) => {
        const promptContainer = document.getElementById("prompt");
        if (promptContainer === null) throw new Error('Cannot find an element with id "prompt"');

        // Clear any existing content
        promptContainer.innerHTML = "";

        // Create the prompt message
        const promptText = document.createElement("p");
        promptText.textContent = message;
        promptContainer.appendChild(promptText);

        // Create the input field
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.id = "user-input";
        inputField.placeholder = "Enter your response here";
        promptContainer.appendChild(inputField);

        // Create the submit button
        const submitButton = document.createElement("button");
        submitButton.textContent = "Submit";
        promptContainer.appendChild(submitButton);

        // Handle user submission
        const sendInput = () => {
            const userInput = inputField.value;
            promptContainer.innerHTML = ""; // Clear the prompt
            resolve(userInput); // Resolve the promise with user input
        };

        submitButton.onclick = () => sendInput();

        inputField.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                sendInput();
            }
        });

        // Focus the input field for better user experience
        inputField.focus();
    });
}

export async function prompt_user_number(question: string, min: number, max: number): Promise<number> {
    while (true) {
        const user_input = await prompt_user(question);
        const user_number = Number.parseInt(user_input);

        if (Number.isNaN(user_number)) {
            display_message("U MUST ENTER A NUMBER!!!");
            continue;
        }

        if (user_number > max || user_number < min) {
            display_message(`THE NUMBER MUST BE BETWEEN ${min} AND ${max}`);
            continue;
        }

        return user_number;
    }
}
