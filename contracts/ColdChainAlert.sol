// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
interface IRoleManager {
    function getBatchTempRange(string calldata batchId) external view returns (int, int);
    function recordEvent(address reporter,
            string calldata batchId, string calldata eventType, string calldata metadata) external;
}
contract ColdChainAlert {
    address public roleManager;

    struct Violation {
        string batchId;
        uint timestamp;
        int temperature;
        address reporter;
    }

    Violation[] public violations;

    event TemperatureViolation(string batchId, uint timestamp, int temperature, address indexed reporter);

    constructor(address _roleManager) {
        roleManager = _roleManager;
    }

    function reportTemperature(string memory batchId, int temperature) public {
        uint currentTime = block.timestamp;
        (int min, int max) = IRoleManager(roleManager).getBatchTempRange(batchId);

        if (temperature < min || temperature > max) {
            violations.push(Violation(batchId, currentTime, temperature, msg.sender));
            emit TemperatureViolation(batchId, currentTime, temperature, msg.sender);

            // ✅ Apply RoleManager 
            string memory metadata = string(abi.encodePacked("Temperature = ", _intToString(temperature), "C"));
            IRoleManager(roleManager).recordEvent(msg.sender, batchId, "TemperatureViolation", metadata);
        }
    }

    function getViolation(uint index) public view returns (string memory, uint, int, address) {
        Violation memory v = violations[index];
        return (v.batchId, v.timestamp, v.temperature, v.reporter);
    }

    function getTotalViolations() public view returns (uint) {
        return violations.length;
    }
    
    function _intToString(int v) internal pure returns (string memory) {
        if (v == 0) {
            return "0";
        }

        bool negative = v < 0;
        uint abs = uint(negative ? -v : v);

        bytes memory reversed = new bytes(100);
        uint i = 0;
        while (abs != 0) {
            reversed[i++] = bytes1(uint8(48 + abs % 10));
            abs /= 10;
        }

        if (negative) {
            reversed[i++] = "-";
        }

        bytes memory s = new bytes(i);
        for (uint j = 0; j < i; j++) {
            s[j] = reversed[i - 1 - j];
        }

        return string(s);
    }
}
