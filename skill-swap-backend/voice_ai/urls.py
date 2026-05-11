"""
URL configuration for SkillSwap Voice AI app
"""

from django.urls import path
from . import views

app_name = 'voice_ai'

urlpatterns = [
    # Voice call initiation
    path('initiate-call/', views.InitiateVoiceCallView.as_view(), name='initiate_call'),

    # Voice session management
    path('sessions/', views.VoiceSessionListView.as_view(), name='session_list'),
    path('sessions/<str:session_id>/', views.VoiceSessionDetailView.as_view(), name='session_detail'),

    # Voice settings
    path('settings/', views.VoiceSettingsView.as_view(), name='voice_settings'),

    # Twilio webhooks
    path('webhook/call-status/<str:session_id>/', views.TwilioWebhookView.as_view(), name='twilio_webhook'),
]
