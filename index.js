const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

const PORT = 5432;

const { authRouter, userRouter, postRouter } = require('./Routers');
// IMPORT ROUTERS
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/posts', postRouter);

app.listen(PORT, () => {
	console.log(`server started on port ${PORT}`);
});
