import * as readline from 'readline-sync';
import teamsPlayers from './teams&players.json';
import playerStats from './playerStats.json';

function mainMenu(): void {
    let exit = false;

    do {
        const option: number = readline.questionInt(
            "Welcome to the JSON Data Viewer!\n\n1. View all teams and players\n2. Filter team by ID\n3. Filter player by ID\n4. Exit\n\nPlease enter your choice: "
        );

        switch (option) {
            case 1:
                viewAllData();
                break;
            case 2:
                filterByTeamID();
                break;
            case 3:
                filterByPlayerID();
                break;
            case 4:
                console.log("Exiting...");
                exit = true;
                break;
            default:
                console.log("Invalid option. Please try again.");
        }
    } while (!exit);
}

function viewAllData(): void {
    console.log("All Teams and Players Data:");
    console.table(teamsPlayers.map(team => ({
        id: team.id,
        teamName: team.teamName,
        region: team.region,
        ranking: team.ranking,
        playersCount: team.players.length
    })));
}

function filterByTeamID(): void {
    const teamID: number = readline.questionInt("Enter the Team ID: ");
    const team = teamsPlayers.find(team => team.id === teamID);

    if (!team) {
        console.log(`No team found with ID: ${teamID}`);
        return;
    }

    console.log(`Team: ${team.teamName}`);
    console.table(team.players.map(player => ({
        id: player.id,
        name: player.name,
        role: player.role,
        active: player.active,
    })));
}

function filterByPlayerID(): void {
    const playerID: number = readline.questionInt("Enter the Player ID: ");
    let foundPlayer: any = null;
    let teamName: string = "";


    for (const team of teamsPlayers) {
        const player = team.players.find(p => p.id === playerID);
        if (player) {
            foundPlayer = player;
            teamName = team.teamName;
            break;
        }
    }

    if (!foundPlayer) {
        console.log(`No player found with ID: ${playerID}`);
        return;
    }

    const stats = playerStats.find(stat => stat.id === foundPlayer.stats.id);

    console.log(`Player: ${foundPlayer.name}`);
    console.log(`Team: ${teamName}`);
    console.log("Player Details:");
    console.table({
        id: foundPlayer.id,
        name: foundPlayer.name,
        role: foundPlayer.role,
        age: foundPlayer.age,
        active: foundPlayer.active,
        birthDate: foundPlayer.birthDate,
    });

    if (stats) {
        console.log("Player Stats:");
        console.table({
            matchesPlayed: stats.matchesPlayed,
            roundsWon: stats.roundsWon,
            headshots: stats.headshots,
            kills: stats.additionalStats.kills,
            deaths: stats.additionalStats.deaths,
            rating: stats.additionalStats.rating,
        });
    } else {
        console.log("No stats available for this player.");
    }
}

mainMenu();