// ===== USER AUTHENTICATION =====

// Pre-set admin account (for demo purposes)
const ADMIN_EMAIL = 'admin@eternalflowers.com';
const ADMIN_PASSWORD = 'admin123';

// Register new user
function registerUser(name, email, password) {
    let users = JSON.parse(localStorage.getItem('flowerUsers')) || [];
    
    // Check if email already exists
    for (let user of users) {
        if (user.email === email) {
            alert('This email is already registered. Please sign in.');
            return false;
        }
    }
    
    // Check if trying to register as admin
    if (email === ADMIN_EMAIL) {
        alert('This email is reserved for admin. Please use a different email.');
        return false;
    }
    
    // Create new user
    users.push({
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        role: 'user', // Regular user
        orders: [],
        createdAt: new Date().toLocaleString()
    });
    
    localStorage.setItem('flowerUsers', JSON.stringify(users));
    alert('Registration successful! Please sign in.');
    return true;
}

// Sign in existing user
function signInUser(email, password) {
    let users = JSON.parse(localStorage.getItem('flowerUsers')) || [];
    
    // Check if admin login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Check if admin already exists in users list
        let adminExists = false;
        for (let user of users) {
            if (user.email === ADMIN_EMAIL) {
                adminExists = true;
                break;
            }
        }
        
        // If admin doesn't exist in users list, add them
        if (!adminExists) {
            users.push({
                id: Date.now(),
                name: 'Admin',
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                role: 'admin',
                orders: [],
                createdAt: new Date().toLocaleString()
            });
            localStorage.setItem('flowerUsers', JSON.stringify(users));
        }
        
        localStorage.setItem('currentUser', JSON.stringify({
            id: 'admin',
            name: 'Admin',
            email: ADMIN_EMAIL,
            role: 'admin'
        }));
        alert('Welcome Admin! You have full access to the dashboard.');
        window.location.href = 'admin-dashboard.html';
        return true;
    }
    
    // Regular user login
    for (let user of users) {
        if (user.email === email && user.password === password) {
            localStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || 'user'
            }));
            
            const userData = getUserData(email);
            const orderCount = userData && userData.orders ? userData.orders.length : 0;
            alert('Welcome back, ' + user.name + '! (Orders: ' + orderCount + ')');
            window.location.href = 'index.html';
            return true;
        }
    }
    
    alert('Invalid email or password. Please try again.');
    return false;
}

// Sign out
function signOut() {
    localStorage.removeItem('currentUser');
    alert('You have been signed out.');
    window.location.href = 'index.html';
}

// Get current user
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        return JSON.parse(userData);
    }
    return null;
}

// Check if current user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Get full user data (including orders)
function getUserData(email) {
    let users = JSON.parse(localStorage.getItem('flowerUsers')) || [];
    for (let user of users) {
        if (user.email === email) {
            return user;
        }
    }
    return null;
}

// Get all users (admin only)
function getAllUsers() {
    let users = JSON.parse(localStorage.getItem('flowerUsers')) || [];
    return users;
}

// Save order to user's history
function saveOrderToUser(email, orderItems, total) {
    let users = JSON.parse(localStorage.getItem('flowerUsers')) || [];
    
    for (let user of users) {
        if (user.email === email) {
            if (!user.orders) user.orders = [];
            
            user.orders.push({
                id: Date.now(),
                date: new Date().toLocaleString(),
                items: orderItems,
                total: total,
                status: 'completed'
            });
            
            localStorage.setItem('flowerUsers', JSON.stringify(users));
            return true;
        }
    }
    return false;
}

// ===== SHOPPING CART =====

function addToCart(name, price) {
    let cart = JSON.parse(localStorage.getItem('flowerCart')) || [];
    
    for (let item of cart) {
        if (item.name === name) {
            item.quantity += 1;
            localStorage.setItem('flowerCart', JSON.stringify(cart));
            alert(name + ' added to cart! (Quantity: ' + item.quantity + ')');
            return;
        }
    }
    
    cart.push({
        name: name,
        price: price,
        quantity: 1
    });
    localStorage.setItem('flowerCart', JSON.stringify(cart));
    alert(name + ' added to cart!');
}

function clearCart() {
    localStorage.removeItem('flowerCart');
}

// ===== FORM VALIDATION =====

function validateForm() {
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    if (name.trim() == "" || email.trim() == "" || password.trim() == "") {
        alert("Please fill in all the fields.");
        return false;
    }
    
    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return false;
    }
    
    return true;
}

// ===== UNIVERSAL NAVBAR UPDATER =====

function updateNavbar() {
    const currentUser = getCurrentUser();
    const navs = document.querySelectorAll('nav ul');
    
    navs.forEach(nav => {
        const links = nav.querySelectorAll('li');
        
        let toRemove = [];
        links.forEach(li => {
            const text = li.textContent.trim();
            if (text.includes('My Account') || 
                text.includes('Sign Out') || 
                text.includes('Sign in / Register') ||
                text.includes('Register') ||
                text.includes('Admin Dashboard') ||
                li.innerHTML.includes('signout') ||
                li.innerHTML.includes('👤')) {
                toRemove.push(li);
            }
        });
        toRemove.forEach(li => li.remove());
        
        if (currentUser) {
            // Check if user is admin
            if (currentUser.role === 'admin') {
                // Admin links
                const adminLi = document.createElement('li');
                adminLi.innerHTML = '<a href="admin-dashboard.html" style="color:#e74c3c;font-weight:bold;">🔐 Admin</a>';
                nav.appendChild(adminLi);
            }
            
            // Add user emoji + name
            const userLi = document.createElement('li');
            userLi.innerHTML = '<a href="myaccount.html" style="color:#9a238e;font-weight:500;">👤 ' + currentUser.name + '</a>';
            nav.appendChild(userLi);
            
            // Add Sign Out link
            const signOutLi = document.createElement('li');
            signOutLi.innerHTML = '<a href="#" onclick="signOut(); return false;" style="color:#e74c3c;">Sign Out</a>';
            nav.appendChild(signOutLi);
        } else {
            const signInLi = document.createElement('li');
            signInLi.innerHTML = '<a href="signin.html">Sign in / Register</a>';
            nav.appendChild(signInLi);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    updateNavbar();
});
