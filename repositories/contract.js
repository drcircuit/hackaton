// Repository for contract interactions
const BigNumber = require('bignumber.js');
const fs = require("fs");
const solc = require('solc')


module.exports = (web3, public, pass) => {
    const createSet = {from: public, gas: 750000, gasPrice: "50000000000"}
    web3.eth.defaultAccount = public;

    // On first load we read in the solidity contract and complie it, do this sync. so we do not
    // start before we know that it works
    let source = fs.readFileSync('./contract/contract.sol', 'utf8');
    let compiledContract = solc.compile(source, 1);
    let abi = JSON.parse(compiledContract.contracts[':Project'].interface);
    let bin = compiledContract.contracts[':Project'].bytecode;

    console.log("contract has been compiled")
    console.log(JSON.stringify(abi))

    // Get the contract, note that this will take a long time to time
    // out if the contract does not exist...
    function getContract(adr) {
        let contract = new web3.eth.Contract(abi, createSet);
            
        //let check = 
    }

    return {
        // Create a new contract for a fund raising
        createContract: (recOrg, goal, duration, reclaimPeriod) => {
            return new Promise((ok, err) => {
            let findC
            let i = 0
            findC = (th) => {
                web3.eth.getTransactionReceipt(th)
                .then(v => {
                    if(!v) {
                        i++
                        console.log("testing", i)
                        if(i>600) {
                            err("timeout from ntlbs code")
                            return
                        }
                        setTimeout(() => findC(th), 100);
                        return
                    }
                    let adr = v.contractAddress
                    ok(adr)
                })
            }

            let contract = new web3.eth.Contract(abi, createSet);
            let args = [recOrg, goal, duration, reclaimPeriod]
            contract.deploy({
                data: "0x"+bin,
                arguments: args
            })
            .send(createSet)
            .on('error', e => {
                console.error("my error", e)
            })
            .on('transactionHash', function(transactionHash){
                console.log("th", transactionHash)
                findC(transactionHash)
                // kick of a loop where we keep waiting for the contract adr and
                // then return that
            })
            /*.on('receipt', function(receipt){
               console.log("rec", receipt.contractAddress) // contains the new contract address
            })
            .on('confirmation', function(confirmationNumber, receipt){ console.log("conf", confirmationNumber) }) 
            .then(function(newContractInstance){
                console.log("then",newContractInstance.options.address) // instance with the new contract address
            });
            */
        })
        },
        // Transfer from our account into the desired one
        transfer: (amount, to) => {
            
        },
        // Get the current status of the contract and return it as a promiss object
        getStatus: (adr) => {
            let contract = new web3.eth.Contract(abi, adr, createSet);
            let arr = [
                contract.methods.recOrg().call(createSet),
                contract.methods.goal().call(createSet),
                contract.methods.raised().call(createSet),
                contract.methods.deadline().call(createSet),
                contract.methods.reclaimDeadline().call(createSet),
                contract.methods.created().call(createSet)
            ]
            return Promise.all(arr)
                .then(a => {
                    return {
                        recOrg: a[0],
                        goal: a[1],
                        raised: a[2],
                        deadline: a[3],
                        reclaimDeadline: a[4],
                        created: a[5],
                    }
                })
        },
        // event Funding(address backer, uint amount, uint id);
        // Figure out a list of all the funders of this project and return
        getFunders: (adr) => {
            let contract = new web3.eth.Contract(abi, adr, createSet);
            return contract.getPastEvents('Funding',{fromBlock: 0,
                toBlock: 'latest'})
                .then(e => {
                    console.log("evs", e)
                    return e.map(e => {
                        return {
                            from: e.returnValues.backer,
                            amount: e.returnValues.amount,
                            id: e.returnValues.myid,
                        }
                    })
                })
        }
    }
}