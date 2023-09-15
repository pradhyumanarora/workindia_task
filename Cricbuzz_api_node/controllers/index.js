const pool = require("../queries");
const bcrypt = require("bcrypt");
const { generateToken, authMiddleware } = require("../middleware");

const signUp = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);
        const ifExists = await pool.query(`SELECT * FROM users WHERE email = $1`, [
            email,
        ]);
        if (ifExists.rows.length > 0) {
            return res.status(401).json({ message: "User already exists" });
        }

        bcrypt.hash(password, 10, async (err, hash) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Internal server error" });
            }
            const result = await pool.query(
                `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id`,
                [username, email, hash]
            );
            const user_id = result.rows[0].id;
            res
                .status(200)
                .json({ message: "User created successfully", userId: user_id });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const logIn = async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query(`SELECT * FROM users WHERE username = $1`, [
            username,
        ]);
        if (result.rows.length === 0) {
            console.log(result);
            return res.status(401).json({ message: "Invalid email or password" });
        }
        bcrypt.compare(password, result.rows[0].password, (err, match) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Internal server error" });
            }
            if (!match) {
                return res.status(401).json({ message: "Invalid email or password" });
            }
            const token = generateToken(result.rows[0].id);

            console.log(token);
            res.status(200).json({ message: "Logged in successfully", token: token });
        });
    } catch (err) {
        console.log(err);
        res.status(502).json({ message: "Internal server error" });
    }
};

const addTeams = async (req, res) => {
    const { team_name } = req.body;

    try {
        await pool.query(
            "CREATE TABLE IF NOT EXISTS teams (team_name VARCHAR(255) PRIMARY KEY)"
        );

        const result = await pool.query(
            "INSERT INTO teams (team_name) VALUES ($1) RETURNING team_name",
            [team_name]
        );
        const teamName = result.rows[0].team_name;
        res
            .status(200)
            .json({ message: "Team added successfully", teamName: teamName });
    } catch (err) {
        console.log(err);
        res.status(502).json({ message: "Internal server error" });
    }
};

const createMatch = async (req, res) => {
    const { team_1, team_2, date, venue } = req.body;
    // authMiddleware
    try {
        authMiddleware(req, res, async () => {
            await pool.query(
                "CREATE TABLE IF NOT EXISTS teams (team_name VARCHAR(255) PRIMARY KEY)"
            );

            const res1 = await pool.query("SELECT * FROM teams WHERE team_name = $1", [
                team_1,
            ]);
            const res2 = await pool.query("SELECT * FROM teams WHERE team_name = $1", [
                team_1,
            ]);

            if (res1.rows.length < 1) {
                await pool.query("INSERT INTO teams (team_name) VALUES ($1)", [team_1]);
            }
            if (res2.rows.length < 1) {
                await pool.query("INSERT INTO teams (team_name) VALUES ($1)", [team_2]);
            }

            await pool.query(
                "CREATE TABLE IF NOT EXISTS matches (id SERIAL PRIMARY KEY, team_1 VARCHAR(255) NOT NULL, team_2 VARCHAR(255) NOT NULL, date DATE NOT NULL, venue VARCHAR(255) NOT NULL,status VARCHAR(255) DEFAULT 'upcoming' ,FOREIGN KEY (team_1) REFERENCES teams(team_name), FOREIGN KEY (team_2) REFERENCES teams(team_name))"
            );

            const result = await pool.query(
                `INSERT INTO matches (team_1,team_2,date,venue) VALUES ($1,$2,$3,$4) RETURNING id`,
                [team_1, team_2, date, venue]
            );
            const matchId = result.rows[0].id;
            res
                .status(200)
                .json({ message: "Match created successfully", matchId: matchId });
        });
    } catch (err) {
        console.log(err);
        res.status(502).json({ message: "Internal server error" });
    }
};

const getMatches = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM matches');
        res.status(200).json({ message: "Matches fetched successfully", matches: result.rows });
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ message: "Internal server error" });
    }
}

const getMatchById = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM matches WHERE id = $1', [id]);
        const res1 = await pool.query('SELECT * FROM squad WHERE team_id = $1', [result.rows[0].team_1]);
        const res2 = await pool.query('SELECT * FROM squad WHERE team_id = $1', [result.rows[0].team_2]);
        res.status(200).json({ message: "Match fetched successfully", match: result.rows, squad : {team1: res1.rows, team2: res2.rows} } );
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ message: "Internal server error" });
    }
};

const addPlayerStats = async (req, res) => {
    const { pid, matches_played, runs, average, strike_rate } = req.body;

    try {
        await pool.query(
            "CREATE TABLE IF NOT EXISTS player_stats (id SERIAL PRIMARY KEY, pid INT NOT NULL, matches_played VARCHAR(255) NOT NULL, runs INT NOT NULL, average DECIMAL(10,2) NOT NULL, strike_rate DECIMAL(10,2) NOT NULL, FOREIGN KEY (pid) REFERENCES squad(player_id))"
        );

        const result = await pool.query(
            `INSERT INTO player_stats (pid,matches_played,runs,average,strike_rate) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
            [pid, matches_played, runs, average, strike_rate]
        );
        const statsId = result.rows[0].id;
        res
            .status(200)
            .json({ message: "Player stats added successfully", statsId: statsId });
    } catch (err) {
        console.log(err);
        res.status(502).json({ message: "Internal server error" });
    }
};

const playerStats = async (req, res) => {
    const pid = req.params.id;

    try {
        const result = await pool.query(
            `SELECT * FROM player_stats WHERE pid = $1`,
            [pid]
        );
        res.status(200).json({
            message: "Player stats fetched successfully",
            stats: result.rows,
        });
    } catch (err) {
        console.log(err);
        res.status(502).json({ message: "Internal server error" });
    }
};

const createSquad = async (req, res) => {
    const team_id = req.params.team_id;
    const { name, role } = req.body;
    try {
        await pool.query(
            "CREATE TABLE IF NOT EXISTS squad (player_id SERIAL PRIMARY KEY, team_id VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, role VARCHAR(255) NOT NULL, FOREIGN KEY (team_id) REFERENCES teams(team_name))"
        );

        // const result = await pool.query(`INSERT INTO matches (user1,user2) VALUES ($1,$2) RETURNING id`,[user1,user2]);
        const result = await pool.query(
            `INSERT INTO squad (team_id,name,role) VALUES ($1,$2,$3) RETURNING player_id`,
            [team_id, name, role]
        );
        console.log(result);
        const player_id = result.rows[0].player_id;
        res
            .status(200)
            .json({ message: "Player added to squad successfully", player_Id: player_id });
    } catch (err) {
        console.log(err);
        res.status(502).json({ message: "Internal server error" });
    }
};

module.exports = {
    signUp,
    logIn,
    createMatch,
    getMatches,
    getMatchById,
    addPlayerStats,
    playerStats,
    createSquad,
    addTeams,
};
