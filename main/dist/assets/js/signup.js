document.getElementById("signup").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const errorMessage = document.getElementById("error-message"); 

    
    if (!email || !password || !confirmPassword) {
        errorMessage.textContent = "Please provide email, password, and confirm password.";
        errorMessage.style.color = "red";
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match.";
        errorMessage.style.color = "red";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = "/main/dist/auth-signin.html";
        } else {
            errorMessage.textContent = data.error || "Sign up failed!";
            errorMessage.style.color = "red";
        }
    } catch (error) {
        console.error("Error during sign-up:", error);
        errorMessage.textContent = "Something went wrong. Please try again.";
        errorMessage.style.color = "red";
    }
});
