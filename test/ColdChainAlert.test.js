const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("ColdChainAlert", function () {
  let roleManager, coldChainAlert;
  let RoleManager, ColdChainAlert;
  let deployer, farmer, inspector, outsider;

  beforeEach(async function () {
    [deployer, farmer, inspector, outsider] = await ethers.getSigners();

    RoleManager = await ethers.getContractFactory("RoleManager");
    roleManager = await RoleManager.deploy();
    await roleManager.waitForDeployment();

    await roleManager.registerActor(farmer.address, 1);     // FARMER
    await roleManager.registerActor(inspector.address, 2);  // INSPECTOR
    await roleManager.connect(farmer).registerBatch("BATCH001");

    ColdChainAlert = await ethers.getContractFactory("ColdChainAlert");
    coldChainAlert = await ColdChainAlert.deploy(await roleManager.getAddress());
    await coldChainAlert.waitForDeployment();
  });

  it("should store violation when temperature exceeds threshold", async function () {
    const tx = await coldChainAlert.connect(inspector).reportTemperature("BATCH001", 12);
    await tx.wait();

    const total = await coldChainAlert.getTotalViolations();
    expect(total).to.equal(1);

    const [batchId, timestamp, temperature, reporter] = await coldChainAlert.getViolation(0);

    expect(batchId).to.equal("BATCH001");
    expect(temperature).to.equal(12);
    expect(reporter).to.equal(inspector.address);

  });

  it("should NOT store violation when temperature is below threshold", async function () {
    const tx = await coldChainAlert.connect(inspector).reportTemperature("BATCH001", 6);
    await tx.wait();

    const total = await coldChainAlert.getTotalViolations();
    expect(total).to.equal(0);
  });

  it("should revert if batch does not exist in RoleManager", async function () {
    await expect(
      coldChainAlert.connect(inspector).reportTemperature("INVALID", 10)
    ).to.be.revertedWith("Batch does not exist");
  });

  it("should emit TemperatureViolation event", async function () {
    await expect(
      coldChainAlert.connect(inspector).reportTemperature("BATCH001", 15)
    ).to.emit(coldChainAlert, "TemperatureViolation")
      .withArgs("BATCH001", anyValue, 15, inspector.address);
  });
  it("should record multiple violations in order", async function () {
    await coldChainAlert.connect(inspector).reportTemperature("BATCH001", 12);
    await coldChainAlert.connect(inspector).reportTemperature("BATCH001", 14);
    await coldChainAlert.connect(inspector).reportTemperature("BATCH001", 10);
  
    const total = await coldChainAlert.getTotalViolations();
    expect(total).to.equal(3);
  
    const [batchId1, , temp1] = await coldChainAlert.getViolation(0);
    const [, , temp2] = await coldChainAlert.getViolation(1);
    const [, , temp3] = await coldChainAlert.getViolation(2);
  
    expect(batchId1).to.equal("BATCH001");
    expect(temp1).to.equal(12);
    expect(temp2).to.equal(14);
    expect(temp3).to.equal(10);
  });
  
});
