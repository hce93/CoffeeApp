from django.contrib.auth.models import User
from django.shortcuts import redirect, render
from .models import person_collection, Profile
from .forms import UserForm
from django.http import HttpResponse
from django.contrib.auth import login, logout
# Create your views here.

def index(request):
    return render(request, 'index.html')


# def add_person(request):
#     records = {
#         "first_name":"John",
#         "last_name":"Smith"
#     }
    
#     person_collection.insert_one(records)
#     return HttpResponse("New person is added")

# def get_all_person(request):
#     persons = person_collection.find()
#     return HttpResponse(persons)


def create_profile(username):
    user = User.objects.get(username=username)
    Profile.objects.create(user=user)

def register_user(request):
    form = UserForm()
    if request.method=="POST":
        form = UserForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            print(user)
            create_profile(request.POST.get('username'))
            return redirect('/')
    context = {
        'form':form
    }
    
    return render(request, 'registration/register.html', context)

def user_profile(request):
    if request.user.is_authenticated:
        user = User.objects.get(id = request.user.id)
        user_profile = Profile.objects.get(user = user)
        context = {
            "profile":user_profile
        }
        
        return render(request, 'profile.html', context)
    else:
        return HttpResponse("You need to log in")
    
def logout_view(request):
    logout(request)
    # Redirect to a success
    
    return render(request, 'registration/logged_out.html')