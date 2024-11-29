process.env.ANCHOR_WALLET = "/Users/hakan/.config/solana/id.json"; // update path if necessary
process.env.ANCHOR_PROVIDER_URL = "https://api.devnet.solana.com";

const anchor = require("@coral-xyz/anchor");
const { AnchorError, Program } = require("@coral-xyz/anchor");
const assert = require("assert");
const { PublicKey, SystemProgram } =  require("@solana/web3.js");

const keyData = [
    190, 16, 114, 78, 140, 163, 246, 127, 209, 85, 237,
    34, 164, 43, 234, 111, 97, 252, 132, 176, 208, 12,
    221, 71, 151, 130, 190, 247, 105, 217, 156, 218, 47,
    130, 180, 75, 177, 160, 64, 116, 45, 202, 107, 74,
    202, 173, 99, 210, 34, 247, 208, 244, 231, 48, 37,
    173, 162, 182, 175, 220, 153, 154, 65, 4
];

// const keyData = [214,214,42,203,63,72,12,34,132,109,28,154,254,166,188,39,48,43,35,48,73,54,202,149,144,209,21,120,121,141,186,131,121,13,34,117,84,11,102,159,1,224,252,173,15,163,245,214,6,86,39,131,232,190,201,168,98,14,186,126,209,40,249,63];

(async () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.CounterProgram;
    // Define the public key of the account that will store the counter
    // const counter = anchor.web3.Keypair.fromSecretKey(new Uint8Array(keyData));
    const counter = anchor.web3.Keypair.generate();
    const user = provider.wallet;
    // console.log(provider)
    // Initialize the counter (if needed) and execute the increment instruction
    try {
        // Send transaction to increment
        await program.methods
            .initializeCounter()
            .accounts({
                counter: counter.publicKey,
                user: user.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([counter])
            .rpc();

        const account = await program.account.counter.fetch(counter.publicKey);
        console.log(account)


        // Send transaction to increment
        await program.methods
            .increment()
            .accounts({
                counter: counter.publicKey,
                user: user.publicKey,
            })
            .signers([user.payer]) // Ensure the program owner is the signer
            .rpc();
            
        await program.methods
            .closeCounter()
            .accounts({
                counter: counter.publicKey,
                user: user.publicKey,
                recipient: provider.wallet.publicKey, // The account receiving remaining lamports
            })
            .signers([user.payer]) // Ensure the program owner is the signer
            .rpc();
    } catch (error) {
        console.error("Error executing:", error);
    }
})();