import json, time, threading
from web3_utils import connect_web3, load_contract
from web3 import Web3

# ✅ Initialization
web3 = connect_web3()

# 🆕 Load two contracts
alert_contract = load_contract(web3, "abi/ColdChainAlert.json", "ALERT_CONTRACT_ADDRESS")
role_contract = load_contract(web3, "abi/RoleManager.json", "ROLE_CONTRACT_ADDRESS")

DATA_PATH = "data/temperature_log.json"
LOG_PATH = "data/violations.json"

# 👂 Listener thread
def listen_for_violations():
    event_filter = alert_contract.events.TemperatureViolation.create_filter(fromBlock='latest')
    print("👂 Listening for TemperatureViolation events...")

    while True:
        for event in event_filter.get_new_entries():
            print("🔥 Event received:", event["args"])
            try:
                with open(LOG_PATH, "a", encoding="utf-8") as f:
                    f.write(json.dumps(dict(event["args"]), default=str) + "\n")
            except Exception as e:
                print("❌ Failed to log event:", e)
        time.sleep(1)

# 🚨 alert logic
def check_and_trigger():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        temp_data = json.load(f)

    for entry in temp_data:
        batch_id = entry["batchId"]
        temp = entry["temperature"]
        account = entry["reporter"]

        try:
            print(f"📤 Reporting temperature for {batch_id}: {temp}°C")
            tx = alert_contract.functions.reportTemperature(batch_id, int(temp)).transact({"from": account})
            receipt = web3.eth.wait_for_transaction_receipt(tx)
            print(f"✅ Tx sent: {receipt.transactionHash.hex()}")
        except Exception as e:
            print(f"❌ Error for batch {batch_id}: {e}")


# 🚀 main
if __name__ == "__main__":
    threading.Thread(target=listen_for_violations, daemon=True).start()
    check_and_trigger()
