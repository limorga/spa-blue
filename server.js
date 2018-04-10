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
var fs = require('fs');


var solc = require('solc');
var Web3 = require('web3');

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


var web3;

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
         var myContractCode = customizeContract(templateContract, coin.name, coin.symbol, coin.supply, coin.decimal);
         var myCompiledContract = compileContract(myContractCode);
         
         coin.contract = myCompiledContract;
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
  
  var contractName = removeWhiteSpace(tokenName);
  var newContract = templateContract;
  
  newContract = newContract.replace("<MY_TOKEN_NAME>", tokenName);
  newContract = newContract.replace("<MY_TOKEN_SYMBOL>", tokenSymbol);
  newContract = newContract.replace("<MY_TOTAL_SUPPLY>", tokenTotalSupply);
  newContract = newContract.replace("<MY_DECIMAL_PLACES>", tokenDecimalPlaces);
  newContract = newContract.replace("<MY_TOKEN_CONTRACT_NAME>", contractName);
  newContract = newContract.replace("<MY_TOKEN_CONTRACT_NAME>", contractName);
    
  return newContract;
}

// gets a string and returns a string without any whitespaces
function removeWhiteSpace(str) {
  return str.replace(/\s/g, "");
}

function readContractTemplate() {
  return templateContract = fs.readFileSync('contract_template.sol', 'utf8');
}

function readERC20Contract() {
  return templateContract = fs.readFileSync('ERC20.sol', 'utf8');  
}

function validateWeb3() {
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("wss://mainnet.infura.io/ws"));
  }
}

function compileContract(contractCode) {

  var ERC20Contract = readERC20Contract();

  var input = {
    'ERC20.sol': ERC20Contract,
    'my_contract.sol': contractCode 
  }

  var output = solc.compile({ sources: input }, 1); // 1 activates the optimiser
  
  // find the user contract name which is: 'my_contract.sol:<user-token-name>'
  var myCompiledContractName;
  for (var contractName in output.contracts) {
    if(contractName.startsWith('my_contract')) {
      myCompiledContractName = contractName;
    }
  }
  
  // retrieving the compiled contract from the array of all contracts
  var myCompiledContract = output.contracts[myCompiledContractName];
  return myCompiledContract;

  //const bytecode = myCompiledContract.bytecode;
  //const abi = JSON.parse(myCompiledContract.interface);

  //validateWeb3();
  //let gasEstimate = web3.eth.estimateGas({data: bytecode});
  //let myContract = web3.eth.Contract(abi);

  //console.log("END.....");
}