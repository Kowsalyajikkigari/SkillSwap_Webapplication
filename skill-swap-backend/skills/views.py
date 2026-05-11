from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import SkillCategory, Skill, UserSkill, UserLearningSkill
from .serializers import (
    SkillCategorySerializer,
    SkillSerializer,
    UserSkillSerializer,
    UserLearningSkillSerializer,
    UserSkillDetailSerializer,
    UserLearningSkillDetailSerializer
)


class SkillCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing skill categories."""

    queryset = SkillCategory.objects.all()
    serializer_class = SkillCategorySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'description']


class SkillViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and creating skills."""

    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'description']
    filterset_fields = ['category']

    def create(self, request, *args, **kwargs):
        """
        Create a new skill, but check for duplicates first.
        """
        skill_name = request.data.get('name', '').strip()

        if not skill_name:
            return Response(
                {'error': 'Skill name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if skill already exists (case-insensitive)
        existing_skill = Skill.objects.filter(
            name__iexact=skill_name
        ).first()

        if existing_skill:
            # Return existing skill instead of creating duplicate
            serializer = self.get_serializer(existing_skill)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Create new skill
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get skills grouped by category."""
        categories = SkillCategory.objects.all()
        result = {}

        for category in categories:
            skills = Skill.objects.filter(category=category)
            result[category.name] = SkillSerializer(skills, many=True).data

        return Response(result)


class UserSkillViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user skills (skills that users can teach)."""

    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['skill__name', 'description']
    filterset_fields = ['level', 'skill__category']

    def get_queryset(self):
        """Return skills for the current user."""
        return UserSkill.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Create a new user teaching skill, but check for duplicates first.
        """
        skill_id = request.data.get('skill')
        user = request.user

        if not skill_id:
            return Response(
                {'error': 'Skill ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already has this teaching skill
        existing_user_skill = UserSkill.objects.filter(
            user=user,
            skill_id=skill_id
        ).first()

        if existing_user_skill:
            # Update existing skill instead of creating duplicate
            serializer = self.get_serializer(existing_user_skill, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Create new user skill
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Save the user when creating a skill."""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def detailed(self, request):
        """Get detailed user skills with skill information."""
        queryset = self.get_queryset()
        serializer = UserSkillDetailSerializer(queryset, many=True)
        return Response(serializer.data)


class UserLearningSkillViewSet(viewsets.ModelViewSet):
    """ViewSet for managing skills that users want to learn."""

    serializer_class = UserLearningSkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['skill__name', 'goal']
    filterset_fields = ['current_level', 'skill__category']

    def get_queryset(self):
        """Return learning skills for the current user."""
        return UserLearningSkill.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Create a new user learning skill, but check for duplicates first.
        """
        skill_id = request.data.get('skill')
        user = request.user

        if not skill_id:
            return Response(
                {'error': 'Skill ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already has this learning skill
        existing_learning_skill = UserLearningSkill.objects.filter(
            user=user,
            skill_id=skill_id
        ).first()

        if existing_learning_skill:
            # Update existing skill instead of creating duplicate
            serializer = self.get_serializer(existing_learning_skill, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Create new learning skill
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Save the user when creating a learning skill."""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def detailed(self, request):
        """Get detailed user learning skills with skill information."""
        queryset = self.get_queryset()
        serializer = UserLearningSkillDetailSerializer(queryset, many=True)
        return Response(serializer.data)
