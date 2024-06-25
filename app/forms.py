from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Profile, coffee_collection, Review, Comments
from django.utils.text import slugify
from django.conf import settings
import os
import uuid
from django.utils.translation import gettext_lazy as _


class UserForm(UserCreationForm):
    class Meta:
        model = User
        fields = {'username', 'email', 'password1', 'password2'}
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs['placeholder'] = "Username"
        self.fields['email'].widget.attrs['placeholder'] = "Email"
        self.fields['password1'].widget.attrs['placeholder'] = "Password"
        self.fields['password2'].widget.attrs['placeholder'] = "Repeat Password"
        
    def clean_username(self):
        username = self.cleaned_data['username'].lower()
        new = User.objects.filter(username=username)
        if new.count():
            raise forms.ValidationError("User already exists")
        else:
            return username
        
    def clean_email(self):
        email = self.cleaned_data['email']
        new = User.objects.filter(email=email)
        if new.count():
            raise forms.ValidationError("Email already exists")
        else:
            return email
        
    def clean_password2(self):
        print(self.cleaned_data)
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1!=password2:
            raise forms.ValidationError("Passwords don't match!")
        else:
            return password2
        
class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = {'profile_image', 'bio'}
        

class CoffeeForm(forms.Form):
    title = forms.CharField(max_length=100)
    roaster = forms.CharField(max_length=200)
    producer = forms.CharField(max_length=200, required=False)
    process=forms.CharField(max_length=100, required=False)
    variety=forms.CharField(max_length=100, required=False)
    masl=forms.IntegerField(required=False)
    description=forms.CharField(required=False)
    image = forms.ImageField(required=False)
    
    
    def clean(self):
        cleaned_data = super().clean()
        # verify title and producer combination hasnt occured before
        search={'title':cleaned_data['title'], 'roaster':cleaned_data['roaster']}
        if coffee_collection.find_one(search):
            raise forms.ValidationError("An entry exists for this bean and roaster already. Sorry!")
        else:
            empty_data = ['', None]
            cleaned_data = {key:cleaned_data[key] for key in cleaned_data.keys() if cleaned_data[key] not in empty_data}
            cleaned_data['slug']=slugify(cleaned_data['title']+' '+cleaned_data['roaster'])
            # set likes array which will contain user id's
            cleaned_data['likes']=[]          
            return cleaned_data
    
    def clean_image(self):
        print("cleaning the image")
        if self.cleaned_data["image"]:
            data = self.cleaned_data["image"]
            data_str = str(self.cleaned_data["image"])
            extension = os.path.splitext(data_str)[1]
            unique_filename = str(uuid.uuid4())
            # get image extension
            
            image_path = os.path.join('upload/images/', unique_filename+extension)
            print(type(image_path))
            with open(image_path, 'wb') as file:
                    for chunk in data.chunks():
                        file.write(chunk)
            media_path = os.path.join('/media/images/', unique_filename+extension)
            return media_path
        else:
            return 'media/default/default-coffee.jpeg'
    
    def save(self):
        coffee_collection.insert_one(self.cleaned_data)
    
class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ['content', 'rating']
        labels = {'content':_(''), 'rating':_('')}
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['content'].widget.attrs['placeholder'] = "Review..."
        self.fields['rating'].widget.attrs['placeholder'] = "Rating"
        
    def clean_rating(self):
        cleaned_rating = self.cleaned_data['rating']
        if cleaned_rating<0 or cleaned_rating>5:
            raise forms.ValidationError("Rating must be between 0 and 5")
        else:
            return cleaned_rating

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comments
        fields = ['content']
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['content'].widget.attrs['placeholder'] = "Comment..."