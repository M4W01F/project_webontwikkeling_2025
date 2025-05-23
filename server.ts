import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import bcrypt from "bcrypt";
import teamsPlayers from "./teams&players.json";
import playerStats from "./playerStats.json";
import { MongoClient } from "mongodb";
const session = require("express-session");
import mongoose from "mongoose";

const uri = "mongodb+srv://dylandebrouwer:m4SQy74JJzZ57qH3@m4w01f.hpslzru.mongodb.net/?retryWrites=true&w=majority&appName=M4W01F";
const client = new MongoClient(uri);
const dbName = "M4W01F";

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        return client.db(dbName);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}

const app = express();
const PORT = 3000;

// **Sessiemiddleware boven de routes**
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Configure EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// **Database Connection Setup**
async function startServer() {
    const db = await connectDB();
    const usersCollection = db?.collection("users");

    if (!usersCollection) {
        console.error("Database connection is missing!");
        return;
    }

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });

    // ** Authentication Routes **
    app.get("/login", (req: Request, res: Response) => {
        res.render("login", { error: "" });
    });

    app.get("/register", (req: Request, res: Response) => {
        res.render("register", { error: "" });
    });

    let currentUser: { username: string; role: string } | null = null;

    app.get("/logout", (req: Request, res: Response) => {
    currentUser = null;
    res.redirect("/login");
    });

    app.get("/edit", (req: Request, res: Response) => {
    if (!currentUser || currentUser.role !== "ADMIN") {
        return res.render("index", { error: "Nog te implementeren" });
    }

    res.render("edit");
    });

    // ** Register Route **
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.post("/register", async (req: Request, res: Response) => {
        try {
            const { name, pass } = req.body;

            if (!name || !pass) {
                return res.render("register", { error: "Naam en wachtwoord zijn vereist!" });
            }

            const existingUser = await usersCollection.findOne({ name: name });
            if (existingUser) {
                return res.render("register", { error: "Naam bestaat al!" });
            }

            await usersCollection.insertOne({ name: name, password: pass, role: "USER" });

            const authenticatedUser = await usersCollection.findOne({ name: name });

            if (!authenticatedUser) {
                return res.render("register", { error: "Er is een probleem opgetreden. Probeer opnieuw." });
            }

            currentUser = { username: authenticatedUser.name, role: authenticatedUser.role };
            console.log(`Gebruiker ${name} geregistreerd en ingelogd!`);
            res.redirect("/dashboard");
        } catch (error) {
            console.error("Registratiefout:", error);
            res.render("register", { error: "Er is een probleem opgetreden. Probeer opnieuw." });
        }
    });

    app.post("/login", async (req: Request, res: Response) => {
        console.log("Volledige request body:", req.body);
        const { user, pass } = req.body;

        if (!user || !pass) {
            console.error("Gebruikersnaam of wachtwoord ontbreekt!");
            return res.render("login", { error: "Vul een geldige gebruikersnaam en wachtwoord in!" });
        }

        const allUsers = await usersCollection.find({}).toArray();
        console.log("Alle gebruikers:", allUsers);

        const authenticatedUser = allUsers.find(u => u.name === user);

        if (!authenticatedUser || authenticatedUser.password !== pass) {
            console.error("Ongeldige combinatie van gebruikersnaam en wachtwoord!");
            return res.render("login", { error: "Ongeldige gebruikersnaam of wachtwoord." });
        }

        currentUser = { username: authenticatedUser.name, role: authenticatedUser.role };
        res.redirect("/dashboard");
    });

        // ** Dashboard Route **
        app.get("/dashboard", (req: Request, res: Response) => {
            if (!currentUser) {
                return res.redirect("/login");
            }

            res.render("dashboard", { user: currentUser });
        });
    }

startServer();

// ** Other Routes (Homepage, Team Details, Player Details) **
app.get("/", (req: Request, res: Response) => {
    const { filter, sort } = req.query;
    let teams = teamsPlayers;

    if (filter) {
        const filterStr = (filter as string).toLowerCase();
        teams = teams.filter(team => team.teamName.toLowerCase().includes(filterStr));
    }

    if (sort) {
        const [key, order] = (sort as string).split("_");
        teams = teams.sort((a, b) => {
            const aValue = a[key as keyof typeof a];
            const bValue = b[key as keyof typeof b];
            return order === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
        });
    }

    res.render("index", { teams });
});

app.get("/teams/:id", (req: Request, res: Response) => {
    const teamId = parseInt(req.params.id, 10);
    const team = teamsPlayers.find(t => t.id === teamId);

    if (!team) {
        res.status(404).send("Team not found");
        return;
    }

    res.render("detail", { team });
});

app.get("/players/:id", (req: Request, res: Response) => {
    const statsId = parseInt(req.params.id, 10);
    const playerStatsEntry = playerStats.find(stat => stat.id === statsId);

    if (!playerStatsEntry) {
        res.status(404).send("Player stats not found");
        return;
    }

    let matchedPlayer: any = null;
    let previousTeam: number | null = null;
    let teamName: string = "";

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
        res.status(404).send("Player not found in any team");
        return;
    }

    res.render("player", {
        player: matchedPlayer,
        stats: playerStatsEntry,
        teamName,
        previousTeam,
    });
});
