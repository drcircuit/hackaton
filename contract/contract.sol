pragma solidity ^0.4.16;

contract Project {
    // The organisation that should be recieving the money from this contract
    address public recOrg;
    // How much money we want to raise, in wei
    uint public goal;
    // How much money we have raised thus far
    uint public raised;
    // When is the deadline of this campaign
    uint public deadline;
    // Latest time when a user can re-claim there money before the org can claim it regardless
    uint public reclaimDeadline;
    // When this project was created
    uint public created;

    // Keep track of how much each sender has sent in
    mapping(address => uint256) public balance;
    // Keep track of the pledges made by "identified" individuals
    mapping(uint => uint256) public pledges;

    // If the goal has been reached or not
    bool reached = false;
    // If the contract is closed or not
    bool closed = false;

    event Reached(address recipient, uint totalraised);
    event Funding(address backer, uint amount, uint id);

    // Constructor for creating a new project
    function Project(
        address recOrg_,    // Address of the receiving organisation
        uint goal_,         // Funding goal in wei
        uint duration_,     // Duration in minutes the campaign should be active
        uint reclaimPeriod_) public 
    {
        recOrg = recOrg_;
        goal = goal_ * 1 wei;
        raised = 0;
        deadline = now + duration_ * 1 minutes;
        reclaimDeadline = deadline + reclaimPeriod_ * 1 minutes;
        created = now;
    }

    // Function to fund this project
    function fund(uint id) public payable {
        require(!reached);
        require(!closed);
        uint amount = msg.value;
        // Always add it to the generic info
        balance[msg.sender] += amount;
        raised += amount;
        if (id > 0) {
            pledges[id] += amount;
        }
        Funding(msg.sender, amount, id);
    }

    // Default function which we let be the same thing as
    // funding anonymously
    function () public payable {
        fund(0);
    }
    
    // Check if the goal has been reached or not
    function status() public {
        if (now >= deadline) {
            if (raised >= goal) {
                reached = true;
                Reached(recOrg, raised);
            }
            closed = true;
        }
    }


    // Try to withdraw money, which is allowed for no-one before the deadline
    // after the daedline if successfulle and after the deadline by sender if no
    // successful until the timeout when again the rec. can withdraw the funds.
    function withdraw() public {
        if (now >= deadline) {
            if (!reached) {
                if (now <= reclaimDeadline) {
                    // Double locking to prevent a recieving cotnract to drain it all
                    uint amount = balance[msg.sender];
                    balance[msg.sender] = 0;
                    if (amount > 0) {
                        if (!msg.sender.send(amount)) {
                            balance[msg.sender] = amount;
                        }
                    }
                } else {
                    // After the reclaim deadline so we should only send to the org
                    if (recOrg == msg.sender) {
                        if (recOrg.send(raised)) {

                        }
                    }
                }
            }

            if (reached && recOrg == msg.sender) {
                if (!recOrg.send(raised)) {
                    //If we fail to send the funds to recOrg, unlock funders balance, this
                    // should not happend but we have this as a safe-guard to we do not miss 
                    // something and end up in a deadlock
                    reached = false;
                }
            }
        }
    }
}
