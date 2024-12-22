document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const authToken = sessionStorage.getItem("authToken");
  if (authToken) {
    console.log("User already logged in. Redirecting to dashboard...");
    window.location.href = "index.html";
    return;
  }
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please provide both email and password.");
    return;
  }

  try {
    

    const response = await fetch("http://35.234.135.60:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.text();

    if (response.status === 200 && data) {
      const token = data.replace(/"/g, "");
      console.log("Token:", token);

      // Store the token in sessionStorage
      sessionStorage.setItem("authToken", token);

      // Decode the JWT token to get user role
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      console.log("Decoded Token:", decodedToken);

      // Store the role in sessionStorage
      const userRole = decodedToken.payload.role; // Adjust based on your JWT structure
      sessionStorage.setItem("role", userRole);

      // Redirect user to the appropriate page based on role
      if (userRole === "admin") {
        window.location.href = "index.html";
      } else {
        window.location.href = "user.html";
      }
    } else if (response.status === 400) {
      console.error("Error 400:", data);
      alert("Bad Request: Please check your input.");
    } else if (response.status === 404) {
      console.error("Error 404:", data);
      alert("User not found. Please register.");
    } else {
      console.error("Other error:", data);
      alert("An unexpected error occurred. Please try again.");
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("Failed to connect to the server. Please try again later.");
  }
});
