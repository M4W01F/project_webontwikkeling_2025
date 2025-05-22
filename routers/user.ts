import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const uri = "mongodb+srv://dylandebrouwer:m4SQy74JJzZ57qH3@m4w01f.hpslzru.mongodb.net/?retryWrites=true&w=majority&appName=M4W01F";
const client = new MongoClient(uri);
const dbName = "M4W01F";

async function getDB() {
    await client.connect();
    return client.db(dbName);
}

// **Zoek een gebruiker in de database**
export async function findUser(username: string) {
    const db = await getDB();
    return db.collection("users").findOne({ username });
}

// **Verwerk login**
export async function authenticateUser(username: string, password: string) {
    const user = await findUser(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error("Ongeldige gebruikersnaam of wachtwoord.");
    }
    
    return { username: user.username, role: user.role };
}

// **Registreer een nieuwe gebruiker**
export async function registerNewUser(username: string, password: string) {
    const db = await getDB();
    const usersCollection = db.collection("users");

    const existingUser = await findUser(username);
    if (existingUser) throw new Error("Gebruikersnaam bestaat al!");

    const hashedPassword = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({ username, password: hashedPassword, role: "USER" });

    return { message: "Account aangemaakt! Je kunt nu inloggen." };
}
