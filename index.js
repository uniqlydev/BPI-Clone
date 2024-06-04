const express = require('express')
const express_session = require('express-session')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')


const app = express()
app.use(bodyParser.json())
const port = process.env.PORT || 3000



app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.use('/api/users', require('./routers/userRouter'));




app.get('/', async (req, res) => {
    
    res.render('index');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.get('/register', (req, res) => {
    res.render('register');
});

