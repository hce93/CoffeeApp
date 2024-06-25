from django.contrib.auth.models import Group

def add_coffee_group(request):
    # context processor to check if user is part of coffee group
    is_member=False
    if request.user.is_authenticated:
        is_member=request.user.groups.filter(name="Add Coffee").exists()
        
    return {
        "is_coffee_member":is_member
    }