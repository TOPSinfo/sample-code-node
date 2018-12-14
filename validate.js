const apiResponse = require('./apiResponse');
const commonFunction = {};
commonFunction.validateRequest = validateRequest;
commonFunction.catchSequalizeError = catchSequalizeError;

module.exports = commonFunction;

function validateRequest(req, res, required) {
	for (var key in required) {
		if (key == 'email')
			req.check(key, key + ' must not be empty').notEmpty().isEmail();
		else
			req.check(key, key + ' must not be empty').notEmpty();
	}
	var errors = req.validationErrors();
	if (errors) {
		var response = {
			errors: []
		};
		errors.forEach(function (err) {
			response.errors.push(err.msg);
		});
		var errorResponse = apiResponse.setFailureResponse(response);
		return response;
	} else {
		var successResponse = {
			"success": true
		};
		return successResponse;
	}
}

async function catchSequalizeError(e) {
	if ((e['name'] === 'SequelizeValidationError' || e['name'].includes('Sequelize')) && e['errors'].length) {
		return {
			errors: e['errors'].map(val => val['message'])
		}
	} else
		throw e;

}