var nodemailer = require('nodemailer');
const randomToken = require('random-token');
const Q = require('q');
const {
	adminEmail,
	adminPassword
} = require('../../config/server.config.js');
const mailConfig = require('../../config/mail-template.config.js');
const async = require("async");

var service = {};
service.sendCustomizedMail = sendCustomizedMail;
module.exports = service;

function sendCustomizedMail(emailTemplate, userAccountInfo, mailInfo) {
	var deferred = Q.defer();
	var generatedEmailVerifyToken = randomToken(16);
	mailInfo['generatedEmailVerifyToken'] = generatedEmailVerifyToken;
	var mailSendFrom = mailInfo.mailSendFrom || adminEmail;
	var mailSendTo = mailInfo.mailSendTo;

	getDataFromConfig(mailInfo, emailTemplate, 'link').then(function (objLink) {
			userAccountInfo['link'] = objLink;
			getDataFromConfig(userAccountInfo, emailTemplate, 'template').then(function (objTemplate) {
				// Mail body for company user confirmation mail
				let transporter = nodemailer.createTransport({
					service: 'gmail',
					auth: {
						user: adminEmail, // generated ethereal user
						pass: adminPassword // generated ethereal password
					}
				});

				// setup email data with unicode symbols
				let mailOptions = {
					from: '"UrePost"', // sender address
					to: mailSendTo,
					subject: mailConfig.EMAIL_SUBJECT[emailTemplate] || mailInfo.subject,
					html: objTemplate || (mailInfo.message || ''),
				};

				// send mail with defined transport object
				transporter.sendMail(mailOptions, (error, info) => {
					if (error) {
						return console.log(error);
					}
					deferred.resolve({
						"success": true,
						"message": 'Message sent: ',
						"id": info.id,
						"data": {
							"generatedEmailVerifyToken": generatedEmailVerifyToken
						}
					});
					console.log('Message sent: %s', info.messageId);
					// Preview only available when sending through an Ethereal account
					console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

					// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
					// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
				})
			})
				.catch((err) => {
					return deferred.reject(err);
				});
		})
		.catch((err) => {
			return deferred.reject(err);
		});
	return deferred.promise;
}

async function getDataFromConfig(mailInfo, emailTemplate, type) {
	try {
		var keys = Object.keys(mailInfo);
		if (type == 'link')
			var data = mailConfig.EMAIL_LINKS[emailTemplate];
		else
			var data = mailConfig.EMAIL_TEMPLATE[emailTemplate];

		if (keys.length > 0 && data) {
			for (const val of keys) {
				data = replaceAll(data, "{{" + val + "}}", mailInfo[val]);
			}
			return data;
		} else {
			return '';
		}
	} catch (e) {
		throw e;
	}
}

function replaceAll(str, find, replace) {
	find = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	return str.replace(new RegExp(find, 'g'), replace);
}