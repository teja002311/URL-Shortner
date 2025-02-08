const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const validUrl = require('valid-url');

const keys = require('./keys');  // Import keys.js

// Connect to MongoDB
mongoose.connect(keys.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('DB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

const ShortLink = require('./models/shortlink');

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Home route
app.get('/', async (req, res) => {
    try {
        const count = await ShortLink.countDocuments();
        res.render('index', { total_links: count });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Function to generate random short links
function generateShortCode(length = 7) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Create short link
app.post('/short', async (req, res) => {
    const { url } = req.body;

    if (!validUrl.isUri(url)) {
        return res.status(400).json('Invalid URL');
    }

    try {
        const existingLink = await ShortLink.findOne({ real_link: url });
        if (existingLink) {
            return res.status(200).json(`${req.headers.host}/r/${existingLink.short_link}`);
        }

        let shortCode;
        let isUnique = false;

        while (!isUnique) {
            shortCode = generateShortCode();
            const existingShort = await ShortLink.findOne({ short_link: shortCode });
            if (!existingShort) {
                isUnique = true;
            }
        }

        const newShortLink = new ShortLink({
            real_link: url,
            short_link: shortCode,
            ip: req.ip
        });

        await newShortLink.save();
        res.status(200).json(`${req.headers.host}/r/${shortCode}`);
    } catch (err) {
        console.error(err);
        res.status(500).json("Database Error");
    }
});

// Redirect short link to original URL
app.get('/r/:code', async (req, res) => {
    try {
        const link = await ShortLink.findOne({ short_link: req.params.code });

        if (!link) {
            return res.status(404).send("Short URL Not Found");
        }

        res.redirect(link.real_link);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
