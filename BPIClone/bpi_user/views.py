from django.http import HttpResponse
from django.template import loader
from django.shortcuts import render, redirect
from .forms import RegistrationForm



# Create your views here.

def index(request):
    template = loader.get_template('home/index.html')
    return HttpResponse(template.render())

def register_user(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()
            return redirect('home:index')
    else:
        form = RegistrationForm()
    return render(request, 'home/register.html', {'form': form})
