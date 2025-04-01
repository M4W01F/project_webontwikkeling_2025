import * as readline from 'readline-sync';
import teamsPlayers from './teams&players.json';
import playerStats from './playerStats.json';

function mainMenu(): void {
    let exit = false; // Flag to control the loop

    do {
        const option: number = readline.questionInt(
            "Welcome to the JSON Data Viewer!\n\n1. View all data\n2. Filter by ID\n3. Search by Name\n4. Exit\n\nPlease enter your choice: "
        );

        switch (option) {
            case 1:
                viewAllData();
                break;
            case 2:
                filterByID();
                break;
            case 3:
                console.log("Exiting...");
                exit = true;
                break;
            default:
                console.log("Invalid option. Please enter a valid choice.");
        }
    } while (!exit);
}

function viewAllData(): void {
    console.log("All Data:");
    console.table(teamsPlayers);
    console.table(playerStats);
}

function filterByID(): void {
    const choice: number = readline.questionInt("Please enter the ID you want to filter by: ");

    const filteredTeamsPlayers = teamsPlayers.filter((item: any) => item.id === choice);
    const filteredPlayerStats = playerStats.filter((item: any) => item.id === choice);

    if (filteredTeamsPlayers.length === 0 && filteredPlayerStats.length === 0) {
        console.log(`No data found for ID: ${choice}`);
    } else {
        console.log(`Filtered Data by ID: ${choice}`);
        console.table(filteredTeamsPlayers);
        console.table(filteredPlayerStats);
    }
}

mainMenu();
