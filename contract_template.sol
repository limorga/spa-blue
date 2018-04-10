pragma solidity ^0.4.11;

import "./ERC20.sol";

 contract <MY_TOKEN_CONTRACT_NAME> is ERC20Interface {


    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;
    uint256 public totalSupply;
    
    string public name;                   //fancy name: eg Simon Bucks
    uint8 public decimals;                //How many decimals to show. ie. There could 1000 base units with 3 decimals. Meaning 0.980 SBX = 980 base units. It's like comparing 1 wei to 1 ether.
    string public symbol;                 //An identifier: eg SBX


    function <MY_TOKEN_CONTRACT_NAME>() {
    
        totalSupply = <MY_TOTAL_SUPPLY>;                        // Update total supply (100000 for example)
        balances[msg.sender] = totalSupply;               // Give the creator all initial tokens (100000 for example)
        name = "<MY_TOKEN_NAME>";                               // Set the name for display purposes
        decimals = <MY_DECIMAL_PLACES>;                         // Amount of decimals for display purposes
        symbol = "<MY_TOKEN_SYMBOL>";                           // Set the symbol for display purposes

    }
    
    function totalSupply() public constant returns (uint) {
        return totalSupply;
    }
    
    function transfer(address _to, uint256 _value) returns (bool success) {
        
        //Default assumes totalSupply can't be over max (2^256 - 1).
        //If your token leaves out totalSupply and can issue more tokens as time goes on, you need to check if it doesn't wrap.
        //Replace the if with this one instead.
        //if (balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        if (balances[msg.sender] >= _value && _value > 0) {
            balances[msg.sender] -= _value;
            balances[_to] += _value;
            Transfer(msg.sender, _to, _value);
            return true;
        } else { return false; }
    }

    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
        //same as above. Replace this line with the following if you want to protect against wrapping uints.
        //if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && _value > 0) {
            balances[_to] += _value;
            balances[_from] -= _value;
            allowed[_from][msg.sender] -= _value;
            Transfer(_from, _to, _value);
            return true;
        } else { return false; }
    }

    function balanceOf(address _owner) constant returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
      return allowed[_owner][_spender];
    }
}
