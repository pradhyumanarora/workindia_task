from django.shortcuts import render,redirect
from .models import AdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from requests import Request,post
from rest_framework import status
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from .serializers import AdminUserSerializer , AdminLoginSerializer , MatchSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

#  create a userid when signup is sucessful

class SignUp(APIView):
    def post(self,request):
        serializer = AdminUserSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'Admin Account successfully created'},status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        # data=request.data
        # username=data.get('username')
        # password=data.get('password')
        # email=data.get('email')
        # if username is None or password is None or email is None:
        #     return Response({'error':'Please provide all the details'},status=status.HTTP_400_BAD_REQUEST)
        # user=AdminUser.objects.filter(username=username)
        # if user.exists():
        #     return Response({'error':'User already exists'},status=status.HTTP_400_BAD_REQUEST)
        # user=AdminUser.objects.create_user(username=username,password=password,email=email)
        # user.save()
        # return Response({'status':'Admin Account successfully created'},status=status.HTTP_200_OK)



""" class LogIn(APIView):
    def post(self,request):
        data=request.data
        username=data.get('username')
        password=data.get('password')
        if username is None or password is None:
            return Response({'error':'Please provide all the details'},status=status.HTTP_400_BAD_REQUEST)
        user=AdminUser.objects.filter(username=username)
        if not user.exists():
            return Response({'error':'User does not exists'},status=status.HTTP_400_BAD_REQUEST)
        user=AdminUser.objects.get(username=username)
        if not user.check_password(password):
            return Response({'status':' "Incorrect username/password provided. Please retry'},status=status.HTTP_401_UNAUTHORIZED)
        return Response({'status':'Login Successful'},status=status.HTTP_200_OK)
 """
class LogIn(APIView):
    def post(self,request):
        serializer = AdminLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = AdminUser.objects.get(username=username)
            if not user.check_password(password):
                return Response({'status':'Incorrect username/password provided. Please retry'},status=status.HTTP_401_UNAUTHORIZED)
            else:
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                return Response({'status':'Login Successful','staus_code': 200 , 'uder_id':user.id , 'token' : access_token},status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class CreateMatch(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = MatchSerializer(data=request.data)
        print("hello")
        if serializer.is_valid():
            match = serializer.save()
            return Response({'message': 'Match created successfully', 'match_id': match.pk}, status=status.HTTP_201_CREATED)
        return Response({'error': 'Something went wrong'}, status=status.HTTP_400_BAD_REQUEST)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

