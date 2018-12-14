// config used by server side only
'use strict';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || 27017;
const dbName = process.env.DB_NAME || 'shop';
const dbUser = process.env.DB_USER || '';
const dbPass = process.env.DB_PASS || '';
const dbCred = dbUser.length > 0 || dbPass.length > 0 ? `${dbUser}:${dbPass}@` : '';
const path = require('path');
const uploadDir = path.join(__dirname, '../static');

module.exports = {
	// used by Store (server side)
	apiBaseUrl: `http://localhost:3001/api/v1`,

	// used by Store (server and client side)
	ajaxBaseUrl: `http://localhost:3001/ajax`,

	// Access-Control-Allow-Origin
	storeBaseUrl: '*',

	// used by API
	adminLoginUrl: '/admin/login',

	apiListenPort: 3001,
	storeListenPort: 3000,

	// used by API


	smtpServer: {
		host: '',
		port: 0,
		secure: true,
		user: '',
		pass: '',
		fromName: '',
		fromAddress: ''
	},

	// key to sign tokens
	jwtSecretKey: 'SL69kXFT3znRi7kL8Max2GTB24wOtEQj',

	// key to sign store cookies
	cookieSecretKey: '8669X9P5yK1DAEthy1chc3M9EncyS7SJ',

	// path to uploads
	categoriesUploadPath: 'public/content/images/categories',
	productsUploadPath: 'public/content/images/products',
	filesUploadPath: 'public/content',
	themeAssetsUploadPath: 'theme/assets/images',
	maxSizeUpload: 5 * 1024 * 1024,
	// url to uploads
	imageUploadUrl: `${uploadDir}/images`,
	productsUploadUrl: '/images/products',
	filesUploadUrl: '',
	themeAssetsUploadUrl: '/assets/images',
	fbAppId: '1026046343443805675',
	fbClientToken: '805bfe8bb11523d2485bbf3aa80857d5',
	adminEmail: "test@topsinfosolutions.com",
	adminPassword: "test",
	// store UI language
	language: 'en',

};