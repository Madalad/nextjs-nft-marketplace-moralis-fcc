const Moralis = require("moralis/node")
require("dotenv").config()
const contractAddresses = require("./constants/networkMapping.json")

let chainId = process.env.chainId || 31337
const contractAddress = contractAddresses[chainId]["NftMarketplace"][0]

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
const appId = process.env.NEXT_PUBLIC_APP_ID
const masterKey = process.env.masterKey

async function main() {
    await Moralis.start({ serverUrl, appId, masterKey })
    console.log(`Working with contract address ${contractAddress}`)

    let itemListedOptions = {
        // Morlis understands the local chain is 1337
        chainId: moralisChainId,
        sync_historical: true,
        topic: "ItemListed(address,address,uint256,uint256)",
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "seller",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nftAddress",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "price",
                    type: "uint256",
                },
            ],
            name: "ItemListed",
            type: "event",
        },
        tableName: "ItemListed",
    }

    let itemBoughtOptions = {
        chainId: moralisChainId,
        sync_historical: true,
        topic: "ItemBought(address,address,uint256,uint256)",
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "buyer",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nftAddress",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "price",
                    type: "uint256",
                },
            ],
            name: "ItemBought",
            type: "event",
        },
        tableName: "ItemBought",
    }

    let listingCancelledOptions = {
        chainId: moralisChainId,
        address: contractAddress,
        topic: "ListingCancelled(address,address,uint256)",
        sync_historical: true,
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "seller",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nftAddress",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
            ],
            name: "ListingCancelled",
            type: "event",
        },
        tableName: "ListingCancelled",
    }

    const listedResponse = await Moralis.cloud.run("watchContractEvent", itemListedOptions, {
        useMasterKey: true,
    })
    const boughtResponse = await Moralis.cloud.run("watchContractEvent", itemBoughtOptions, {
        useMasterKey: true,
    })
    const cancelledResponse = await Moralis.cloud.run(
        "watchContractEvent",
        listingCancelledOptions,
        {
            useMasterKey: true,
        }
    )
    if (listedResponse.success && boughtResponse.success && cancelledResponse.success) {
        console.log("Success! Database updated with watching events")
    } else {
        console.log("Something went wrong...")
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
