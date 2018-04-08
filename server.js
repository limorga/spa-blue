//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
// LIMORRRRRR
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var coins = [];
var messages = [];
var sockets = [];

io.on('connection', function (socket) {
    coins.forEach(function (data) {
      socket.emit('newCoin', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    
    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      console.log("socket.on. text is:", text );
      
      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };

        console.log("socket.on. name is:", name );
        
        broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
    
    socket.on('newCoin', function(coin) {
         console.log("newCoin event, coin data: ", coin);
         
         var templateContract = readContractTemplate();
         var newContractCode = customizeContract(templateContract, coin.name, coin.symbol, coin.supply, coin.decimal);
         
         coin.contract = newContractCode;
         coins.push(coin);
         
         socket.emit('newCoin', coin);
         //broadcast('message', coinName);
    });
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      console.log("updateRoster names:", names );
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    console.log("Broadcast data:", data );
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});


function customizeContract(templateContract, tokenName, tokenSymbol, tokenTotalSupply, tokenDecimalPlaces) {
  
  console.log("customizeContract");
  
  compileContractTest();
  
  var contractName = removeWhiteSpace(tokenName);
  
  //console.log("contractName is:" , contractName);

  var newContract = templateContract;
  
  newContract = newContract.replace("<MY_TOKEN_NAME>", tokenName);
  newContract = newContract.replace("<MY_TOKEN_SYMBOL>", tokenSymbol);
  newContract = newContract.replace("<MY_TOTAL_SUPPLY>", tokenTotalSupply);
  newContract = newContract.replace("<MY_DECIMAL_PLACES>", tokenDecimalPlaces);
  newContract = newContract.replace("<MY_TOKEN_CONTRACT_NAME>", contractName);
  newContract = newContract.replace("<MY_TOKEN_CONTRACT_NAME>", contractName);
  
  //console.log("newContract is:" , newContract);
  
  return newContract;
}

// gets a string and returns a string without any whitespaces
function removeWhiteSpace(str) {
  return str.replace(/\s/g, "");
}

function readContractTemplate() {
  
  var fs = require('fs');
  return templateContract = fs.readFileSync('contract_template.sol', 'utf8');
  
}



function compileContractTest() {

  console.log("LIMOR1");
  var solc = require('solc');
  console.log("LIMOR2");

  var input = "contract x { function g() {} }";
  var output = solc.compile(input, 1); // 1 activates the optimiser
  
    console.log("LIMOR3, output: ", output);

  for (var contractName in output.contracts) {
      // code and ABI that are needed by web3
      console.log("LIMOR4", contractName + ': ' + output.contracts[contractName].bytecode);
      console.log("LIMOR5", contractName + '; ' + JSON.parse( output.contracts[contractName].interface));
  }

}

function compileContract(contractCode) {
  console.log("111");
  
  const fs = require("fs");
  console.log("222");
  const solc = require('solc');
  console.log("333");
  let Web3 = require('web3');
  console.log("444");
  
  let web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
  
  
  let compiledContract = solc.compile(contractCode, 1);
  
  console.log("222");
}
  
