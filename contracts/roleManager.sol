// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RoleManager {
    enum Role { NONE, FARMER, INSPECTOR, TRANSPORTER }

    struct Batch {
        bool exists;
        address owner;
        uint tempMin;
        uint tempMax;
    }

    struct BatchEvent {
        string eventType;
        string metadata;
        uint timestamp;
        Role actorRole;
        address actor;
    }

    mapping(address => Role) public roles;
    mapping(string => BatchEvent[]) public batchEvents;
    mapping(string => Batch) public batches;
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
        require(batches[batchId].exists, "Batch does not exist");
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

    function registerBatch(string memory batchId, uint tempMin, uint tempMax) public onlyRole(Role.FARMER) {
        require(!batches[batchId].exists, "Batch already exists");
        require(tempMin < tempMax, "Invalid temperature range");
        
        batches[batchId] = Batch({
            exists: true,
            owner: msg.sender,
            tempMin: tempMin,
            tempMax: tempMax
        });
    }

    function recordEvent(address reporter, string memory batchId, string memory eventType, string memory metadata)
        public onlyValidBatch(batchId)
    {
        Role senderRole = roles[reporter];
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

    function getBatchTempRange(string memory batchId) external view onlyValidBatch(batchId) returns (uint, uint) {
        Batch memory b = batches[batchId];
        return (b.tempMin, b.tempMax);
    }
}