'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			User.hasMany(models.Post, {
				foreignKey: 'userId',
			});

			User.hasMany(models.PostLike, {
				foreignKey: 'userId',
			});

			User.hasMany(models.Comment, {
				foreignKey: 'userId',
			});
		}
	}
	User.init(
		{
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: {
					name: 'email',
					msg: 'Email has already taken!',
				},
				validate: {
					isEmail: true,
				},
			},
			userName: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: {
					name: 'userName',
					msg: 'Username has already taken!',
				},
			},
			password: {
				type: DataTypes.STRING,
				validate: {
					len: {
						args: [8, 255],
						msg: 'Password length must contain more than 8 characters!',
					},
				},
			},
			fullName: DataTypes.STRING,
			profilePicture: DataTypes.STRING,
			bio: DataTypes.STRING,
			status: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			token: DataTypes.STRING,
			passwordToken: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'User',
		}
	);
	return User;
};
