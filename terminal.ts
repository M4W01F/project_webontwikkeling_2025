import * as readline from 'readline-sync';
import teamsPlayers from './teams&players.json';
import playerStats from './playerStats.json';


const option: number = readline.questionInt("Welcome to the JSON data viewer!\n\n1. View all data\n2. Filter by ID\n3. Exit\n\nPlease enter your choice: ");

switch (option) {
    case 1:
        console.log("All Data:");
        console.log(JSON.stringify(teamsPlayers, null, 2));
        console.log(JSON.stringify(playerStats, null, 2));
        break;
    case 2:
        const choice: number = readline.questionInt("Please enter the ID you want to filter by: ");
        const filteredTeamsPlayers = teamsPlayers.filter((item: any) => item.id === choice);
        const filteredPlayerStats = playerStats.filter((item: any) => item.id === choice);
        console.log(`Filtered Data by ID: ${choice}`);
        console.log(JSON.stringify(filteredTeamsPlayers, null, 2));
        console.log(JSON.stringify(filteredPlayerStats, null, 2));
        break;
    case 3:
        console.log("Exiting...");
        break;
    default:
        console.log("Invalid option. Please enter a valid choice.");
        break;
}
