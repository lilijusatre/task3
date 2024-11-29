const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function userQuestion(query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

function validateArgs(args) {
    try {
        const diceArgs = args.slice(2);
        
        if (diceArgs.length < 3) {
            throw new Error('At least 3 dice configurations are required.');
        }

        return diceArgs.map((diceStr, index) => {
            const numbers = diceStr.split(',').map(num => parseInt(num.trim()));
            
            if (numbers.length !== 6) {
                throw new Error(`Dice ${index + 1} must have exactly 6 numbers.`);
            }
            
            if (numbers.some(isNaN)) {
                throw new Error(`Dice ${index + 1} contains invalid numbers.`);
            }
            
            return numbers;
        });
    } catch (error) {
        console.error('Error:', error.message);
        console.log('\nUsage example:');
        console.log('node task3.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3');
        return null;
    }
}

function determineFirstPlayer() {
    console.log('\nDetermining first player...');
    const random = Math.random();
    console.log(`Random value generated: ${random}`);
    return random < 0.5 ? 'user' : 'computer';
}

// Muestra el menú y obtiene la selección
async function showMenu(diceArgs) {
    console.log('\nAvailable dice:');
    diceArgs.forEach((dice, index) => {
        console.log(`${index + 1}. Dice: [${dice.join(',')}]`);
    });
    console.log(`${diceArgs.length + 1}. Help`);
    console.log(`${diceArgs.length + 2}. Exit`);

    const answer = await userQuestion('\nSelect a dice: ');
    return answer.trim();
}

function generateFairRandom(diceArgs) {
    const randomIndex = Math.floor(Math.random() * diceArgs.length);
    return diceArgs[randomIndex];
}

function computerTurn(dice, userDiceIndex) {
    let availableDice = [...Array(dice.length).keys()];
    availableDice.splice(userDiceIndex, 1);
    const computerDiceIndex = availableDice[Math.floor(Math.random() * availableDice.length)];
    
    const computerRoll = generateFairRandom(dice[computerDiceIndex]);
    console.log(`\nComputer selected dice ${computerDiceIndex + 1}`);
    console.log(`Computer rolled: ${computerRoll}`);
    
    return { diceIndex: computerDiceIndex, roll: computerRoll };
}

// Muestra la ayuda
function showHelp() {
    console.log('\nGame Help:');
    console.log('1. Select a dice from the available options');
    console.log('2. The computer will select a different dice');
    console.log('3. The highest roll wins');
    console.log('4. Type 5 or "exit" to quit the game');
}

async function playGame() {
    const diceArgs = validateArgs(process.argv);
    if (!diceArgs) {
        rl.close();
        return;
    }

    const firstPlayer = determineFirstPlayer();
    console.log(`\n${firstPlayer === 'user' ? 'You' : 'Computer'} go first!`);

    while (true) {
        const choice = await showMenu(diceArgs);

        if (choice.toLowerCase() === 'exit' || choice === (diceArgs.length + 2).toString()) {
            console.log('\nThanks for playing!');
            break;
        }

        if (choice === (diceArgs.length + 1).toString()) {
            showHelp();
            continue;
        }

        const diceIndex = parseInt(choice) - 1;
        if (diceIndex < 0 || diceIndex >= diceArgs.length) {
            console.log('\nInvalid choice. Please try again.');
            continue;
        }

        const userRoll = generateFairRandom(diceArgs[diceIndex]);
        console.log(`\nYou rolled: ${userRoll}`);

        const computerTurn1 = computerTurn(diceArgs, diceIndex);

        if (userRoll > computerTurn1.roll) {
            console.log('\nYou win!');
        } else if (userRoll < computerTurn1.roll) {
            console.log('\nComputer wins!');
        } else {
            console.log("\nIt's a tie!");
        }
    }

    rl.close();
}

playGame();