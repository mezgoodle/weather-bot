import motor.motor_asyncio

from tgbot.config import load_config

import logging
from typing import Union

config = load_config()
logger = logging.getLogger(__name__)

client = motor.motor_asyncio.AsyncIOMotorClient(
    f'mongodb+srv://mezgoodle:{config.db.password}@weather-user-data-suiox.mongodb.net/test?retryWrites=true&w=majority'
)
db = client[config.db.database]


async def create_document(data: dict, collection: str = 'users') -> bool:
    new_object = await db[collection].insert_one(data)
    created_object = await db[collection].find_one({'_id': new_object.inserted_id})
    if not created_object:
        logger.info(f'Failed to create object: {data}')
        return False
    logger.info(f'Created new object: {created_object}')
    return True


async def get_all_objects(collection: str = 'users', query: dict = None) -> list:
    objects = await db[collection].find(query).to_list(1000)
    if not objects:
        logger.info(f'Failed to get objects: {query}')
        return []
    logger.info(f'Found {len(objects)} objects')
    return objects


async def get_object(query: dict, collection: str = 'users') -> dict:
    if (founded_object := await db[collection].find_one(query)) is not None:
        logger.info(f'Found object: {founded_object}')
        return founded_object
    return {}


async def update_object(
        query: dict,
        requested_object: dict,
        user_id: str = None,
        collection: str = 'users'
) -> Union[dict, bool]:
    if (await db[collection].find_one(query)) is not None:
        if len(requested_object) >= 1:
            update_result = await db[collection].update_one(
                query, {'$set': requested_object}
            )
            if update_result.modified_count == 1:
                if (updated_object := await db[collection].find_one(query)) is not None:
                    logger.info(f'Updated object: {updated_object}')
                    return updated_object
            return {'success': True}
    else:
        if result := await create_document({'user_id': user_id, **requested_object}):
            return result
        logger.info(f'Failed to update object: {query}')
        return {}


async def delete_object(query: dict, collection: str = 'users') -> bool:
    delete_result = await db[collection].delete_one(query)

    if delete_result.deleted_count == 1:
        logger.info(f'Deleted object: {query}')
        return True
    logger.info(f'Failed to delete object: {query}')
    return False
