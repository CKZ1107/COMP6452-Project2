// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
interface IRoleManager {
    function getBatchTempRange(string calldata batchId) external view returns (uint, uint);
    function recordEvent(address reporter,
            string calldata batchId, string calldata eventType, string calldata metadata) external;
}
contract ColdChainAlert {
    address public roleManager;

    struct Violation {
        string batchId;
        uint timestamp;
        uint temperature;
        address reporter;
    }

    Violation[] public violations;

    event TemperatureViolation(string batchId, uint timestamp, uint temperature, address indexed reporter);

    constructor(address _roleManager) {
        roleManager = _roleManager;
    }

    function reportTemperature(string memory batchId, uint temperature) public {
        uint currentTime = block.timestamp;
        (uint min, uint max) = IRoleManager(roleManager).getBatchTempRange(batchId);

        if (temperature < min || temperature > max) {
            violations.push(Violation(batchId, currentTime, temperature, msg.sender));
            emit TemperatureViolation(batchId, currentTime, temperature, msg.sender);

            // ✅ Apply RoleManager 
            string memory metadata = string(abi.encodePacked("Temperature = ", _uintToString(temperature), "C"));
            IRoleManager(roleManager).recordEvent(msg.sender, batchId, "TemperatureViolation", metadata);
        }
    }

    function getViolation(uint index) public view returns (string memory, uint, uint, address) {
        Violation memory v = violations[index];
        return (v.batchId, v.timestamp, v.temperature, v.reporter);
    }

    function getTotalViolations() public view returns (uint) {
        return violations.length;
    }
    function _uintToString(uint v) internal pure returns (string memory str) {
        if (v == 0) return "0";
        uint j = v;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (v != 0) {
            bstr[--k] = bytes1(uint8(48 + v % 10));
            v /= 10;
        }
        str = string(bstr);
    }
}
