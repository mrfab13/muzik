const base64 = require('base-64');
const crypto = require ('crypto');
const config = require("./config.json");

 // PRIVATE SCOPE

function SanitizeBase64(inputText)
{
    //Replacing to be done as otherwise our b64 will not be friendly
    //https://tools.ietf.org/html/rfc7515#section-2
    inputText = inputText.replace(/[=+/]/g, character =>{
        switch (character) 
        {
            case '=':
                return '';
            case '+':
                return '-';
            case '/':
                return '_';
        }
    });
    
    return inputText;
}

// Converts our data to a JSON and b64 to be used in a JWT
function ConvertAndFilterText(inputText)
{
    inputText = JSON.stringify(inputText);
    inputText = base64.encode(inputText);
    inputText = SanitizeBase64(inputText);
    return inputText;
}

// Used to sign the JWT
function createSignature(header, payload)
{
    // Create a Hash Based Message Authentication code using sha256
    let signature = crypto.createHmac('sha256', config.securitySecret);
    
    // Hash the signature which the joining '.' added before hand
    signature.update(header + '.' + payload);
    
    // Convert to base64 using digest for better sec
    signature = signature.digest('base64');
    
    // Clean base64 chars
    signature = SanitizeBase64(signature);

    return signature
}

 // PUBLIC SCOPE

module.exports = {
    
GenerateJWT: function (inUsername, inUserId, inIsAdmin)
{
    var JWTCookieData =
    {
        JWTData: "",
        expiryDate: 0,
    };

    // Generate Expiry Date 12 hours in future
    JWTCookieData.expiryDate = Date.now() + (12 * 60 * 60 * 10000);

    // JWT Header 
    const header = ConvertAndFilterText({
        alg: 'HS256',
        typ: 'JWT',
    });

    // JWT Payload
    const payload = ConvertAndFilterText({
        username: inUsername,
        userId: inUserId,
        exp: JWTCookieData.expiryDate, // token expriary date in milliseconds
        isAdmin : inIsAdmin,
    })

    // Create signture
    const signture = createSignature(header, payload);

    // Craft JWT
    JWTCookieData.JWTData = header + '.' + payload + '.' + signture;

    return JWTCookieData;
}

};