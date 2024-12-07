document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please provide email and password");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.text();

        // If the response is just the token string:
        if (response.status === 200 && data) {
            const token = data;  // `data` is the token string returned by the server

            // Parse JWT token to get user role
            const tokenParts = token.split(".");
            const decodedPayload = JSON.parse(atob(tokenParts[1]));
            const userRole = decodedPayload.payload.role;

            console.log("Decoded Token:", decodedPayload);
            console.log("User Role:", userRole);
            sessionStorage.setItem("authToken",token);
            // Set the token as a cookie
            // Adding secure and same-site settings for security; adjust as needed
            document.cookie = `authToken=${token}; path=/;httpOnly=true;`;

            // Redirect based on the user role
            if (userRole === "admin") {
                window.location.href = "/main/dist/index.html";
            } else {
                // If user is not an admin, you can redirect them elsewhere
                // window.location.href = "/user/home.html";
            }
        } else if (response.status === 400) {
            console.log("Error 400:", data);
        } else if (response.status === 404) {
            console.log("Error 404:", data);
        } else {
            console.log("Other error:", data);
            console.log(response.status);
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
});
