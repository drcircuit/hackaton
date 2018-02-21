var Project = artifacts.require('./Project.sol');
contract('Project', function(accounts) {
  it("should assert true", function(done) {
    Project.deployed().then(function(instance){
    	console.log("Project.deployed()");
    	var recOrg = instance.recOrg.call();
    	recOrg.then(function(res){
    		console.log("recOrg: " + res);

	    	var goal = instance.goal.call();
	    	goal.then(function(res){
    			console.log("goal: " + res);

				var raised = instance.raised.call();
		    	raised.then(function(res){
	    			console.log("raised: " + res);

	    			var fund = instance.fund("0xAABBCCDDEE");
	    			fund.then(function(result){
	    				console.log("fund result: " + result.tx);

						// We can loop through result.logs to see if we triggered the Transfer event.
						for (var i = 0; i < result.logs.length; i++) {
						    var log = result.logs[i];
						    if (log.event == "Funding") {
						      // We found the event!
						      console.log("Found event: Funding");
						      break;
						    }
						  }
	    			});
	    		});
    		});
    	})
    	.then(done);

    	// console.log("recOrg: " + recOrg);


    });

    // console.log("Contract deployed");

    // contract.then(function(contract){
    //     console.log("project function(contract)");
    //     // result.then(console.log)
    //     var result1 = contract.fund(100);
    //     var result1 = contract.fund(200);
    //     result1.then(console.log)
    //     .then(function(result1){
    //     	var result = contract.raised.call();
    //     	console.log("Raised Value: ");
    //     	result.then(console.log)
    //     	.then(done);
    //     })
    //     //.then(() => console.log(contract.status()))
    // 	//.then(() => contract.fund(901))
    //     //.then(() => console.log(contract.status()))
    // 	//.then(done);
    // 	//return result;
    // })
    // .catch(console.error)
  });
});