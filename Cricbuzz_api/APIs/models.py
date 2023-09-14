from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

class AdminUser(AbstractUser):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=20, unique=True)
    email = models.EmailField(max_length=254, unique=True)
    password = models.CharField(max_length=20)
    groups = models.ManyToManyField(Group, related_name='admin_users')
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=('user permissions'),
        blank=True,
        related_name='admin_users',
        help_text=('Specific permissions for this user.'),
    )

class Match(models.Model):
    team_1 = models.CharField(max_length=255)
    team_2 = models.CharField(max_length=255)
    date = models.DateField()
    venue = models.CharField(max_length=255)
    def __str__(self):
        return f"{self.team_1} vs. {self.team_2} - {self.date}"


