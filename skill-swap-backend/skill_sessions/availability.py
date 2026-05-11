"""
Enhanced availability and calendar management for SwapSkill sessions
"""

from django.db import models
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta, time
from django.utils import timezone
from typing import List, Dict, Optional, Tuple
import calendar

User = get_user_model()


class UserAvailability(models.Model):
    """Model for user availability preferences"""
    
    WEEKDAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availability')
    weekday = models.IntegerField(choices=WEEKDAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    
    # Timezone support
    timezone = models.CharField(max_length=50, default='UTC')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'weekday', 'start_time', 'end_time']
        ordering = ['weekday', 'start_time']
    
    def __str__(self):
        return f"{self.user.email} - {self.get_weekday_display()} {self.start_time}-{self.end_time}"


class AvailabilityException(models.Model):
    """Model for specific date availability exceptions"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availability_exceptions')
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    is_available = models.BooleanField(default=False)  # False = unavailable, True = available override
    reason = models.CharField(max_length=200, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'date', 'start_time', 'end_time']
        ordering = ['date', 'start_time']
    
    def __str__(self):
        return f"{self.user.email} - {self.date} {'Available' if self.is_available else 'Unavailable'}"


class AvailabilityManager:
    """Manager for handling user availability and scheduling"""
    
    def __init__(self):
        self.default_session_duration = 60  # minutes
    
    def get_user_availability(self, user: User, start_date: datetime, end_date: datetime) -> Dict:
        """Get user's availability for a date range"""
        availability_data = {
            'regular_schedule': [],
            'exceptions': [],
            'available_slots': []
        }
        
        # Get regular weekly availability
        regular_availability = UserAvailability.objects.filter(
            user=user, is_available=True
        ).order_by('weekday', 'start_time')
        
        for avail in regular_availability:
            availability_data['regular_schedule'].append({
                'weekday': avail.weekday,
                'weekday_name': avail.get_weekday_display(),
                'start_time': avail.start_time.strftime('%H:%M'),
                'end_time': avail.end_time.strftime('%H:%M'),
                'timezone': avail.timezone
            })
        
        # Get exceptions for the date range
        exceptions = AvailabilityException.objects.filter(
            user=user,
            date__gte=start_date.date(),
            date__lte=end_date.date()
        ).order_by('date', 'start_time')
        
        for exception in exceptions:
            availability_data['exceptions'].append({
                'date': exception.date.isoformat(),
                'start_time': exception.start_time.strftime('%H:%M') if exception.start_time else None,
                'end_time': exception.end_time.strftime('%H:%M') if exception.end_time else None,
                'is_available': exception.is_available,
                'reason': exception.reason
            })
        
        # Generate available time slots
        availability_data['available_slots'] = self._generate_available_slots(
            user, start_date, end_date
        )
        
        return availability_data
    
    def _generate_available_slots(self, user: User, start_date: datetime, end_date: datetime) -> List[Dict]:
        """Generate specific available time slots for booking"""
        slots = []
        current_date = start_date.date()
        
        # Get user's regular availability
        regular_availability = UserAvailability.objects.filter(
            user=user, is_available=True
        )
        
        # Get existing sessions to avoid conflicts
        from .models import Session
        existing_sessions = Session.objects.filter(
            models.Q(requester=user) | models.Q(provider=user),
            date__gte=current_date,
            date__lte=end_date.date(),
            status__in=['confirmed', 'pending']
        )
        
        while current_date <= end_date.date():
            weekday = current_date.weekday()
            
            # Check for availability exceptions
            exceptions = AvailabilityException.objects.filter(
                user=user, date=current_date
            )
            
            # If there's a full-day unavailability exception, skip this day
            full_day_unavailable = exceptions.filter(
                start_time__isnull=True, end_time__isnull=True, is_available=False
            ).exists()
            
            if not full_day_unavailable:
                # Get regular availability for this weekday
                day_availability = regular_availability.filter(weekday=weekday)
                
                for avail in day_availability:
                    # Generate time slots within this availability window
                    slot_start = datetime.combine(current_date, avail.start_time)
                    slot_end = datetime.combine(current_date, avail.end_time)
                    
                    # Generate 30-minute slots
                    current_slot = slot_start
                    while current_slot + timedelta(minutes=self.default_session_duration) <= slot_end:
                        slot_end_time = current_slot + timedelta(minutes=self.default_session_duration)
                        
                        # Check if this slot conflicts with existing sessions
                        conflict = existing_sessions.filter(
                            date=current_date,
                            start_time__lt=slot_end_time.time(),
                            end_time__gt=current_slot.time()
                        ).exists()
                        
                        # Check if this slot conflicts with exceptions
                        exception_conflict = exceptions.filter(
                            start_time__lte=current_slot.time(),
                            end_time__gte=slot_end_time.time(),
                            is_available=False
                        ).exists()
                        
                        if not conflict and not exception_conflict:
                            slots.append({
                                'date': current_date.isoformat(),
                                'start_time': current_slot.time().strftime('%H:%M'),
                                'end_time': slot_end_time.time().strftime('%H:%M'),
                                'duration_minutes': self.default_session_duration,
                                'available': True
                            })
                        
                        current_slot += timedelta(minutes=30)  # 30-minute intervals
            
            current_date += timedelta(days=1)
        
        return slots
    
    def check_slot_availability(self, user: User, date: datetime, start_time: time, duration_minutes: int = 60) -> bool:
        """Check if a specific time slot is available for a user"""
        weekday = date.weekday()
        end_time = (datetime.combine(date.date(), start_time) + timedelta(minutes=duration_minutes)).time()
        
        # Check regular availability
        regular_available = UserAvailability.objects.filter(
            user=user,
            weekday=weekday,
            start_time__lte=start_time,
            end_time__gte=end_time,
            is_available=True
        ).exists()
        
        if not regular_available:
            return False
        
        # Check for exceptions
        exception_unavailable = AvailabilityException.objects.filter(
            user=user,
            date=date.date(),
            is_available=False
        ).filter(
            models.Q(start_time__isnull=True, end_time__isnull=True) |  # Full day unavailable
            models.Q(start_time__lte=start_time, end_time__gte=end_time)  # Time range unavailable
        ).exists()
        
        if exception_unavailable:
            return False
        
        # Check for existing sessions
        from .models import Session
        existing_session = Session.objects.filter(
            models.Q(requester=user) | models.Q(provider=user),
            date=date.date(),
            start_time__lt=end_time,
            end_time__gt=start_time,
            status__in=['confirmed', 'pending']
        ).exists()
        
        return not existing_session
    
    def suggest_alternative_slots(self, user: User, preferred_date: datetime, duration_minutes: int = 60) -> List[Dict]:
        """Suggest alternative time slots if preferred slot is not available"""
        suggestions = []
        
        # Check 7 days around the preferred date
        start_date = preferred_date - timedelta(days=3)
        end_date = preferred_date + timedelta(days=7)
        
        available_slots = self._generate_available_slots(user, start_date, end_date)
        
        # Sort by proximity to preferred date
        for slot in available_slots:
            slot_date = datetime.fromisoformat(slot['date'])
            days_diff = abs((slot_date.date() - preferred_date.date()).days)
            slot['days_from_preferred'] = days_diff
        
        # Return top 10 suggestions sorted by proximity
        suggestions = sorted(available_slots, key=lambda x: x['days_from_preferred'])[:10]
        
        return suggestions


# Global availability manager instance
availability_manager = AvailabilityManager()
