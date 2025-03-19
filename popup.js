// popup.js
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements - Auth
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form'); 
  const authContainer = document.getElementById('auth-container');
  const bookmarksContainer = document.getElementById('bookmarks-container');
  const errorDiv = document.getElementById('error');
  const bookmarksList = document.getElementById('bookmarksList');
  
  // DOM Elements - Forms
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const signupEmailInput = document.getElementById('signupEmail');
  const signupPasswordInput = document.getElementById('signupPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  
  // DOM Elements - Buttons
  const loginButton = document.getElementById('loginButton');
  const signupButton = document.getElementById('signupButton');
  const logoutButton = document.getElementById('logoutButton');
  const showSignupLink = document.getElementById('showSignup');
  const showLoginLink = document.getElementById('showLogin');
  
  // Toggle between login and signup forms
  showSignupLink.addEventListener('click', function() {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    errorDiv.textContent = '';
  });
  
  showLoginLink.addEventListener('click', function() {
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
    errorDiv.textContent = '';
  });
  
  // Check if user is already authenticated
  chrome.storage.local.get(['userAuth'], function(result) {
    if (result.userAuth) {
      // User is already signed in
      showBookmarks(result.userAuth);
    }
  });

  // Handle Login
  loginButton.addEventListener('click', function() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
      errorDiv.textContent = 'Please enter both email and password';
      return;
    }
    
    // Firebase REST API for email/password sign in
    fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      // Save auth data to chrome.storage
      const authData = {
        idToken: data.idToken,
        email: data.email,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn
      };
      
      chrome.storage.local.set({ userAuth: authData }, function() {
        showBookmarks(authData);
      });
    })
    .catch(error => {
      errorDiv.textContent = `Login failed: ${error.message}`;
    });
  });
  
  // Handle Signup
  signupButton.addEventListener('click', function() {
    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!email || !password) {
      errorDiv.textContent = 'Please enter both email and password';
      return;
    }
    
    if (password !== confirmPassword) {
      errorDiv.textContent = 'Passwords do not match';
      return;
    }
    
    // Firebase REST API for email/password sign up
    fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      // Save auth data to chrome.storage
      const authData = {
        idToken: data.idToken,
        email: data.email,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn
      };
      
      chrome.storage.local.set({ userAuth: authData }, function() {
        showBookmarks(authData);
      });
    })
    .catch(error => {
      errorDiv.textContent = `Signup failed: ${error.message}`;
    });
  });
  
  // Handle Logout
  logoutButton.addEventListener('click', function() {
    chrome.storage.local.remove('userAuth', function() {
      // Show login form again
      bookmarksContainer.style.display = 'none';
      authContainer.style.display = 'block';
      loginForm.style.display = 'block';
      signupForm.style.display = 'none';
      
      // Clear form fields
      emailInput.value = '';
      passwordInput.value = '';
      signupEmailInput.value = '';
      signupPasswordInput.value = '';
      confirmPasswordInput.value = '';
      errorDiv.textContent = '';
    });
  });

  function showBookmarks(authData) {
    // Switch to bookmarks view
    authContainer.style.display = 'none';
    bookmarksContainer.style.display = 'block';
    
    // Here you would fetch bookmarks from Firebase
    // Using REST API with the token
    fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${authData.email}/bookmarks`, {
      headers: {
        'Authorization': `Bearer ${authData.idToken}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }
      return response.json();
    })
    .then(data => {
      // Process and display bookmarks
      bookmarksList.innerHTML = '';
      
      if (data.documents && data.documents.length > 0) {
        data.documents.forEach(doc => {
          const li = document.createElement('li');
          // Extract bookmark data from Firestore document format
          const fields = doc.fields || {};
          const title = fields.title?.stringValue || 'Untitled';
          const url = fields.url?.stringValue || '#';
          
          const link = document.createElement('a');
          link.href = url;
          link.textContent = title;
          link.target = '_blank';
          
          li.appendChild(link);
          bookmarksList.appendChild(li);
        });
      } else {
        bookmarksList.innerHTML = '<li>No bookmarks found</li>';
      }
    })
    .catch(error => {
      // If this is a first-time user, they might not have any bookmarks yet
      bookmarksList.innerHTML = '<li>No bookmarks found</li>';
      console.error('Error fetching bookmarks:', error);
    });
  }
});