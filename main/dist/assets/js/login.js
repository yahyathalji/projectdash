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
            credentials: "include", 
        });

        const data = await response.json();

        if (response.ok && data.token) {
            const decodedToken = JSON.parse(atob(data.token.split(".")[1]));
            const userRole = decodedToken.payload.role;

            if (userRole === "admin") {
                window.location.href = "/main/dist/index.html";
            } else {
                // window.location.href = "";
            }
        } else {
            alert(data.error || "Login failed!");
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
});
