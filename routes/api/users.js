const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../../middleware/auth');
const fs = require('fs');


let lastId = readLastIdFromFile() || 0;
// Create a user
router.post('/', async(req, res) => {
    console.log('Request Body:', req.body);
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        
        lastId = ++lastId
        const userObject = {
        id: lastId,
        fname: req.body.fName,
        lname: req.body.lName,
        email: req.body.email,
        password: hash
        }
        const user = new User(userObject);
        await user.save();
        res.status(201).json(user);

        // Update the last used ID in the file
        updateLastIdInFile(lastId);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Something went wrong"});
    }
    
})

// Log in a user
router.post('/login', async(req, res) => {
    try {
        const {type, email, password, refreshToken} = req.body; //check
        if(type == 'email') {
            //Step 1: Find the user by email
            await emailLogin(email, res, password);
        }
        else {
            refreshTokenLogin(refreshToken, res);
        }
    }
    catch (error) {
        res.status(500).json({message: "Something went wrong"});
    }
})

// Get user profile
router.get('/profile', authenticateToken, async(req, res) => {
    try {
        const id = req.user.id;    //check
        const user = await User.findById(id);
        if(user) {
            res.json(user);
        }
        else {
            res.status(404).json({message: "User not found"});
        }
    }
    catch(error) {
        res.status(500).json({message: "Something went wrong"});
    }
})

// Get all users
router.get('/', async(req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    }
    catch(error) {
        res.status(500).json({message: "Something went wrong"});
    }
})

// Get one user
router.get('/:id', async(req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if(user) {
            res.json(user);
        }
        else {
            res.status(404).json({message: "User not found"});
        }
    }
    catch(error) {
        res.status(500).json({message: "Something went wrong"});
    }
})



// Update one user
router.put('/:id', async(req, res) => {
    try {
        const id = req.params.id;
        const userBody = {
            fname: req.body.fName,
            lname: req.body.lName,
            email: req.body.email
        }
        const newUser = await User.findByIdAndUpdate(id, userBody, {new: true});
        
        if(newUser) {
            res.json(newUser);
        }
        else {
            res.status(404).json({message: "User not found"});
        }
    }
    catch(error) {
        res.status(500).json({message: "Something went wrong"});
    }
})

// Delete one user
router.delete('/:id', async(req, res) => {
    try {
        const id = req.params.id;
        const deletedUser = await User.findByIdAndDelete(id);
        //const deletedUser = await User.findByIdAndDelete({_id: id});
        if(deletedUser) {
            res.json({message: "User has been deleted"});
        }
        else {
            res.status(404).json({message: "User not found"});
        }
    }
    catch(error) {
        res.status(500).json({message: "Something went wrong"});
    }
})


// Delete all users
router.delete('/', async (req, res) => {
    try {
        await User.deleteMany({});

        // Reset the lastId to 0 after deleting all users
        lastId = 0;
        updateLastIdInFile(lastId);

        res.json({ message: "All users have been deleted" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});


module.exports = router;


function readLastIdFromFile() {
    try {
        const data = fs.readFileSync('./ID/lastId.txt', 'utf8');
        return parseInt(data);
    } catch (err) {
        return null;
    }
}

function updateLastIdInFile(newId) {
    fs.writeFileSync('./ID/lastId.txt', newId.toString(), 'utf8');
}


function refreshTokenLogin(refreshToken, res) {
    if (!refreshToken) {
        res.status(401).json({ massage: 'Refresh token is not defined' });
    } else {
        jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, payload) => {
            if (err) {
                res.status(401).json({ massage: "Unauthorize" });
                return;
            } else {
                const id = payload.id;
                const user = await User.findById(id);
                if (!user) {
                    res.status(401).json({ massage: "User not found" });
                } else {
                    getUserToken(user, res);
                }

            }
        });
    }
}

async function emailLogin(email, res, password) {
    const user = await User.findOne({ email: email });
    if (!user) {
        res.status(401).json({ massage: "User not found" });
    }
    else {
        // Step 2: If user found match password
        const isValidPassword = await bcrypt.compare(password, user.password); //check
        if (!isValidPassword) {
            res.status(401).json({ massage: "Password is wrong" });
        }
        else {
            // Step 3: If password match then token generate
            getUserToken(user, res);
        }
    }
}

function getUserToken(user, res) {
    const accessToken = jwt.sign(
        { email: user.email, id: user._id }, //check
        process.env.JWT_SECRET, //check
        { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
        { email: user.email, id: user._id }, //check
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );

    const userObj = user.toJSON();
    userObj['accessToken'] = accessToken; //check
    userObj['refreshToken'] = refreshToken;
    res.status(200).json(userObj);
}
