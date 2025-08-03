import json
from web3 import Web3
import os
from dotenv import load_dotenv

load_dotenv()

def connect_web3():
    provider = Web3.HTTPProvider("http://127.0.0.1:8545")
    return Web3(provider)

def load_contract(web3, abi_path, address_env_key):
    with open(abi_path, "r") as f:
        abi = json.load(f)["abi"]
    address = os.getenv(address_env_key)
    return web3.eth.contract(address=address, abi=abi)
