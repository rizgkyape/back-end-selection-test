const jwt = require('jsonwebtoken');

module.exports = {
	verifyToken: (req, res, next) => {
		let token = req.headers.authorization;
		if (!token)
			return res.status(401).send('Access Denied / Unauthorized request');

		try {
			token = token.split(' ')[1];

			if (token === 'null' || !token)
				return res.status(401).send('Unauthorized request 1');

			let verifiedUser = jwt.verify(token, 'coding-its-easy');

			if (!verifiedUser) return res.status(401).send('Unauthorized request 1');
			req.user = verifiedUser;
			next();
		} catch (error) {
			res.status(400).send('Invalid Token');
		}
	},
};
