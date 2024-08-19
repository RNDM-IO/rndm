import { expect } from "chai";
import { ethers } from "hardhat";
import { Operatable, Operatable__factory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Operatable", function () {
  let Operatable: Operatable__factory;
  let operatable: Operatable;
  let owner: SignerWithAddress;
  let operator: SignerWithAddress;
  let nonOperator: SignerWithAddress;

  beforeEach(async function () {
    [owner, operator, nonOperator] = await ethers.getSigners();
    Operatable = (await ethers.getContractFactory(
      "Operatable"
    )) as Operatable__factory;
    operatable = await Operatable.deploy(owner.address);
    await operatable.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await operatable.owner()).to.equal(owner.address);
    });
  });

  describe("setOperator", function () {
    it("Should allow owner to set an operator", async function () {
      await expect(operatable.setOperator(operator.address, true))
        .to.emit(operatable, "OperatorChanged")
        .withArgs(operator.address, true);

      expect(await operatable.operators(operator.address)).to.be.true;
    });

    it("Should allow owner to remove an operator", async function () {
      await operatable.setOperator(operator.address, true);
      await expect(operatable.setOperator(operator.address, false))
        .to.emit(operatable, "OperatorChanged")
        .withArgs(operator.address, false);

      expect(await operatable.operators(operator.address)).to.be.false;
    });

    it("Should not allow non-owner to set an operator", async function () {
      await expect(
        operatable.connect(nonOperator).setOperator(operator.address, true)
      ).to.be.revertedWithCustomError(operatable, "OwnableUnauthorizedAccount");
    });
  });
});
