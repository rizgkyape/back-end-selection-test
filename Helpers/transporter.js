const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'gokikara81197@gmail.com',
		pass: 'fudiyavvqaqzxoti',
	},
	tls: {
		rejectUnauthorized: false,
	},
});

module.exports = transporter;
