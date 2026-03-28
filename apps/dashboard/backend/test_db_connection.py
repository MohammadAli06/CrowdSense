import asyncio, os, sys, json, certifi
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env"))
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    results = []
    try:
        client = AsyncIOMotorClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=10000)
        await client.admin.command("ping")
        results.append("STATUS: Connected successfully!")
        db_names = await client.list_database_names()
        results.append(f"DATABASES: {db_names}")
        db = client["crowdsense"]
        collections = await db.list_collection_names()
        results.append(f"COLLECTIONS in crowdsense: {collections}")
        for coll_name in collections:
            coll = db[coll_name]
            count = await coll.count_documents({})
            results.append(f"\n--- {coll_name}: {count} documents ---")
            sample = await coll.find_one()
            if sample:
                sample["_id"] = str(sample["_id"])
                for k, v in sample.items():
                    if isinstance(v, str) and len(v) > 80:
                        sample[k] = v[:80] + "..."
                    elif isinstance(v, bytes):
                        sample[k] = "<binary>"
                results.append(f"Sample: {json.dumps(sample, default=str, indent=2)}")
        client.close()
    except Exception as e:
        results.append(f"ERROR: {e}")
    
    output_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "db_results.txt")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(results))
    print("Results written to db_results.txt")

if __name__ == "__main__":
    asyncio.run(test())
