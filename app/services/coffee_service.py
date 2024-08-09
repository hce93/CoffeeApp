from app.models import coffee_collection, coffee_diary, Review, Bookmarks

class CoffeeService:
    def __init__(self):
        self.mongo_coffee_collection=coffee_collection
        self.mongo_diary_collection=coffee_diary
    
    # function to delete coffee record and all related reviews/comments/bookmarks/diary entries
    def delete_coffee(self, slug):
        # delete coffee
        self.mongo_coffee_collection.delete_one({'slug':slug})
        # delete all diary entries for coffee
        self.mongo_diary_collection.delete_many({"coffeeSlug":slug})
        # delete reviews
            # this will cause cascading deletions of comments and likes
        Review.objects.filter(coffee_slug=slug).delete()
        # delete bookmarks
        Bookmarks.objects.filter(coffee_slug=slug).delete()
        
        