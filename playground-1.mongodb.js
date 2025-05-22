import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const uri = "mongodb+srv://dylandebrouwer:m4SQy74JJzZ57qH3@m4w01f.hpslzru.mongodb.net/?retryWrites=true&w=majority&appName=M4W01F";
const client = new MongoClient(uri);
const dbName = "M4W01F";

async function seedDatabase() {
    try {
        await client.connect();
        console.log("Verbonden met MongoDB");

        const db = client.db(dbName);
        const usersCollection = db.collection("users");

        const adminExists = await usersCollection.findOne({ username: "admin" });
        const userExists = await usersCollection.findOne({ username: "user" });

        if (!adminExists) {
            await usersCollection.insertOne({
                username: "admin",
                password: await bcrypt.hash("adminpassword", 10),
                role: "ADMIN"
            });
            console.log("Admin gebruiker aangemaakt.");
        }

        if (!userExists) {
            await usersCollection.insertOne({
                username: "user",
                password: await bcrypt.hash("userpassword", 10),
                role: "USER"
            });
            console.log("Normale gebruiker aangemaakt.");
        }

    } catch (error) {
        console.error("Fout bij het seeden van de database:", error);
    } finally {
        await client.close();
    }
}

seedDatabase();