var figlet = require('figlet');

figlet('completed open server!!', function (err, data) {
	if (err) {
		console.log('Something went wrong...');
		console.dir(err);
		return;
	}
	console.log(data);
});

const express = require('express');
const app = express();
const port = 3000;
var cors = require('cors');

app.set('views', './src/views');
app.set('view engine', 'ejs');
app.use(express.static(`${__dirname}/src/public`));

const home = require('./src/routes/home');
app.use('/', home);

var corsOptions = {
	origin: 'https://max-play-ground.netlify.app/',
	optionsSuccessStatus: 200 || 204 || 101, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.listen(port, () => {
	console.log(`open server port : ${port}`);
});