from django.contrib.auth.models import Group

def hasEditStatus(user):
    # check if user is admin, staff or part of edit group
    return user.is_superuser or user.is_staff or user.groups.filter(name='Add Coffee').exists()
    