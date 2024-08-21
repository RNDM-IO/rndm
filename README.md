# RNDM

### RNDM 

We introduce RNDM Network: A new marketmaking primitive in DeFi enabling permissionless modular liquidity using AI. 
Our goal is to enable user to provision liquidity in any random token to generate volume thus enabling marketmaking on perp, spot or any CLOB.

This repo will provide the set of contracts as shown below. The exchanges and adaptors are shown as examples, this set of contracts will work with any EVM chain

RNDM is a network of intent centric smart contracts with our initial vision of an agent mempool
where each agent is connected via a router-adaptor delegation framework that aims to optimise the liquidity experience
in a decentralized and secure manner. 



### Contract Architecture

Specifically, users will express their preferences by selecting one of the available
agents, router contract will direct the agents to the correct adaptor which will execute it on the relevant exchange. This
architecture enables scalability to a network of decentralized agents in an agent mempool which can be routed offchain
via intents to the right exchange for execution by the agent.

Please note that off-chain executon via our AI models is closed source, but the inferences will be available on-chain via Ritual Infernet node

![image](https://github.com/user-attachments/assets/1dc2d4db-4407-4236-b05b-2e93196b229d)

