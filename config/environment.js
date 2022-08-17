const dotenv = require("dotenv").config();

const development = {
	api_key: process.env.API_KEY,
	asset_path: process.env.ASSET_PATH,
};

module.exports = development;
