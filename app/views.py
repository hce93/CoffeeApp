from django.contrib.auth.models import User
from django.shortcuts import redirect, render
from django.template.loader import render_to_string
from django.db.models import Count, Avg
from django.http import HttpResponseRedirect
from django.urls import reverse
from .models import coffee_collection, Profile, Review, Comments, Bookmarks, coffee_diary
from .forms import UserForm, ProfileForm, CoffeeForm, ReviewForm, CommentForm
from .permissions import hasEditStatus
from app.services.coffee_service import CoffeeService
from django.http import HttpResponse
from django.contrib.auth import login, logout
from django.utils.text import slugify
from django.http import JsonResponse, HttpResponseForbidden
from django.middleware.csrf import get_token
from bson.objectid import ObjectId
import json
from datetime import datetime
from django.contrib.auth.decorators import permission_required, login_required
from django.core.paginator import Paginator, EmptyPage
from functools import partial
import re

def index(request):
    # top 5 highest rated coffees
    all_coffees = list(coffee_collection.find())
    for x in range(len(all_coffees)):
        all_coffees[x]=add_details_to_coffee(all_coffees[x], request.user)

    def sort_function(element):
        return float(element['avg_rating'])
    top_rated_coffees=sorted(all_coffees, key=sort_function, reverse=True)[0:5]      
    
    # load top 5 most recent coffees
    most_recent_coffees=list(coffee_collection.find().sort({"date_added":-1})[0:5])
    # load likes and comment count for each coffee
    for x in range(len(most_recent_coffees)):
        most_recent_coffees[x] = add_details_to_coffee(most_recent_coffees[x], request.user)
    
    # load top 5 reviewed coffees
    # group reviews by coffee_slug and count how many reviews per slug
    coffee_review_count=Review.objects.values("coffee_slug").annotate(coffee_count=Count('coffee_slug')).order_by('-coffee_count')[0:5]
    top_reviewed_coffee=[]
    for item in coffee_review_count:
        coffee=coffee_collection.find_one({"slug":item['coffee_slug']})
        coffee_with_details=add_details_to_coffee(coffee, request.user)
        top_reviewed_coffee.append(coffee_with_details)
    
    # top 5 recent reviews
    recent_reviews = Review.objects.all().order_by('-last_update')[0:5]
    popular_reviews=Review.objects.annotate(like_count=Count('likes')).order_by('-like_count')[0:5] 
    # add comment count
    if request.user.is_authenticated:
        recent_reviews_updated=generate_review_info(recent_reviews, User.objects.get(username=request.user))
        popular_reviews_updated=generate_review_info(popular_reviews, User.objects.get(username=request.user))
    else:
        recent_reviews_updated=generate_review_info(recent_reviews)
        popular_reviews_updated=generate_review_info(popular_reviews)

    context={
        "top_rated_coffees":top_rated_coffees,
        "recent_reviews":recent_reviews_updated,
        "top_reviewed_coffee":top_reviewed_coffee,
        "most_recent_coffees":most_recent_coffees,
        "popular_reviews":popular_reviews_updated,
    }
    if request.user.is_authenticated:
        context['profile'] = Profile.objects.get(user = request.user)
    return render(request, 'index.html', context)

# function to generate coffee info for the summary pages, such as the home page
def add_details_to_coffee(coffee, user):
    # update like count if exists otherwise default to 0
    if "likes" in coffee.keys():
        like_count = len(coffee['likes'])
        user_liked = user.id in coffee['likes']
    else:
        like_count=0
        user_liked=False
    
    coffee['likes']=like_count
    coffee['avg_rating'], coffee['count_rating']=get_average_rating(coffee['slug'])
    if user.is_authenticated:
        coffee['user_liked']=user_liked
        coffee['in_diary']=check_coffee_in_diary(user.id, coffee['slug'])
        coffee["is_bookmarked"]=Bookmarks.objects.filter(user=user, coffee_slug=coffee['slug']).exists()
        
    return coffee

# function to get review info for the home page
def generate_review_info(reviews, user=None):
    info=[]
    for review in reviews:
        comment_count = get_comment_count(review.id)
        like_count=review.likes.count()
        author = User.objects.get(id=review.author_id).username
        is_liked_bool = is_liked(review, user) if user else False
        title=coffee_collection.find_one({"slug":review.coffee_slug})['title']
        roaster=coffee_collection.find_one({"slug":review.coffee_slug})['roaster']
        info.append({
            "review":review,
            "comment_count":comment_count,
            "author":author,
            "title":title,
            "roaster":roaster,
            "like_count":like_count,
            "is_liked": is_liked_bool
        })
    return info

# function to display all or search for specific coffees/roasters
def all_coffees(request):
    user=False
    if request.method=="POST" and request.POST.get('diary_search'):
        search_query = request.POST.get('search')
    else:
        search_query= request.GET.get('search') if request.GET.get('search') else ""
        user = True if request.GET.get('user') else False

    coffees=list(coffee_collection.find({"$or":[{"title":{"$regex":search_query, "$options":'i'}},
                                                {"roaster":{"$regex":search_query, "$options":'i'}},
                                                {"varietal":{"$regex":search_query, "$options":'i'}}]}))
    coffees_with_info=[]
    for x in range(len(coffees)):
        coffees[x]=add_details_to_coffee(coffees[x], request.user)
    # for coffee in coffees:
    #     if request.user.id in coffee['likes']:
    #         coffees[coffees.index(coffee)]=add_details_to_coffee(coffee, request.user)
    #     else:
    #         coffees.pop(coffees.index(coffee))
    # print(coffees)
    # sort order according to what the user has selected
    sort_request = request.GET.get('sort', default='avg_rating_desc')
    sort_query = re.sub('_asc|_desc','',sort_request)
    sort_rule = bool(re.search('desc',sort_request))
    print("Sorting Request: ", sort_request)
    print("Sorting Query: ", sort_query)
    print("Sorting RUle: ", sort_rule)
    
    def sort_function(element, sort_by):
        try:
            return element[sort_by].lower()
        except AttributeError:
            return element[sort_by]
    sort = partial(sort_function, sort_by=sort_query)
    coffees=sorted(coffees, key=sort, reverse=sort_rule)
    
    paginator=Paginator(coffees, per_page=5)
    page = request.GET.get('page', default=1)
    try:
        items = paginator.get_page(number=page)
    except EmptyPage:
        items=[]
    
    if request.method=="POST" and request.POST.get('diary_search'):
        # check if request includes a page number and get that specific page if it does
        if request.POST.get('page'):
            page = int(request.POST.get('page'))
            items = paginator.get_page(number=page)
        # create html string for the search
        
        html=""
        for coffee in items:
            html+=render_to_string('short_coffee_display_template.html', context={"coffee":coffee,"diary":True, "in_diary":check_coffee_in_diary(request.user.id, coffee['slug'])}, request=request)
        total_pages = paginator.num_pages
        context = {
                    "success":True,
                    "html":html,
                    "current_page":page,
                    "total_pages":total_pages
                   }
        if page<total_pages:
            print("Adding")
            context['more_pages']=True
        return JsonResponse(context)
    else:
        context={
        "search_query":search_query,
        "coffees":items,
        "sort_order":sort_request,
    }
    return render(request, 'all_coffees.html', context)


def create_profile(username):
    user = User.objects.get(username=username)
    Profile.objects.create(user=user)

def register_user(request):
    if request.method=="POST":
        form = UserForm(request.POST)
        print(form)
        if form.is_valid():
            user = form.save()
            login(request, user)
            print(user)
            create_profile(request.POST.get('username'))
            return redirect('/')
        else:
            print("Form errors: ", form.errors)
            context = {
                'form': form
            }
            return render(request, 'registration/register.html', context)
    form = UserForm()
    context = {
        'form':form
    }
    
    return render(request, 'registration/register.html', context)

def user_profile(request, slug):
    if request.user.is_authenticated:
        user_profile = Profile.objects.get(slug = slug)
        username = User.objects.get(profile = user_profile).username
        edit_access = True if user_profile.user_id==request.user.id else False
        
        user_likes = list(coffee_collection.find({"likes":request.user.id}))[0:5]
        # likes_list = [{key:like[key] for key in like.keys() if key in ['title','roaster','image','slug']} for like in user_likes]
        for x in range(len(user_likes)):
            user_likes[x]=add_details_to_coffee(user_likes[x], request.user)
        
        bookmarks_slugs = [bookmark.coffee_slug for bookmark in Bookmarks.objects.filter(user=request.user)]
        bookmark_coffees = list(coffee_collection.find({"slug":{'$in':bookmarks_slugs}}))[0:5]
        
        for x in range(len(bookmark_coffees)):
            bookmark_coffees[x]=add_details_to_coffee(bookmark_coffees[x], request.user)
        
        user_reviews = Review.objects.filter(author_id=request.user.id)[0:5]
        user_reviews = generate_review_info(user_reviews, User.objects.get(username=request.user))
    
        context = {
            "profile":user_profile,
            "username":username,
            "edit_access":edit_access,
            "likes_list":user_likes,
            "bookmark_coffees":bookmark_coffees,
            "user_reviews":user_reviews
        }
        return render(request, 'profile.html', context)
    else:
        return HttpResponse("You need to log in")

def edit_profile(request, slug):
    user = request.user
    profile =  Profile.objects.get(slug=slug)
    if profile.user_id==user.id:
        if request.method=="POST":
            print(request.FILES)
            form=ProfileForm(request.POST, request.FILES, instance=profile)
            if form.is_valid():
                profile = form.save()
                return HttpResponseRedirect(reverse('profile', args=[slug]))
        else: 
            form = ProfileForm(instance=profile)
            context={
                "form":form
            }
            return render(request, 'edit_profile.html', context)
    else:
        return HttpResponseRedirect(reverse('profile', args=[slug]))
    
def logout_view(request):
    logout(request)    
    return render(request, 'registration/logged_out.html')

# function to add coffee to the mongodb server
# only users that have permissions can do this
def coffee_form(request):
    if hasEditStatus(request.user):
        if request.method=="POST":
            print("data: ", request.POST)
            form = CoffeeForm(request.POST, request.FILES)
            print("FORM: ", form)
            if form.is_valid():
                form.save()
            else:
                context = {
                    "form":form
                }
                return render(request, 'coffee_form.html', context)
        form = CoffeeForm()
        context = {
            "form":form
        }
        return render(request, 'coffee_form.html', context)
    else:
        return HttpResponseForbidden("You do not have permission to access this page.")
    
def get_replies(comment, user):
    replies = Comments.objects.filter(parent=comment).order_by('date')
    return {
        'comment':[comment, is_liked(comment, user), {"like_count":comment.likes.count()}, user.id==comment.author_id],
        'replies':[get_replies(reply, user) for reply in replies]
    }

def get_replies_and_comments(review, user):
    first_comments = Comments.objects.filter(review=review, parent=None)
    comment_count = get_comment_count(review.id)
    def get_next_level(comments):
        replies = Comments.objects.filter(parent=comments).order_by('date')
        return {
            'comment':[comments, is_liked(comments, user), {"like_count":comments.likes.count()}, user.id==comments.author_id],
            'replies':[get_replies(reply, user) for reply in replies]
        }
        
    return {
        "review":[review, is_liked(review, user), {"like_count":review.likes.count(), 
                                                   "comment_count":comment_count}, user.id==review.author_id],
        "comments":[get_next_level(comment) for comment in first_comments]
    }

def get_average_rating(coffee_slug):
    aggregated_review = Review.objects.filter(coffee_slug=coffee_slug).aggregate(Avg('rating'), Count('rating'))
    average_rating = round(aggregated_review['rating__avg'],1) if aggregated_review['rating__avg'] else 0 
    count_rating = aggregated_review['rating__count'] if aggregated_review['rating__count'] else 0 
    return average_rating, count_rating 

def get_comment_count(review_id):
    count =  Review.objects.filter(id=review_id).annotate(comment_count=Count('comments'))[0].comment_count
    return count

def create_comment(request, id):
    if request.method=="POST":
        accepted_types=["comment", "reply"]
        if request.POST.get('type') in accepted_types:
            form=CommentForm(request.POST)
            print(form)
            if form.is_valid():
                print("FORM IS VALID!!!!!")
                comment = form.save(commit=False)
                comment.author=request.user
                # assign parent comment if reply to a comment
                if request.POST.get('type')=="reply":
                    parent = Comments.objects.get(id=id)
                    comment.parent=parent
                    review=parent.review
                # if not it's a new comment on a review
                else:
                    review = Review.objects.get(id=id)
                comment.review = review
                comment.save()
        
        context = {
            "comment":{"comment":[comment, False, {"like_count":0}, request.user.id==comment.author_id]},
            "comment_form":CommentForm(),
            "user":request.user
        }
        test_html=render_to_string('comment_reply_template.html', context, request=request)
        
        return JsonResponse({"msg":"success","html":test_html})

def create_review(request, slug):
    if request.method=="POST":
        form = ReviewForm(request.POST)
        if form.is_valid():
            author = request.user
            review = form.save(commit=False)
            review.author=author
            review.coffee_slug = slug
            review.save()
            
            print(review.id)
            comment_form = CommentForm()
            context = {
                "author":request.user.username,
                "review":review,
                "comment_count":0,
                "comment_form":comment_form,
                "user_is_author":True
            }
            html = render_to_string('review_template.html', context, request=request)
            # print(html)
            
            return JsonResponse({"success":True, "html":html})
        else:            
            # error handling if form is not valid
            print("Errors", form.errors)
            return JsonResponse({"success":False, "errors":form.errors.as_ul()}, status=400) 

def edit_review(request, id):
    success=False
    if request.method=="POST":
        # check if updating a review or comment
        if request.POST.get('type')=="comment":
            comment = Comments.objects.get(id=id)
            if comment.author_id==request.user.id:
                updated_content=request.POST.get('content')
                comment.content=updated_content
                comment.save()
                success=True            
        # if not a comment we are updating a review
        elif request.POST.get('type')=="review":
            review = Review.objects.get(id=id)
            if review.author_id==request.user.id:
                # update review
                updated_content = request.POST.get('content')
                review.content=updated_content
                updated_rating = request.POST.get('rating')
                review.rating = updated_rating
                review.save()
                success=True
    return JsonResponse({"success":success})

def coffee(request, slug):
    # handle post requests below for comments and reviews from registered users only
    if request.method=="POST" and request.user.is_authenticated:
        if request.POST.get('comment') or request.POST.get('reply'):
            form=CommentForm(request.POST)
            if form.is_valid():
                print("FORM IS VALID!!!!!")
                comment = form.save(commit=False)
                comment.author=request.user
                # assign parent comment if reply to a comment
                if request.POST.get('reply'):
                    parent = Comments.objects.get(id=request.POST.get('reply'))
                    comment.parent=parent
                    review=parent.review
                # if not it's a new comment on a review
                else:
                    review_id = request.POST.get('comment')
                    review = Review.objects.get(id=review_id)
                comment.review = review
                comment.save()
        else:     
            form = ReviewForm(request.POST)
            if form.is_valid():
                author = request.user
                review = form.save(commit=False)
                review.author=author
                review.coffee_slug = slug
                review.save()
            else:
                # update review form with errors
                review_form=form
    # load forms and data
    review_form = ReviewForm()
    comment_form = CommentForm()
    coffee = coffee_collection.find_one({"slug":slug})
    # use regex matching to create display names and modify date value
    # coffee_data = {re.sub('[-_]+',' ', key).capitalize():re.sub('\s\d{2}:\d{2}:\d{2}.\d{6}','',str(value)) for key, value in coffee.items() if key not in ['_id', 'slug', 'image','likes']}

    # like_data = {
    #     "is_liked":is_liked(coffee, request.user, True),
    #     "like_count":len(coffee['likes']) if 'likes' in coffee.keys() else 0 
    # }
    # coffee_image=coffee['image']
    coffee_slug = coffee['slug']
    reviews = Review.objects.filter(coffee_slug=slug).order_by('first_published')
    # is_bookmarked = Bookmarks.objects.filter(user=request.user, coffee_slug=slug).exists() if request.user.is_authenticated else False
    # avg_rating, rating_count = get_average_rating(slug)    
    # build dictionary of dictionaries of review and comments
    review_and_comment = [get_replies_and_comments(review, request.user) for review in reviews] 
    coffee=add_details_to_coffee(coffee, request.user)
    coffee['date_added']=re.sub('\s\d{2}:\d{2}:\d{2}.\d{6}','',str(coffee['date_added']))
    context = {
        # "coffee_data":coffee_data,
        # "like_data":like_data,
        # "coffee_image":coffee_image,
        # "coffee_slug":coffee_slug,
        "review_form":review_form,
        "comment_form":comment_form,
        "review_and_comment":review_and_comment,
        # "is_bookmarked":is_bookmarked,
        "in_diary":check_coffee_in_diary(request.user.id, coffee_slug),
        # 'average_rating':avg_rating,
        # "review_count":rating_count,
        "coffee":coffee
    }
    return render(request, 'coffee.html', context)

# function to serve ajax requests to like comments/reviews/coffees
def like_item(request, id):
    msg="failed"
    count=0
    user=request.user
    if request.POST.get('type')=="coffee":
        coffee = coffee_collection.find_one({"slug":id})
        
        likes = [like for like in coffee['likes']]
        if user.id in likes:
            likes.remove(user.id)
            count=len(coffee['likes'])-1
        else:
            likes.append(user.id)
            count=len(coffee['likes'])+1
        coffee_collection.update_one(
            {"slug":id},
            {
                "$set":{"likes":likes}
            }
        )
        msg="success"
    if request.POST.get('type')=="review":
        review=Review.objects.get(id=id)
        if review.likes.filter(id=user.id).exists():
            review.likes.remove(user)
        else:
            review.likes.add(user)
        id=review.coffee_slug
        msg="success"
        count=review.likes.count()
    if request.POST.get('type')=="comment":
        comment=Comments.objects.get(id=id)
        if comment.likes.filter(id=user.id).exists():
            comment.likes.remove(user)
        else:
            comment.likes.add(user)
        id=comment.review.coffee_slug
        msg="success"
        count=comment.likes.count()
    return JsonResponse({'msg':msg, 'count':count})

def is_liked(item, user, coffee=False):
    if coffee:
        if "likes" in item.keys():
            if user.id in item['likes']:
                return True
            else:
                return False    
        else:
            return False
    else:
        if item.likes.filter(id=user.id).exists():
                return True
        else:
            return False
        
def delete_comment(request, id):
    comment = Comments.objects.get(id=id)
    review_id=comment.review_id
    success=""
    content=""
    all_children_deleted=False
    to_remove=""
    comment_count=0
    # check if user able to delete this comment
    if request.user.id==comment.author_id:
        children = Comments.objects.filter(parent_id=comment.id)
        # check if any child comments attached to this comment
        if children:           
            print("Children: ", children)
            # check if these comments have been labelled as deleted but not yet deleted from the database
            all_children_deleted = check_children_deleted(comment)   
            print("All children deleted? ", all_children_deleted)
            if all_children_deleted:
                # if all children are labelled as deleted we can delete all and the comment
                delete_children(comment)
                comment.delete()
            else:
                # if children are not deleted we label this comment as deleted and don't remove from db
                comment.content="[deleted...]"
                comment.is_deleted=True
                comment.save()
                content = comment.content
        else:
            # if no children check if parents are deleted
            to_remove = check_parents_deleted(comment)
            if len(to_remove)>0:
                # if we have deleted parents we can work through the list and delete these
                for remove_id in to_remove:
                    Comments.objects.get(id=remove_id).delete()
        success=True
        # get new comment count for the whole review
        comment_count=get_comment_count(review_id)
    else:
        success=False
    retJson={
        "success": success,
        "content":content,
        "to_remove":to_remove,
        "all_children_deleted":all_children_deleted,
        "comment_count":comment_count
    }
    return JsonResponse(retJson)

def check_children_deleted(comment):
    print("Checking: ", comment.content, comment.id)
    
    children = Comments.objects.filter(parent_id=comment.id)
    print("Children are: ", children)
    all_deleted=True
    if children:
        print("We have children")
        for child in children:
            print("Checking child: ", child.content)
            if child.is_deleted:
                print("This kid is deleted!!!!")
                print("The id for this kid is: ", child.id)
                print("The id for its parent is ", child.parent_id)
                all_deleted=check_children_deleted(child)
                if not all_deleted:
                    break
            else:
                all_deleted=False
                break
    
    return all_deleted

def delete_children(comment):
    children = Comments.objects.filter(parent_id=comment.id)
    for child in children:
        if Comments.objects.filter(parent_id=child.id):
            delete_children(child)

        child.delete()

def delete_review(request, id):
    review = Review.objects.get(id=id)   
    review.delete()
    return JsonResponse({"success":True})             

# function to handle cascading deletion between mongoDB and postgresql
def delete_coffee(request, slug):
    coffee_service = CoffeeService()
    coffee_service.delete_coffee(slug)
    return {"message":"coffee deleted"}
 
def check_parents_deleted(comment):
    to_delete=[comment.id]
    parent_id = comment.parent_id
    if parent_id:
        parent = Comments.objects.get(id=parent_id)
        print("Parent: ", parent)
        print("Parent is deleted? ", parent.is_deleted)
        if parent.is_deleted:
            no_of_children=len(Comments.objects.filter(parent_id=parent.id))
            if no_of_children==1:
                to_delete = to_delete + check_parents_deleted(parent)
    return to_delete

def bookmark_coffee(request, slug):
    user = request.user
    if Bookmarks.objects.filter(user=user, coffee_slug=slug).exists():
        item = Bookmarks.objects.get(user=user, coffee_slug=slug)
        item.delete()
    else:
        item = Bookmarks(user=user, coffee_slug=slug)
        item.save()
    
    print("Slug: ",slug)
    return JsonResponse({"success":True})

# function to load diary template
@login_required
def diary(request):
    
    return render(request, 'diary.html')

def check_date_format(date_string, date_formats):

    try:
        datetime.strptime(date_string, date_formats)
        return True
    except ValueError:
        return False
def clean_diary_keys(diary):
    for key in diary.keys():
        # check if key is date
        if "date" in key or check_date_format(diary[key], "%Y-%m-%d"):
            diary[key] = [diary[key], "date", key.replace("_", " ").capitalize()]
        elif diary[key].isdigit():
            diary[key] = [diary[key], "number", key.replace("_", " ").capitalize()]
        else:
            diary[key] = [diary[key], "text", key.replace("_", " ").capitalize()]  
    
    return diary

def generate_diary_html(diary, request):
    ignore = ["_id", "user_id", "coffeeID", "coffeeSlug"]
    include={"roast_date":"date", "open_date":"date", "brew_method":"text",
             "grinder":"text", "grinder_setting":"text", "flavour_notes":"text"}
    html=""
    keys = list(diary.keys())
    copy_diary=diary.copy()
    suggestions={}
    for key in keys:
        if key in ignore:
            copy_diary.pop(key)
            
    for item in include.keys():
        if item not in diary:
            pass
            suggestions[item]=include[item]
    suggestions=clean_diary_keys(suggestions)
    copy_diary=clean_diary_keys(copy_diary)
             
    if(copy_diary):
        context={
            "diary":copy_diary
        }
        html=render_to_string('diary_input_template.html', context=context, request=request)
        
    return html, suggestions

def get_diary_id(request, title):
    if request.user.is_authenticated:
        coffee = coffee_collection.find_one({"title":title})
        slug = coffee['slug']
        diary=coffee_diary.find_one({"coffeeSlug":slug, "user_id":request.user.id})
        print(diary)
        context={
            "success":True,
            "id":str(diary["_id"])
        }
        
        return JsonResponse(context)

def diary_entry(request, slug):
    diary_entry = coffee_diary.find_one({"_id":ObjectId(slug)})
    if request.user.id==diary_entry["user_id"]:
        diary_html, suggestions=generate_diary_html(diary_entry, request)
        coffee = coffee_collection.find_one({"slug":diary_entry["coffeeSlug"]})
        test=add_details_to_coffee(coffee, request.user)
        test['date_added']=re.sub('\s\d{2}:\d{2}:\d{2}.\d{6}','',str(test['date_added']))
        context={
            "entry":diary_entry,
            "coffee":coffee,
            "slug":slug,
            "diary_html":diary_html,
            "suggestions":suggestions,
            "test":test
        }
        return render(request, "diary_entry.html", context)
    return render(request, "Invalid request")

def get_single_diary_entry(request, slug):
    diary_entry = dict(coffee_diary.find_one({"_id":ObjectId(slug)}))
    diary_entry['_id']=str(diary_entry['_id'])
    diary_entry['coffeeID']=str(diary_entry['coffeeID'])
    values = [[value] for key, value in diary_entry.items()]
    rows = list(diary_entry.keys())
    print("VAlues: ", values)
    print("KEYS: ", rows)
    return JsonResponse({"success":True,"data":diary_entry, "values":values, "rows":rows})

# function diary template uses to load data to ajax
def get_diary_data(request):
    if request.method=="GET":
        context={"success":False}
        if request.user.is_authenticated:
            # headers to ignore are the uneditable fields in the handsontable
            user_diary, coffee_headers, headers_to_ignore=generate_diary(request.user.id)
            # add last_update to be ignored as this beloings to diary but should not be editable
            headers_to_ignore.append('last_update')
            # convert id to a string from ObjectId so it can be sent as part of json response
            for diary in user_diary:
                diary['_id']=str(diary['_id'])
            context["success"]=True
            context["diary"]=user_diary
            context['coffee_headers']=coffee_headers
            context['headers_to_ignore']=headers_to_ignore
        return JsonResponse(context)


def add_coffee_data_to_diary(diary):
    new_diary = []
    coffee_headers=set()
    for entry in diary:
        coffee = coffee_collection.find_one({"slug":entry["coffeeSlug"]})
        header_set={key for key in coffee.keys()}
        coffee_headers=coffee_headers.union(header_set)
        coffee.pop("_id")
        new_dict = {**entry, **coffee}
        new_diary.append(new_dict)
    return new_diary, list(coffee_headers)

def generate_diary(user_id):
    user_diary=coffee_diary.find({"user_id":user_id})
    ignore = ["user_id","coffeeID","coffeeSlug", "image", "likes", "slug", "date_added"]
    user_diary, headers_to_ignore = add_coffee_data_to_diary(user_diary)
    print("Headers to Ignore: ", headers_to_ignore)
    data=[]
    table_headers=[]
    coffee_entry_headers_to_keep=[item for item in headers_to_ignore if item not in ignore if item!="_id"]
    
    for entry in user_diary:
        # append generated headers so we ignore them in further iterations
        ignore+=table_headers
        entry_header = [key for key in entry.keys() if key not in ignore]
        table_headers+=entry_header
        entry_data = {key:entry[key] for key in entry.keys() if key in table_headers}
        data.append(entry_data)
    return data, coffee_entry_headers_to_keep, headers_to_ignore

# function to add a coffee to the diary of a user. Used in the specific coffee pages
def add_to_diary(request, slug):
    if request.POST:
        user_id = request.user.id
        coffee=coffee_collection.find_one({"slug":slug})
        coffee_data = {"user_id":user_id,"coffeeID":coffee["_id"], "coffeeSlug":coffee["slug"], "last_update":datetime.now().strftime('%Y-%m-%d : %H:%M')}
        coffee_diary.insert_one(coffee_data)
        return JsonResponse({"success":True})
    else:
        return JsonResponse({"success":False})

# function to save any changes made by the user in the diary
def edit_diary(request, slug):
    if request.method=="POST":
        diary_entry = coffee_diary.find_one({"_id":ObjectId(slug)})
        # ensure correct user is editing the diary
        if request.user.id==diary_entry["user_id"]:
            # check if user sending edit request from diary table itself
            if request.POST.get('edit_from_table'):
                changes_str = request.POST.get('changes')
                changes = json.loads(changes_str)
                # update last_update
                print("Changes: ",changes)
                coffee_diary.update_one(diary_entry, {"$set":{changes[1]:changes[3], "last_update":datetime.now().strftime('%Y-%m-%d : %H:%M')}})
                
                return JsonResponse({"success":True})
            # if not from table will be from edit diary entry page
            else:
                ignore = ["_id", "user_id", "coffeeID", "coffeeSlug"]
                current_keys = [key for key in diary_entry.keys() if key not in ignore]
                # get data sent in post request and convert to readable dict
                data = request.body.decode('utf-8')
                data_dict = json.loads(data)
                # check if fields added are already in the coffee or diary entries
                keys = data_dict.keys()
                
                update_dict={}
                for key in data_dict.keys():
                    # check data isn't empty
                    if data_dict[key]:
                        update_dict[key]=data_dict[key]
                key_to_delete = [key for key in current_keys if key not in update_dict.keys()]
                dict_to_delete={key:value for key,value in diary_entry.items() if key in key_to_delete}
                coffee_diary.update_one(diary_entry, {"$set":update_dict, "$unset":dict_to_delete})
                return JsonResponse({"success":True})
        else:
            return JsonResponse({"success":False})
        
def check_coffee_in_diary(user_id,slug):
    check = coffee_diary.find_one({"coffeeSlug":slug, "user_id":user_id})
    return True if check else False
    
def check_diary_header(request):
    if request.method=="POST":
        # get header to check from posted data
        data = request.body.decode('utf-8')
        data_dict = json.loads(data)
        element = data_dict['element'].lower()
        # replace space with _ so element is comparable with keys
        element=element.replace(" ", "_")
        # load coffee and diary entries
        diary_entry = coffee_diary.find_one({"_id":ObjectId(data_dict['id'])})
        coffee_slug = diary_entry['coffeeSlug']
        coffee = coffee_collection.find_one({"slug":coffee_slug})
        print('a')
        # check if element exists in either
        print("Element: ", element)
        for key in diary_entry.keys():
            print("Checking: " + key + " vs. " + element)
            if key.lower() == element:
                return JsonResponse({"success":False})
        print('b')
        for key in coffee.keys():
            if key == element:
                return JsonResponse({"success":False})
        print('c')
        return JsonResponse({"success":True})
    
def delete_diary_entry(request, id):
    success=False
    user_id=request.user.id
    diary_id=ObjectId(id)
    diary_entry = coffee_diary.find_one({"_id":diary_id})
    # check if user is the author of the diary
    if diary_entry['user_id']==user_id:
        # delete the diary entry
        coffee_diary.delete_one(diary_entry)
        success=True
    return JsonResponse({"success":success})

def get_coffee_from_diary(request, id):
    diary_entry = coffee_diary.find_one({"_id":ObjectId(id)})
    context={"success":False}
    if request.user.id==diary_entry['user_id']:
        coffee_slug=diary_entry['coffeeSlug']
        context['slug']=coffee_slug
        context['success']=True
    return JsonResponse(context)

def review_from_diary(request, id):
    diary_entry = coffee_diary.find_one({"_id":ObjectId(id)})
    success=False
    if request.method=="POST":
        if request.user.id==diary_entry['user_id']:
            content=request.POST.get('content')
            rating=request.POST.get('rating')
            print("Content: ", content)
            print("Rating: ", rating)
            form = ReviewForm(request.POST)
            if form.is_valid():
                review=form.save(commit=False)
                review.author=request.user
                review.coffee_slug=diary_entry['coffeeSlug']
                review.save()
                success=True
    return JsonResponse({"success":success})
        
    
# view to display a single review - still contains comment, liking functionality
def review(request, id):
    review = Review.objects.get(id=id)
    review_and_comment=get_replies_and_comments(review, request.user)
    coffee=coffee_collection.find_one({"slug":review.coffee_slug})
    comment_form = CommentForm()
    context={
        "review":review_and_comment,
        "comment_form":comment_form,
        "coffee_image":coffee['image'],
        "coffee_title":coffee['title'],
        "coffee_roaster":coffee['roaster'],
        "coffee":coffee,
        "single_review":True
    }
    print("COFFEE: ", coffee)
    return render(request, 'single_review.html', context)  


def manual(request):
    return render(request, 'manual.html')
def faq(request):
    return render(request, 'faq.html')
def terms(request):
    return render(request, 'terms.html')

# to do
    # need to implement star rating on the overall average rating
    # create user profile - including bookmarks/saves and likes?
    # create a dashboard for users saved coffees - this will be the landing page for the user once logged in
        # home page can include most commented posts in the last week (if logged in or not), recent saves from user etc

    # have a diary feature of coffees they have brewed/ methods etc - use mongodb for this, so users can add any field?
        # in diaries have the option to ad reviews which then get saved to the coffee if the user choses to make it publi
    # create admin functionality who can add new coffees at users requests or just allow users to do this? Maybe has to be a paying user?
    # have coffee page just show a snippet of a review? The user follow link to see full review.
        # keep comments visible on the coffee page if the user chooses to


