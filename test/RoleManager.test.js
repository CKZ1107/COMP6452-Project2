const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RoleManager", function () {
  let RoleManager, roleManager;
  let owner, farmer, inspector, transporter, attacker;

  beforeEach(async function () {
    [owner, farmer, inspector, transporter, attacker] = await ethers.getSigners();
    RoleManager = await ethers.getContractFactory("RoleManager");
    roleManager = await RoleManager.deploy();
    await roleManager.waitForDeployment();
  });

  it("should allow owner to register actors with roles", async function () {
    await roleManager.registerActor(farmer.address, 1); // FARMER
    await roleManager.registerActor(inspector.address, 2); // INSPECTOR
    expect(await roleManager.getRole(farmer.address)).to.equal(1);
    expect(await roleManager.getRole(inspector.address)).to.equal(2);
  });

  it("should NOT allow non-owner to register actors", async function () {
    await expect(
      roleManager.connect(attacker).registerActor(transporter.address, 3)
    ).to.be.revertedWith("Only contract owner can perform this");
  });

  it("should allow FARMER to register a batch", async function () {
    await roleManager.registerActor(farmer.address, 1);
    await roleManager.connect(farmer).registerBatch("BATCH001", 5, 8);
    const batch1 = await roleManager.batches("BATCH001");
    expect(batch1.exists).to.equal(true);
    await roleManager.connect(farmer).registerBatch("BATCH002", 5, 8);
    const batch2 = await roleManager.batches("BATCH001");
    expect(batch2.exists).to.equal(true);
  });

  it("should NOT allow non-FARMER to register a batch", async function () {
    await roleManager.registerActor(inspector.address, 2);
    await expect(
      roleManager.connect(inspector).registerBatch("BATCH001", 5, 8)
    ).to.be.revertedWith("Access denied for this role");
  });

  it("should record valid events from FARMER and INSPECTOR", async function () {
    await roleManager.registerActor(farmer.address, 1);
    await roleManager.registerActor(inspector.address, 2);
    await roleManager.connect(farmer).registerBatch("BATCH001",5, 8);

    await roleManager.connect(farmer).recordEvent(farmer.address,"BATCH001", "Harvest", "Details");
    await roleManager.connect(inspector).recordEvent(inspector.address, "BATCH001", "Inspection", "Passed");

    const events = await roleManager.getEvents("BATCH001");
    expect(events.length).to.equal(2);
    expect(events[0].eventType).to.equal("Harvest");
    expect(events[1].eventType).to.equal("Inspection");
  });

  it("should NOT allow recording event for nonexistent batch", async function () {
    await roleManager.registerActor(farmer.address, 1);
    await expect(
      roleManager.connect(farmer).recordEvent(farmer.address, "NONEXISTENT", "Harvest", "Details")
    ).to.be.revertedWith("Batch does not exist");
  });

  it("should NOT allow actors with no role to record events", async function () {
    await roleManager.registerActor(farmer.address, 1);
    await roleManager.connect(farmer).registerBatch("BATCH001", 5, 8);

    await expect(
      roleManager.connect(attacker).recordEvent(attacker.address,  "BATCH001", "Tamper", "Hacked!")
    ).to.be.revertedWith("Only authorized roles can record events");
  });
});
