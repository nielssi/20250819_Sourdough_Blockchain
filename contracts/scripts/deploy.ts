import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Factory = await ethers.getContractFactory("SourdoughRegistry");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  const addr = await contract.getAddress();

  console.log("SourdoughRegistry deployed to:", addr);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
