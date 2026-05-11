from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SkillCategoryViewSet,
    SkillViewSet,
    UserSkillViewSet,
    UserLearningSkillViewSet
)
from .search_views import (
    AdvancedSkillSearchView,
    PersonalizedSkillRecommendationsView,
    SkillCategoriesView
)

router = DefaultRouter()
router.register(r'categories', SkillCategoryViewSet)
router.register(r'all', SkillViewSet)
router.register(r'teaching', UserSkillViewSet, basename='teaching')
router.register(r'learning', UserLearningSkillViewSet, basename='learning')

urlpatterns = [
    path('', include(router.urls)),
    # Enhanced search endpoints
    path('search/', AdvancedSkillSearchView.as_view(), name='skill-search'),
    path('recommendations/', PersonalizedSkillRecommendationsView.as_view(), name='skill-recommendations'),
    path('categories/enhanced/', SkillCategoriesView.as_view(), name='skill-categories-enhanced'),
]
