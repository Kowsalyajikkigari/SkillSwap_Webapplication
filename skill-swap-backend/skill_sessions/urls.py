from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SessionViewSet,
    SessionRequestViewSet,
    SessionFeedbackViewSet,
    UserAvailabilityView,
    AvailabilityCheckView
)

router = DefaultRouter()
router.register(r'requests', SessionRequestViewSet, basename='session-requests')
router.register(r'sessions', SessionViewSet, basename='sessions')
router.register(r'feedback', SessionFeedbackViewSet, basename='session-feedback')

urlpatterns = [
    path('', include(router.urls)),
    # Enhanced availability endpoints
    path('availability/', UserAvailabilityView.as_view(), name='user-availability'),
    path('availability/check/', AvailabilityCheckView.as_view(), name='availability-check'),
]
