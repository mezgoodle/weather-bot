import motor.motor_asyncio

from tgbot.config import load_config

config = load_config()

client = motor.motor_asyncio.AsyncIOMotorClient(
    f"mongodb+srv://mezgoodle:{config.db.password}@weather-user-data-suiox.mongodb.net/test?retryWrites=true&w=majority"
)
db = client[config.db.database]


async def create_document(data: dict, collection: str) -> bool:
    new_object = await db[collection].insert_one(data)
    created_object = await db[collection].find_one({"_id": new_object.inserted_id})
    if not created_object:
        return False
    return True


async def get_all_objects(collection: str, query: dict = None) -> list:
    objects = await db[collection].find(query).to_list(1000)
    if not objects:
        return []
    return objects


async def get_object(query: dict, collection: str) -> dict:
    if (founded_object := await db[collection].find_one(query)) is not None:
        return founded_object
    return {}


async def update_object(query: dict, requested_object: dict, collection: str) -> dict:
    if len(requested_object) >= 1:
        update_result = await db[collection].update_one(
            query, {"$set": requested_object}
        )

        if update_result.modified_count == 1:
            key = list(query.keys())[0]
            if key in list(requested_object.keys()):
                value = requested_object[key]
                query = {key: value}
            if (updated_object := await db[collection].find_one(query)) is not None:
                return updated_object
        return {}

    if (existing_object := await db[collection].find_one(query)) is not None:
        return existing_object

    return {}


async def delete_object(query: dict, collection: str) -> bool:
    delete_result = await db[collection].delete_one(query)

    if delete_result.deleted_count == 1:
        return True
    return False
