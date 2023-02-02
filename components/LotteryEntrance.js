// Have a function to enter the lottery
import { useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import backEndConfig from "../helpers/backEndConfig.json"
import { useMoralis } from "react-moralis"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { isWeb3Enabled } = useMoralis()
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: enterLottery,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: JSON.parse(backEndConfig.ABI), // this never change at all even on a different network
        contractAddress: backEndConfig.CONTRACT_ADDRESS,
        functionName: "enterLottery",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: JSON.parse(backEndConfig.ABI), // this never change at all even on a different network
        contractAddress: backEndConfig.CONTRACT_ADDRESS,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: JSON.parse(backEndConfig.ABI), // this never change at all even on a different network
        contractAddress: backEndConfig.CONTRACT_ADDRESS,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: JSON.parse(backEndConfig.ABI), // this never change at all even on a different network
        contractAddress: backEndConfig.CONTRACT_ADDRESS,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayerFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = (await getRecentWinner()).toString()
        setEntranceFee(entranceFeeFromCall)
        setNumPlayers(numPlayerFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async (tx) => {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div>
            {backEndConfig.CONTRACT_ADDRESS ? (
                <div>
                    <div>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                            onClick={async function () {
                                await enterLottery({
                                    onSuccess: handleSuccess,
                                    onError: (e) => console.log(e),
                                })
                            }}
                            disabled={isLoading || isFetching}
                        >
                            {isLoading || isFetching ? (
                                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                            ) : (
                                <div>Enter Lottery</div>
                            )}
                        </button>
                    </div>
                    <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee)} ETH</div>
                    <div>Number of Players: {numPlayers}</div>
                    <div>Recent Winner: {recentWinner}</div>
                </div>

            ) : (
                <div>No Lottery Address Detected</div>
            )}
        </div>
    )
}
