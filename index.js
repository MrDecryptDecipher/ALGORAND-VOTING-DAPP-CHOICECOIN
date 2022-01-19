// all examples are portrayed using es6;

const algosdk = require('algosdk'); //importing algosdk
const prompt = require('prompt-sync')(); //importing nodeJs  prompt to enable prompt in a nodeJs environment

// open a purestaker api and get a unique API KEY
const server = "https://testnet-algorand.api.purestake.io/ps2";
const port = "";
const token = {
  "X-API-Key": "z6H94GE3sI8w100S7MyY92YMK5WIPAmD6YksRDsC" //your API key gotten from purestake API, 
};
const algodClient = new algosdk.Algodv2(token, server, port); //connecting to algodclient

// create a testnet account with myalgowallet, keep the mmemonic key;
const mnemonic = 'exact sphere faith index property material trim trend bulk pelican whisper cancel wheel coffee slender high beyond humble entire unknown cattle property lens able guilt'; //the mmemonic 25 characters seperated by a whitespace should be imported here

// get account from mmemonic key;
const recoveredAccount = algosdk.mnemonicToSecretKey(mnemonic); 

//choice coin asset ID 
const ASSET_ID = 21364625

// voting address
const voting_address = 'JJT4MJLJPNEWPO3B4DDTXP34B2DOVLIRY5O456M4T2I2RZUVWOC2ZCUSMQ' //input a voting address wallet you can send choice to, make sure choice is opt-in to receive votes

//Press '1' to vote for candidate 'one' and '0' to vote for candidate 'Zero"
const chooseVotingOption = async () => {
    const candidateOption = prompt("Press 0 for candidate Zero or Press 1 for candidate One:") //please vote for a candidate
     const amount = prompt("Please enter Amount to commit to voting:");


    const params =  await algodClient.getTransactionParams().do(); //get params
    const encoder = new TextEncoder();  //message encoder

    // if there is no valid option 
     if (!(candidateOption)) {
         console.log('Please select a valid candidate option');
     } else if (!Number(amount)) {
         console.log("Please Enter A valid Choice token amount to vote")
     }
     // if your option is candidate zero
      else  if (candidateOption == "0") {
            try {
                let txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
                    recoveredAccount.addr,
                    voting_address,
                    undefined,
                    undefined,
                    Number(amount),
                    encoder.encode("Voting with Choice coin"),
                    ASSET_ID,
                    params

                )

            let signedTxn = txn.signTxn(recoveredAccount.sk);
            const response =  await algodClient.sendRawTransaction(signedTxn).do();
         console.log(`You just voted for candidate Zero,Your voting ID: ${response.txId}`);
        }
        catch(error) {
            console.log("error voting for candidate Zero, Try again later");
        }
        
 } 
 // if your option is candidate one

 else  if(candidateOption == "1"){
    try {
        let txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
            recoveredAccount.addr,
            voting_address,
            undefined,
            undefined,
            amount,
            encoder.encode("Voting with Choice coin"),
            ASSET_ID,
            params
        )
    let signedTxn = algosdk.signTransaction(txn, recoveredAccount.sk);
    const response =  algodClient.sendRawTransaction(signedTxn.blob).do();
    console.log(`You just voted for candidate One,Your voting ID: ${response.txId}`);
    }
    catch(error) {
        console.log("Error voting for candidate One, Try again later");
    }

    }
    }

chooseVotingOption();

//verification function
const waitForConfirmation = async function (algodClient, txId) {
    let lastround = (await algodClient.status().do())['last-round'];
     while (true) {
        const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
        if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
          //Got the completed Transaction
          console.log('Transaction confirmed in round ' + pendingInfo['confirmed-round']);
          break;
        }
        lastround++;
        await algodClient.statusAfterBlock(lastround).do();
     }
 };
 

// check account balance
const checkResult = async () => {
    
    
  //get the account information
    const accountInfo =  await algodClient.accountInformation(recoveredAccount.addr).do();
    const assets =  accountInfo["assets"];
    
    //get choice amount from assets
     assets.map(asset => {
        if (asset['asset-id'] === ASSET_ID) {
            const amount = asset["amount"];
            const formattedAmount = amount / 100;
            console.log(
                `Account ${recoveredAccount.addr} has ${formattedAmount} $choice`
              );
              return;
        }  else {
            console.log(`Account ${recoveredAccount.addr} must opt in to Choice Coin Asset ID ${ASSET_ID}`);
          }
     })
      
        
    
        

    
    

  };

checkResult();