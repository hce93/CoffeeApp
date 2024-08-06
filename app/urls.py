from django.urls import path
from django.contrib.auth import views as auth_views
from .forms import LoginForm
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.index, name='home'),
    path('register/', views.register_user, name='register'),
    path('login/', auth_views.LoginView.as_view(authentication_form=LoginForm), name='login'),
    path('profile/<slug:slug>', views.user_profile, name='profile'),
    path('edit_profile/<slug:slug>', views.edit_profile, name='edit_profile'),
    path('coffee_form', views.coffee_form, name='coffee_form'),
    path('coffee/<slug:slug>', views.coffee, name='coffee'),
    path('delete_coffee/<slug:slug>', views.delete_coffee, name='delete_coffee'),
    path('like_item/<slug:id>', views.like_item, name='like_item'),
    path('create_comment/<int:id>', views.create_comment, name='create_comment'),
    path('create_review/<slug:slug>', views.create_review, name='create_review'),
    path('delete_comment/<int:id>', views.delete_comment, name='delete_comment'),
    path('delete_review/<int:id>', views.delete_review, name='delete_review'),
    path('bookmark_coffee/<slug:slug>', views.bookmark_coffee, name='bookmark_coffee'),
    path('diary', views.diary, name='diary'),
    path('diary/<slug:slug>', views.diary_entry, name='diary_entry'),
    path('add_to_diary/<slug:slug>', views.add_to_diary, name='add_to_diary'),
    path('generate_diary/', views.get_diary_data, name='generate_diary'),
    path('edit_diary/<slug:slug>', views.edit_diary, name='edit_diary'),
    path('review/<int:id>', views.review, name='review'),
    path('get_diary_id/<slug:title>', views.get_diary_id, name="get_diary_id"),
    path('check_diary_header', views.check_diary_header, name="check_diary_header"),
    path('all_coffees', views.all_coffees, name="all_coffees"),
    path('user_reviews', views.user_reviews, name="user_reviews"),
    path('edit_review/<int:id>', views.edit_review, name="edit_review"),
    path('delete_diary_entry/<slug:id>', views.delete_diary_entry, name="delete_diary_entry"),
    path('get_coffee_from_diary/<slug:id>', views.get_coffee_from_diary, name="get_coffee_from_diary"),
    path('review_from_diary/<slug:id>', views.review_from_diary, name='review_from_diary'),
    path('get_single_diary_entry,<slug:slug>', views.get_single_diary_entry, name='get_single_diary_entry'),
    path('manual/', views.manual, name='manual'),
    path('faq/', views.faq, name='faq'),
    path('terms/', views.terms, name='terms'),
]

if not settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)