/* eslint-disable */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

// Dom Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

//  Map to be shown over tour page (load only on tour page)
if (mapBox) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  displayMap(locations);
}

// LogIn User in
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(email, password);
    login(email, password);
  });
}

//  LoggingOut the user
if (logOutBtn) logOutBtn.addEventListener('click', logout);

// Update user data such as name and email
if (userForm) {
  userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    console.log(form);
    console.log(form);

    updateSettings(form, 'data');
  });
}

// Updating password in settings page
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const passwordCurrent =
      document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm =
      document.getElementById('password-confirm').value;

    updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing';
    // alternate way  const tourId  = e.target.dataset.tourId;
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
