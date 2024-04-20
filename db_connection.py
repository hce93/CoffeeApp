# youtube tutorial
# https://www.youtube.com/watch?v=oUIjHQMBdD4

import pymongo

url = 'mongodb+srv://cubitsbanyan0t:p76aJV2Ulr9GzMfh@coffeeapp.9xubosd.mongodb.net/'
client = pymongo.MongoClient(url)

db = client['coffeeApp']