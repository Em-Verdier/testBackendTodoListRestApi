import express from 'express'
import bodyParser from 'body-parser'

// import sequelize connector and User and Message models instances
import { sequelize, User, Todos } from './models/db.js'

// Test if database connection is OK else exit
try {
    await sequelize.authenticate() // try to authentificate on the database
    console.log('Connection has been established successfully.')
    await User.sync({ alter: true }) // modify users table schema is something changed
    await Todos.sync({ alter: true }) //same for todos
} catch (error) {
    console.error('Unable to connect to the database:', error)
    process.exit(1)
}

// Local network configuration
const IP = 'localhost'
const PORT = 7777

const app = express()

// A middle for checking if an api key is provided by the user
// in the Authorization header
const getApiKey = async (req, res, next) => {
    const key = req.headers.authorization
    if (!key) {
        res.status(403).json({ code: 403, data: 'No api token' })
    } else {
        next()
    }
}

// A middleware for checking if an api token is valid
// and is still active.
// if Ok the user performing the request is attached to the req object.
const validateApiKey = async (req, res, next) => {
    const key = req.headers.authorization
    try {
        const user = await User.findAll({
            attributes: ['id', 'name'],
            where: { api_key: key },
        })
        // check if empty results then not found
        if (user.length === 0) {
            res.status(403).json({ code: 403, data: 'Invalid api token' })
        } else {
            console.log('USER:', user)
            req.user = user
            next()
        }
    } catch (e) {
        res.status(500).json({ code: 500, data: 'Internal server error' })
    }
}

app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false })) // to support URL-encoded bodies

app.post('/register', async (req, res) => {
    const name = req.body.name
    const id = req.body.id
    try {
        const user = await User.create({ name: name, id: id })
        res.json({ code: 200, data: user })
    } catch (e) {
        console.log('Error', e)
        res.status(500).json({ code: 500, data: 'Internal server error' })
    }
})


// créer une tâche
app.post('/create', async (req, res) => {
    const content = req.body.content
    const owner_id = req.user.id
    try {
        const todos = await Todos.create({
            owner_id: owner_id,
            content: content,
        })
        res.status(200).json({
            code: 200,
            data: todos,
        })
    } catch (e) {
        res.status(500).json({
            code: 500,
            data: 'Internal server error',
        })
    }
})
app.use(getApiKey)
app.use(validateApiKey)

// Start express server
app.listen(PORT, IP, () => {
    console.log(`listening on ${IP}:${PORT}`)
})
