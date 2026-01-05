import { createWalletClient, custom, createPublicClient, parseEther, defineChain, formatEther } from "https://esm.sh/viem";
import { contractAddress, coffeeAbi } from "./constants-js.js";

const connectButton = document.getElementById('connectButton');
const fundButton = document.getElementById('fundButton'); // Fixed variable name spelling
const ethAmountInput = document.getElementById('ethAmount');
const balanceButton = document.getElementById('balanceButton');
const withdrawButton = document.getElementById('withdrawButton');

let walletClient;
let publicClient;

async function connect() {
    if (typeof window.ethereum != "undefined") {
        walletClient = createWalletClient({
            transport: custom(window.ethereum)
        });
        await walletClient.requestAddresses();
        connectButton.innerHTML = "Connected";
        alert("Wallet Connected Successfully!"); // Added visual feedback
    } else {
        connectButton.innerHTML = "Please install MetaMask";
        alert("Please install MetaMask to use this feature.");
    }
}

async function withdraw() {
    if (typeof window.ethereum != "undefined") {
        console.log("Initiating withdraw...");
        walletClient = createWalletClient({
            transport: custom(window.ethereum)
        });
        const [connectedAccount] = await walletClient.requestAddresses();
        const currentChain = await getCurrentChain(walletClient);
        publicClient = createPublicClient({
            transport: custom(window.ethereum)
        });
        
        try {
            const { request } = await publicClient.simulateContract({
                address: contractAddress,
                abi: coffeeAbi,
                functionName: 'withdraw',
                account: connectedAccount,
                chain: currentChain
            });
            const hash = await walletClient.writeContract(request);
            console.log(hash);
            alert("Withdraw transaction sent! Hash: " + hash);
        } catch (error) {
            console.error(error);
            alert("Withdraw failed: " + error.message);
        }
    } else {
        connectButton.innerHTML = "Please install MetaMask";
    }
}

async function fund() {
    const ethAmount = ethAmountInput.value;
    if (!ethAmount) {
        alert("Please enter an ETH amount.");
        return;
    }

    if (typeof window.ethereum != "undefined") {
        console.log("Initiating fund...");
        walletClient = createWalletClient({
            transport: custom(window.ethereum)
        });
        const [connectedAccount] = await walletClient.requestAddresses();
        const currentChain = await getCurrentChain(walletClient);
        publicClient = createPublicClient({
            transport: custom(window.ethereum)
        });

        try {
            const { request } = await publicClient.simulateContract({
                address: contractAddress,
                abi: coffeeAbi,
                functionName: 'fund',
                account: connectedAccount,
                chain: currentChain,
                value: parseEther(ethAmount)
            });
            const hash = await walletClient.writeContract(request);
            console.log(hash);
            alert("Fund transaction sent! Hash: " + hash);
        } catch (error) {
            console.error(error);
            alert("Funding failed: " + error.message);
        }
    } else {
        connectButton.innerHTML = "Please install MetaMask";
    }
}

async function getCurrentChain(client) {
    const chainId = await client.getChainId();
    const currentChain = defineChain({
        id: chainId,
        name: "Custom Chain",
        nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
        },
        rpcUrls: {
            default: {
                http: ["http://localhost:8545"],
            },
        },
    });
    return currentChain;
}

async function getbalance() {
    if (typeof window.ethereum != "undefined") {
        publicClient = createPublicClient({
            transport: custom(window.ethereum)
        });
        try {
            const balance = await publicClient.getBalance({
                address: contractAddress
            });
            const formattedBalance = formatEther(balance);
            console.log(formattedBalance);
            alert(`Contract Balance: ${formattedBalance} ETH`);
        } catch (error) {
            console.error(error);
            alert("Failed to get balance. Check console for details.");
        }
    }
}

// Event Listeners
connectButton.onclick = connect;
fundButton.onclick = fund; // Updated variable name
balanceButton.onclick = getbalance;
withdrawButton.onclick = withdraw;