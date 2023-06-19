const multer = require('multer');
const defaultPath = 'public';
const fs = require('fs');

const storage = multer.diskStorage({
	destination: async (req, file, cb) => {
		let directoryExist = fs.existsSync(`${defaultPath}/profileImage`);
		if (!directoryExist) {
			await fs.promises.mkdir(`${defaultPath}/profileImage`, {
				recursive: true,
			});
		}
		cb(null, `${defaultPath}/profileImage`);
	},
	filename: (req, file, cb) => {
		cb(
			null,
			'PIMG' +
				'.' +
				Date.now() +
				Math.round(Math.random() * 1000000000) +
				'.' +
				file.mimetype.split('/')[1]
		);
	},
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype.split('/')[1] === 'jpg' ||
		file.mimetype.split('/')[1] === 'jpeg' ||
		file.mimetype.split('/')[1] === 'png'
	) {
		cb(null, true);
	} else {
		cb(new Error('Not supported file format!'));
	}
};

exports.profileUpload = multer({ storage: storage, fileFilter: fileFilter });
