from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    LogoutView,
    UserDetailView,
    AllUsersView,
    PublicUsersView,
    UserProfileView,
    ProfileDetailView,
    ProfileCompletionStatusView,
    PasswordResetView,
    PasswordResetConfirmView,
    DashboardStatsView,
    RecommendedUsersView
)


urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # User endpoints
    path('user/', UserDetailView.as_view(), name='user_detail'),
    path('users/', AllUsersView.as_view(), name='all_users'),
    path('users/public/', PublicUsersView.as_view(), name='public_users'),
    path('user/profile/', UserProfileView.as_view(), name='user_profile'),
    path('profile/', ProfileDetailView.as_view(), name='profile_detail'),
    path('profile/completion-status/', ProfileCompletionStatusView.as_view(), name='profile_completion_status'),

    # Password reset endpoints
    path('password/reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Dashboard endpoints
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('dashboard/recommended/', RecommendedUsersView.as_view(), name='recommended_users'),
]
