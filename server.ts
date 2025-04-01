import express from 'express';
import cors from 'cors';
import path from 'path';
import teamsPlayers from './teams&players.json';
import playerStats from './playerStats.json';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route: Homepage
app.get('/', (req, res) => {
    const { filter, sort } = req.query;
    let teams = teamsPlayers;

    if (filter) {
        const filterStr = (filter as string).toLowerCase();
        teams = teams.filter(team => team.teamName.toLowerCase().includes(filterStr));
    }

    if (sort) {
        const [key, order] = (sort as string).split('_');
        teams = teams.sort((a, b) => {
            const aValue = a[key as keyof typeof a];
            const bValue = b[key as keyof typeof b];
            return order === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
        });
    }

    res.render('index', { teams });
});

// Route: Team details
app.get('/teams/:id', (req, res) => {
    const teamId = parseInt(req.params.id, 10);

    const team = teamsPlayers.find(t => t.id === teamId);
    if (!team) {
        res.status(404).send('Team not found');
        return;
    }

    res.render('detail', { team });
});

// Route: Player details
app.get('/players/:id', (req, res) => {
    const statsId = parseInt(req.params.id, 10);

    const playerStatsEntry = playerStats.find(stat => stat.id === statsId);
    if (!playerStatsEntry) {
        res.status(404).send('Player stats not found');
        return;
    }

    let matchedPlayer = null;
    let previousTeam = null;
    let teamName = '';

    for (const team of teamsPlayers) {
        const player = team.players.find(p => p.stats.id === statsId);
        if (player) {
            matchedPlayer = player;
            previousTeam = team.id;
            teamName = team.teamName;
            break;
        }
    }

    if (!matchedPlayer) {
        res.status(404).send('Player not found in any team');
        return;
    }

    res.render('player', {
        player: matchedPlayer,
        stats: playerStatsEntry,
        teamName,
        previousTeam,
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});