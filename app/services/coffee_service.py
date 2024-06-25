from app.models import coffee_collection, Review #import mongodb and postgresql models

class CoffeeService:
    def __init__(self):
        self.mongo_collection=coffee_collection
    
    # function to delete coffee record and all related reviews
    def delete_coffee(self, slug):
        self.mongo_collection.delete_one({'slug':slug})
        
        Review.objects.filter(coffee_slug=slug).delete()
        