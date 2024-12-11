document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please provide email and password");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.text();

    // If the response is just the token string:
    if (response.status === 200 && data) {
      const token = data; // `data` is the token string returned by the server
      console.log("Token:", token);
      // Parse JWT token to get user role
      sessionStorage.setItem("authToken", token);
      // decode the token
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      console.log("Decoded Token:", decodedToken);
      // store the role in session storage
      sessionStorage.setItem("role", decodedToken.role);
      // redirect user to the appropriate page
        if (decodedToken.payload.role === "admin") {
            window.location.href = "index.html";
        } else {
            window.location.href = "/user.html";
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
