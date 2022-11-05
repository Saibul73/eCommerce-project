const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid  = process.env.TWILO_SERVICE_ID;
const client = require('twilio')(accountSid,authToken,serviceSid)

module.exports ={
    doSms:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let res={}
            await client.verify.services(serviceSid).verifications.create({
                to :`+91${userData.phone_number}`,
                channel:"sms"
            }).then((reeee)=>{
                res.valid=true;
                resolve(res);
            }).catch((err)=>{
                console.log(err);

            })
        
        })
    },
    otpVerify:(otpData,userData)=>{
        console.log(otpData);
      console.log(userData.phone_number); 
     
      return new Promise(async(resolve,reject)=>{
          await client.verify.services(serviceSid).verificationChecks.create({
              to: `+91${userData.phone_number}`,
              code: otpData
          }).then((verifications) => {
              console.log(verifications);
              resolve(verifications.valid)
          });
      })
  }
}