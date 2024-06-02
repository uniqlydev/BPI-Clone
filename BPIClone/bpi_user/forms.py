from django import forms 
from .models import User

class RegistrationForm(forms.ModelForm):
    confirm_password = forms.CharField(max_length=50, widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone_number', 'password']
        widgets = {
            'password': forms.PasswordInput()
        }

        