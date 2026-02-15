import { prompt_user_number, prompt_user } from './prompt_user';
import { display_message } from './display_message';

async function run(): Promise<void> {
    display_message("guessing game!");

    const user_name = await prompt_user("what is your name: ");

    // pick random number
    const random_roll = Math.floor(Math.random() * 101);

    while (true) {
        const user_number = await prompt_user_number("wich number do you want to pick: ", 0, 100);

        display_message("you entered: " + user_number);

        // if closer say h or l
        if (user_number > random_roll) {
            display_message("lower ");
        }
        if (user_number < random_roll) {
            display_message("higher ");
        }
        if (user_number == random_roll) {
            display_message(`ggs you won, ${user_name}`);
            break;
        }
    }
}

run();
