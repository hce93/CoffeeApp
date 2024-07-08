from django.db import models
from db_connection import db
from django.utils.text import slugify
from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from datetime import datetime

# Create your models here.

# mongodb
coffee_collection = db['coffeeBeans']
coffee_diary=db['coffeeDiary']

# postgresql
# create a profile model to manage users
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_image = models.ImageField(null=True, blank=True, upload_to="images/", default="default/default.jpeg")
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    bio = models.TextField(blank=True)
    
    def __str__(self):
        return self.user.username
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.slug= slugify(self.user.username)
        return super(Profile, self).save(*args, **kwargs)
    
class Review(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    content = models.TextField()
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    # reference from mongodb
    coffee_slug = models.CharField(blank=True)
    likes = models.ManyToManyField(User, related_name="review_likes", default=None, blank=True)
    last_update = models.DateTimeField(auto_now=True)
    first_published=models.DateTimeField(null=True)
    
    def save(self, *args, **kwargs):
        if not self.first_published:
            self.first_published=datetime.now()
        return super(Review, self).save(*args, **kwargs)
    
class Comments(models.Model):
    content = models.TextField()
    date=models.DateTimeField(auto_now=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    review = models.ForeignKey(Review, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.DO_NOTHING, null=True, blank=True, 
                               related_name='replies')
    likes = models.ManyToManyField(User, related_name="comment_likes", default=None, blank=True)
    is_deleted = models.BooleanField(default=False)
    last_update = models.DateTimeField(auto_now=True, null=True)
    first_published=models.DateTimeField(null=True)
    
    def save(self, *args, **kwargs):
        if not self.first_published:
            self.first_published=datetime.now()
        return super(Comments, self).save(*args, **kwargs)
    
class Bookmarks(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    coffee_slug = models.CharField(blank=True)
