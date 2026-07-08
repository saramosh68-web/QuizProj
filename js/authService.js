const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

export function getUsers() {
    const users = localStorage.getItem(USERS_KEY);

    if (users === null) {
        return [];
    }

    return JSON.parse(users);
}

export function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function signUp(fullName, email, password, role) {
    const users = getUsers();

    const userExists = users.find(function (user) {
        return user.email === email;
    });

    if (userExists) {
        return {
            success: false,
            message: "User already exists"
        };
    }

    const newUser = {
        id: Date.now(),
        fullName: fullName,
        email: email,
        password: password,
        role: role
    };

    users.push(newUser);
    saveUsers(users);

    return {
        success: true,
        message: "Sign up completed successfully"
    };
}

export function signIn(email, password) {
    const users = getUsers();

    const foundUser = users.find(function (user) {
        return user.email === email && user.password === password;
    });

    if (!foundUser) {
        return {
            success: false,
            message: "Invalid email or password"
        };
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));

    return {
        success: true,
        message: "Sign in completed successfully",
        user: foundUser
    };
}