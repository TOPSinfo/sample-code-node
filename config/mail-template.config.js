var EMAIL_TEMPLATE={
	'USER_ACCOUNT_CONFIRMATION':"<b>Hello,</b><br><br><b>{{firstName}} {{lastName}} </b> has registered under <b> {{companyURL}} </b>.Please Click on the link to confirm and activate the account.</b><br><br><center><b><a href={{link}}>Click here to confirm</a></b></center><br><br><b>Regards,</b><br><b>The Bombyx team<b/>",
	'COMPANY_ACCOUNT_CONFIRMATION':"<b>Hello,</b> <br> <h4>{{companyName}}</h4> has been registered under Bombyx. <br> \
				Please Click on the link to login to your account. \
				<br><br> \
				<b><a href={{link}}> {{link}} </a></b> \
				<br><br> \
				<b>Regards,</b><br><b>The Bombyx team<b/>",
	'NOTIFICATION_MAIL':"Hi {{firstName}},<br><br>We got a request to reset your Urepost password. <br><br> <b><a href={{link}}> Reset your password </a></b> <br><br> If you ignore this message, your password won't be changed. <br> If you didn't request a password reset, let us know. <br/><br/><b>Regards,</b><br><b>The Urepost Team<b/>",

}
var EMAIL_LINKS={
	 'USER_ACCOUNT_CONFIRMATION':"http://{{reqHost}}/#/user/confirm?id={{userId}}&code={{generatedEmailVerifyToken}}&userEmail={{userEmail}}&companyAdminEmail={{companyAdminMail}}",
	 'COMPANY_ACCOUNT_CONFIRMATION':"http://{{reqHost}}",
	'NOTIFICATION_MAIL': "http://{{reqHost}}/#/reset-password?email={{email}}&token={{generatedEmailVerifyToken}}",
}
var EMAIL_SUBJECT={
	'USER_ACCOUNT_CONFIRMATION':"Account Confirmation Required",
	"COMPANY_ACCOUNT_CONFIRMATION":"Thank you for registration",
	"NOTIFICATION_MAIL":"Password Change Notification"
}

var objSetMailConfig = {
	"EMAIL_TEMPLATE" :EMAIL_TEMPLATE,
	"EMAIL_LINKS":EMAIL_LINKS,
	"EMAIL_SUBJECT":EMAIL_SUBJECT
};
module.exports = objSetMailConfig;