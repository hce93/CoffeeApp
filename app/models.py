from django.db import models
from db_connection import db
from django.utils.text import slugify
from django.contrib.auth.models import User
# Create your models here.

# mongodb
person_collection = db['Person']

# postgresql
# create a profile model to manage users
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_image = models.ImageField(null=True, blank=True, upload_to="images/")
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    bio = models.TextField(blank=True)
    
    def __str__(self):
        return self.user.username
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.slug= slugify(self.user.username)
        return super(Profile, self).save(*args, **kwargs)