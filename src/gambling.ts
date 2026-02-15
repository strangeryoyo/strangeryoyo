import { prompt_user_number } from './prompt_user';
import { display_message } from './display_message';

async function run(): Promise<void> {
    display_message("gambling game!");
    display_message("get to 5000 points!!!");

    let user_money = await prompt_user_number("how much money do you have: ", 0, 50);

    while (user_money > 0) {
        const user_number = await prompt_user_number("enter a number between 0 and 9: ", 0, 9);
        const user_bet_number = await prompt_user_number("how much do you want to bet: ", 0, user_money);

        // pick a random number between 0 and 9
        const dice_roll = Math.floor(Math.random() * 10);
        display_message("random dice roll: " + dice_roll);

        let gain: number;
        if (dice_roll == user_number) {
            gain = user_bet_number * 8 - user_bet_number;
        } else if (dice_roll == user_number - 1 || dice_roll == user_number + 1) {
            gain = user_bet_number * 5 - user_bet_number;
        } else if (user_number == 0 && dice_roll == 9) {
            gain = user_bet_number * 5 - user_bet_number;
        } else if (user_number == 9 && dice_roll == 0) {
            gain = user_bet_number * 5 - user_bet_number;
        } else {
            gain = -user_bet_number;
        }

        // display result to user
        display_message("You won: " + gain);
        display_message("You now have: " + (user_money + gain));
        user_money = user_money + gain;

        if (user_money >= 5000) {
            display_message("you won ggs");
            return;
        }
    }

    display_message("thank you for all your money !!!!!!!!!!!!!!!!!!!!!! :-)");
}

run();
