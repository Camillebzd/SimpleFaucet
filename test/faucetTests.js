const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('Faucet', function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployContractAndSetVariables() {
        const Faucet = await ethers.getContractFactory('Faucet');
        const faucet = await Faucet.deploy();
        let withdrawAmount = ethers.utils.parseUnits("1", "ether");

        const [owner, addr1] = await ethers.getSigners();

        console.log('Signer 1 address: ', owner.address);
        return { faucet, owner, withdrawAmount, addr1 };
    }

    it('should deploy and set the owner correctly', async function () {
        const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

        expect(await faucet.owner()).to.equal(owner.address);
    });

    it('should not allow to ask for more than .1 ETH', async function () {
        const { faucet, withdrawAmount } = await loadFixture(deployContractAndSetVariables);

        await expect(faucet.withdraw(withdrawAmount)).to.be.reverted;
    });

    it('should allow only the owner to call it', async function () {
        const { faucet, addr1, owner } = await loadFixture(deployContractAndSetVariables);

        await expect(faucet.connect(addr1).withdrawAll()).to.be.reverted;
    });

    it('should just not exist anymore after destruction!!!!', async function () {
        const { faucet } = await loadFixture(deployContractAndSetVariables);

        await faucet.destroyFaucet();
        expect(await ethers.provider.getCode(faucet.address)).to.be.equal("0x");
    });

    it('should withdraw all the found correctly', async function () {
        const { faucet, addr1 } = await loadFixture(deployContractAndSetVariables);

        await faucet.withdrawAll();
        await expect(faucet.withdraw(100)).to.be.reverted;
    });
});