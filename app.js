const express = require('express')
const request = require('request')
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const port = app.listen(process.env.PORT || 1124);
const _urlencoded = express.urlencoded({ extended: false })
app.use(cors())
app.use(express.json())
app.use(express.static('public'));
////---------Allow Access origin -----///

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "----REPLACE WITH HEROKU LINK----");
    res.header("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
  });




//routes
app.get('/', (req, res,next)=>{

res.status(200).send("Hello welcome to  Gospelview Mpesa API")

})

///----Access Token ---//
app.get('/access_token',access,(req,res)=>{
    res.status(200).json({access_token: req.access_token})

})


////-----Stk

///----Stk Push ---//

//..change to post -----
app.get('/stk', access, _urlencoded,function(req,res){


    //---Receive from user
    let _phoneNumber = req.body.phone
    let _Amount = req.body.amount
    


    let endpoint = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    let auth = "Bearer "+ req.access_token

    let _shortCode = '174379';
    let _passKey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
   


      
    const timeStamp = (new Date()).toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = 
    Buffer.from(`${_shortCode}${_passKey}${timeStamp}`).toString('base64');

    request(
        {
            url:endpoint,
            method:"POST",
            headers:{
                "Authorization": auth
            },
    
        json:{
    
                    "BusinessShortCode": "174379",
                    "Password": password,
                    "Timestamp": timeStamp,
                    "TransactionType": "CustomerPayBillOnline",
                    "Amount": "1",
                    "PartyA": "254746291229",
                    "PartyB": "174379", //PayBill  No.
                    "PhoneNumber": "254746291229",
                    "CallBackURL": "http://0c46cd5c20a7.ngrok.io/stk_callback",//----replace with heroku link
                    "AccountReference": "GospelView",
                    "TransactionDesc": "lipa na mpesa"

            }

        },
       (error,response,body)=>{

            if(error){

                
                console.log(error);
                res.status(404).json(error);

            }else{
                
                res.status(200).json(body);
                _checkoutRequestId2 = body.CheckoutRequestID;
                console.log(body);
                console.log(_checkoutRequestId2)
                

            }
               

        })

});



//-----Callback Url ----///
app.post('/stk_callback',_urlencoded,function(req,res,next){
   
    console.log('.......... STK Callback ..................');
    if(res.status(200)){

    
        //----Response Json ------ 
        res.json((req.body.Body.stkCallback.CallbackMetadata))
        console.log(req.body.Body.stkCallback.CallbackMetadata)

        if(Balance = req.body.Body.stkCallback.CallbackMetadata.Item[2].Name == 'Balance')
        {
            ///----Json breakdown ------
       //-----Response without fuliza------
        amount = req.body.Body.stkCallback.CallbackMetadata.Item[0].Value;
        transID = req.body.Body.stkCallback.CallbackMetadata.Item[1].Value;
        transNo = req.body.Body.stkCallback.CallbackMetadata.Item[4].Value;
        transdate = req.body.Body.stkCallback.CallbackMetadata.Item[3].Value;
        
       

        }else {
               ///----Json breakdown ------
            //-----Response for fuliza transaction------
            amount = req.body.Body.stkCallback.CallbackMetadata.Item[0].Value;
            transID = req.body.Body.stkCallback.CallbackMetadata.Item[1].Value;
            transNo = req.body.Body.stkCallback.CallbackMetadata.Item[3].Value;
            transdate = req.body.Body.stkCallback.CallbackMetadata.Item[2].Value;
            
            console.log("Amount",amount)
            console.log("Transaction",transID)///PPW24R456...
            console.log("Transaction",transNo)
            console.log("TransactionTime",transdate)
    
            
        }
        
       
        }else if(res.status(404)){
        res.json((req.body))
        console.log(req.body.Body);
    }
    next()

    })



///----STK QUERY ---
app.post('/stk/query',access,_urlencoded,function(req,res,next){

    let _checkoutRequestId = req.body.checkoutRequestId

    auth = "Bearer "+ req.access_token

    let endpoint =' https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query'
    const _shortCode = '4069571'
    const _passKey = '8e2d5d66120bfb538400be31f2fa885e90ef3acb5bc037454bbf23223fcb394a'
    const timeStamp = (new Date()).toISOString().replace(/[^0-9]/g, '').slice(0, -3)
    const password = Buffer.from(`${_shortCode}${_passKey}${timeStamp}`).toString('base64')
    

    request(
        {
            url:endpoint,
            method:"POST",
            headers:{
                "Authorization": auth
            },
           
        json:{
    
            'BusinessShortCode': _shortCode,
            'Password': password,
            'Timestamp': timeStamp,
            'CheckoutRequestID': _checkoutRequestId

            }

        },
        function(error,response,body){

            if(error){

                console.log(error);
                res.status(404).json(body);

            }else{
                res.status(200).json(body)
                console.log(body)
                next()
            }

        })

})











//....Function access token -----///
function access(res,req,next){

    let endpoint ="https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    let auth = new Buffer.from("lP4Iex4IhHIDPgVoMLRFG5CPoIzEUFZr:gtAXPZpmYxUp0Qkc").toString('base64');
    request(
    {
        url:endpoint,
        headers:{
            "Authorization": "Basic  " + auth
        }
    },
    (error,response,body)=>{

        if(error){
            console.log(error);
        }else{
            res.access_token = JSON.parse(body).access_token
            console.log(body)
            next()
        
        }
            
    }
    )


}

//------Listening to port -----
app.listen(port,(error)=>{

    if(error){
        
    }else{  
        console.log(`Server running on port http://localhost:${port}`)
    }
    
    });