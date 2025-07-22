// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RoleManager {
    enum Role { NONE, FARMER, INSPECTOR, TRANSPORTER }

    struct BatchEvent {
        string eventType;
        string metadata;
        uint timestamp;
        Role actorRole;
        address actor;
    }

    mapping(address => Role) public roles;
    mapping(string => bool) public batches;
    mapping(string => BatchEvent[]) public batchEvents;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can perform this");
        _;
    }

    modifier onlyRole(Role r) {
        require(roles[msg.sender] == r, "Access denied for this role");
        _;
    }

    modifier onlyValidBatch(string memory batchId) {
        require(batches[batchId], "Batch does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerActor(address user, Role role) public onlyOwner {
        require(role != Role.NONE, "Cannot assign NONE role");
        roles[user] = role;
    }

    function getRole(address user) public view returns (Role) {
        return roles[user];
    }

    function registerBatch(string memory batchId) public onlyRole(Role.FARMER) {
        require(!batches[batchId], "Batch already exists");
        batches[batchId] = true;
    }

    function recordEvent(string memory batchId, string memory eventType, string memory metadata)
        public onlyValidBatch(batchId)
    {
        Role senderRole = roles[msg.sender];
        require(senderRole == Role.FARMER || senderRole == Role.INSPECTOR || senderRole == Role.TRANSPORTER,
            "Only authorized roles can record events");

        batchEvents[batchId].push(BatchEvent({
            eventType: eventType,
            metadata: metadata,
            timestamp: block.timestamp,
            actorRole: senderRole,
            actor: msg.sender
        }));
    }

    function getEvents(string memory batchId) public view onlyValidBatch(batchId) returns (BatchEvent[] memory) {
        return batchEvents[batchId];
    }
}