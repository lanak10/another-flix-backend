const User = require('../../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Create a user
const create = async (req, res) => {
    try {
        const createdUser = await User.create(req.body)
        res.status(200).json(createJWT(createdUser))
    } catch(e) {
        res.status(400).json({msg: e.message})
    }
}

// Login
const login = async (req, res) => {
    try {
        // Find user by email
        const user = await User.findOne({
            email: req.body.email
        })
        // Throw error if user not found
        if(!user) throw new Error()

        // compare() takes the user's input from req.body, hashes it, and compares it to our db hashed pw
        // compare() incorporates the encoding process in the db hashed pw and uses the same encoding process with the user's input
        const match = await bcrypt.compare(req.body.password, user.password)

        // If the pws don't match throw new error
        if(!match) throw new Error()

        res.status(200).json(createJWT(user))
    } catch(e) {
        res.status(401).json({
            msg: e.message, 
            reason: 'Bad Credentials'
        })
    }
}

// Find a user
const show = async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.id)
        res.status(200).json(foundUser)
    } catch(e) {
        res.status(400).json({msg: e.message})
    }
}

// Update a user
const update = async (req, res) => {
    try {
        // Pre and post save() hooks are not executed on update(), findOneAndUpdate(), etc.
        // We need to handle our password update hash here and not as a pre-hook
        req.body.password = await bcrypt.hash(req.body.password, 10)
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true})
        res.status(200).json(updatedUser)
    } catch(e) {
        res.status(400).json({msg: e.message})
    }
}

// Get user's favorites
const getFavorites = async (req, res) => {
    try {
        const favorites = await User.findById(req.params.id).populate('favorites').select('favorites')
        res.status(200).json(favorites)
    } catch(e) {
        res.status(400).json({msg: e.message})
    }
}

// Helper Function
// JWT is created with a secret key and that secret key is private to you which means you will never reveal that to the public or inject inside the JWT token.
function createJWT (user) {
    return jwt.sign(
        // payload
        {user}, 
        // secret
        process.env.SECRET,
        // options
        {expiresIn: '48h'}
    )
}

module.exports = {
    create,
    login,
    show,
    update,
    getFavorites,
}