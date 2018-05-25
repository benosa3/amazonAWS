'use strict'
var AWS = require('aws-sdk');
const ACI = require('amazon-cognito-identity-js');
const config = require('../config.json');
const CircularJSON = require('circular-json');
const Logger = require('../libs/LoggerHelper');
const resposeObject = require('../libs/response');
global.fetch = require('node-fetch')

class CognitoHelper {
    constructor() {
        this.poolData = { "UserPoolId": config.UserPoolId, "ClientId":config.ClientId };
        this.userPool = new ACI.CognitoUserPool(this.poolData);
    }
    resendConfirmationCode(username, password, req){
        try{
			let userData = {
				Username : username,
				Pool : this.userPool
            };
            let cognitoUser = new ACI.CognitoUser(userData);
            return new Promise(function(resolve) {
                let ro = new resposeObject();
                cognitoUser.resendConfirmationCode(function(err, result) {
                    if (err) {
                        Logger.broadcast("error", "CognitoHelper -> resendConfirmationCode - fail resend! : " + CircularJSON.stringify(err));
                        ro.message = CircularJSON.stringify(err);
						return resolve(ro);
                    }
                    ro.data = {"Result is" : CircularJSON.stringify(result)};
					ro.status = 200;
					ro.message = "Confirmation code successfully resend";	
                    Logger.broadcast("info", "CognitoHelper -> resendConfirmationCode - successfully! : " + CircularJSON.stringify(result));
                    resolve(ro);
                });
			}.bind(this));
        }catch(ex){
            Logger.broadcast("error", "CognitoHelper -> resendConfirmationCode - general error! : " + CircularJSON.stringify(ex));
            let ro = new resposeObject();
			ro.message = CircularJSON.stringify(ex);
			return ro;
        }
    }
    
}

exports.handler = async (event, context) => {
    let CH = new CognitoHelper();
    let lo = await CH.resendConfirmationCode(event.username,event.password, context);
    return lo;
};


