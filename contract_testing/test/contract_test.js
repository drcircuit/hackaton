var Project = artifacts.require('./Project.sol');
contract('Project', function(accounts) {
  it("should assert true", function(done) {
    Project.deployed().then(function(instance){
    	console.log("Project.deployed()");
    	var result = instance.recOrg.call();
    	result.then(function(res){
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

						var raised2 = instance.raised.call();
				    	raised2.then(function(res){
			    			console.log("raised2: " + res);

			    		})
						.then(done);
					});
	    		});
    		});
    	})
    	return result;

    })
    .catch (console.error)
  });
});