require('dotenv').config()

const
    express = require('express'),
    cors = require('cors'),
    pg = require('pg'),
    app = express(),
    PORT = process.env.PORT || 3000,
    DATABASE = process.env.DATABASE,
    client = new pg.Client(DATABASE);


app.use(express.json())

client.connect().then(() => {
    console.log(`connected successfully to database`);
    app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
}).catch(err => console.log(err))


app.get('/api/players', async (req, res) => {
    try {
        const result = await client.query('select * from player');
        return res.json({ status: 'success', data: result.rows });
    } catch (err) {
        console.log(err);
    }
})


app.get('/api/players/:id', async (req, res) => {
    const result = await client.query('select * from player = $1', [id]);
    if (result.rows.length === 0) {
        return res.status(404).send('player not found');
    }
    return res.json({ status: 'success', data: result.rows[0] });
})

app.post('/api/players', async (req, res) => {
    const { team_name, city, coach, team_id } = req.body;
    const result = await client.query(
        'INSERT INTO player (team_name, city,coach) VALUES ($1, $2,$3,$4) RETURNING *',
        [team_name, city, coach, team_id]
    );
    res.status(201).json(result.rows[0]);
})

app.put('/api/players/:id', async (req, res) => {
    const { id } = req.params;
    const { team_name, city, coach, team_id } = req.body;

    const result = await client.query(
        'UPDATE player SET team_name = $1, city = $2  ,coach=$3,team_id=$4 WHERE id = $4 RETURNING *',
        [team_name, city, coach, team_id, id]
    );
    if (result.rows.length === 0) {
        return res.status(404).send('player not found');
    }
    res.json(result.rows[0]);

});



app.delete('/api/players/:id', async (req, res) => {
    const { id } = req.params;

    const result = await client.query('DELETE FROM player WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
        return res.status(404).send('player not found');
    }
    res.status(204).send();

});
