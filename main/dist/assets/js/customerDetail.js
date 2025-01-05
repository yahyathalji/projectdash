// assets/js/customerDetail.js

// Ensure the user is authenticated before proceeding
const authToken = sessionStorage.getItem("authToken");

if (!authToken) {
  console.warn("auth is null, login first");
  // Redirect to login page
  window.location.href = "auth-signin.html";
}

// Function to extract User ID from URL query parameters
function getUserIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

document.addEventListener("DOMContentLoaded", () => {
  const userId = getUserIdFromURL();
  const ordersTableBody = document.querySelector("#myDataTable tbody");
  const userDetailsUrl = `http://localhost:5000/api/get_user_detail/${userId}`;
  const userOrdersUrl = `http://localhost:5000/api/orders?id=${userId}`; // Assuming API accepts userId as a query parameter

  if (!userId) {
    const mainContent = document.querySelector(".main");
    if (mainContent) {
      mainContent.innerHTML = `<div class="alert alert-danger text-center">No User ID provided in the URL.</div>`;
    }
    throw new Error("No User ID provided in the URL.");
  }

  // Show loading indicator
  showLoading(true);

  // Ensure proper content type headers are set
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
    cookie: `authToken=${authToken}`,
  };

  // Fetch user details and orders concurrently
  Promise.all([
    fetch(userDetailsUrl, {
      method: "GET",
      headers: headers,
    }),
    fetch(userOrdersUrl, {
      method: "GET",
      headers: headers,
    }),
  ])
    .then(async ([userResponse, ordersResponse]) => {
      showLoading(false);

      let userData = null;
      let ordersData = [];

      // Handle User Details API Response
      if (userResponse.ok) {
        userData = await userResponse.json();
      } else if (userResponse.status === 404) {
        console.warn("User Details not found (404).");
        userData = {}; // Set to empty object to handle missing data
      } else {
        throw new Error(
          `User Details API error! Status: ${userResponse.status}`
        );
      }

      // Handle User Orders API Response
      if (ordersResponse.ok) {
        const ordersJson = await ordersResponse.json();
        ordersData = Array.isArray(ordersJson.data) ? ordersJson.data : [];
      } else if (ordersResponse.status === 404) {
        console.warn("User Orders not found (404).");
        ordersData = []; // Set to empty array to indicate no orders
      } else {
        throw new Error(
          `User Orders API error! Status: ${ordersResponse.status}`
        );
      }

      return { userData, ordersData };
    })
    .then(({ userData, ordersData }) => {
      console.log("User Data:", userData);
      console.log("Orders Data:", ordersData);
      ProfileAndAddress(userData);
      populatePaymentMethods(userData);
      renderTableData(ordersData, ordersTableBody);
      // Initialize DataTable only if jQuery and DataTables are loaded
      if (typeof $ !== "undefined" && $.fn.DataTable) {
        initializeDataTable();
      } else {
        console.warn("jQuery or DataTables not loaded");
      }
    })
    .catch((error) => {
      showLoading(false);
      console.error("Error fetching data:", error);
      if (ordersTableBody) {
        ordersTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Failed to load orders. Please try again later.</td></tr>`;
      }
      const profileInfo = document.querySelector(".profile-info");
      if (profileInfo) {
        console.error("Error fetching user details:", error);
        profileInfo.innerHTML += `<div class="alert alert-danger mt-3">Failed to load user details.</div>`;
      }
    });
});

// Function to render orders in the table
function renderTableData(ordersData, tableBody) {
  let rows = "";

  if (!Array.isArray(ordersData) || ordersData.length === 0) {
    rows = `<tr><td colspan="5" class="text-center">No orders available</td></tr>`;
  } else {
    ordersData.forEach((order) => {
      const createdAt = new Date(order.CreatedAt);
      rows += `
        <tr>
          <td><a href="order-details.html?orderId=${order.OrderID}"><strong>#Order-${order.OrderID}</strong></a></td>
          <td>${isNaN(createdAt) ? "N/A" : createdAt.toLocaleDateString()}</td>
          <td>$${isNaN(parseFloat(order.TotalPrice)) ? "N/A" : parseFloat(order.TotalPrice).toFixed(2)}</td>
          <td>${capitalizeFirstLetter(order.Status) || "N/A"}</td>
          <td>${typeof order.IsGift === "boolean" ? (order.IsGift ? "Yes" : "No") : "N/A"}</td>
        </tr>
      `;
    });
  }

  console.log("Generated Rows:", rows); // Debugging line
  tableBody.innerHTML = rows;
}

// Function to populate profile and address information
function ProfileAndAddress(data) {
  // Profile Elements
  const userIdElem = document.getElementById("userId");
  const userNameElem = document.getElementById("userCustomer");
  const phoneNumberElem = document.getElementById("PhoneNumber");
  const emailElem = document.getElementById("Email");
  const dobElem = document.getElementById("dateofbirth");
  const genderElem = document.getElementById("Gender");
  const profilePictureElem = document.getElementById("UserProfilePicture");

  // Populate Profile Information
  if (userIdElem) userIdElem.textContent = `ID: ${data.UserID || "N/A"}`;
  if (userNameElem) userNameElem.textContent = data.Username || "N/A";
  if (phoneNumberElem) phoneNumberElem.textContent = data.PhoneNumber || "N/A";
  if (emailElem) emailElem.textContent = data.Email || "N/A";
  if (genderElem)
    genderElem.textContent = data.Gender
      ? capitalizeFirstLetter(data.Gender)
      : "N/A";

  // Handle dateofbirth in "DD/MM/YYYY" format
  if (dobElem) {
    if (data.dateofbirth) {
      const [day, month, year] = data.dateofbirth.split("/");
      const dob = new Date(`${year}-${month}-${day}`);
      dobElem.textContent = isNaN(dob) ? "N/A" : dob.toLocaleDateString();
    } else {
      dobElem.textContent = "N/A";
    }
  }

  // Populate Profile Picture
  if (profilePictureElem) {
    if (data.UserProfilePicture && data.UserProfilePicture.filePath) {
      // Replace backslashes with forward slashes
      let filePath = data.UserProfilePicture.filePath.replace(/\\/g, "/");

      // If filePath is relative, prepend the base URL to form the correct URL
      if (!filePath.startsWith("http")) {
        filePath = `http://localhost:5000/${filePath}`;
      }

      profilePictureElem.src = filePath;

      // Handle image load error by setting a default image
      profilePictureElem.onerror = function () {
        this.src = "assets/images/lg/avatar4.svg"; // Default image
      };
    } else {
      profilePictureElem.src = "assets/images/lg/avatar4.svg"; // Default image
    }
  }

  // Populate Addresses
  populateAddresses(data.Addresses);
}

// Function to populate multiple addresses
function populateAddresses(addresses) {
  const addressSection = document.getElementById("AddressSection");
  if (addressSection) {
    if (Array.isArray(addresses) && addresses.length > 0) {
      let addressHtml = "";
      addresses.forEach((address, index) => {
        addressHtml += `
          <div class="info-card address-card">
            <div class="info-card-header">
              <h6 class="info-card-title">Address ${index + 1}</h6>
            </div>
            <div class="info-field">
              <span class="info-label">Address Line:</span>
              <span class="info-value">${address.AddressLine || "N/A"}</span>
            </div>
            <div class="info-field">
              <span class="info-label">City:</span>
              <span class="info-value">${address.City || "N/A"}</span>
            </div>
            <div class="info-field">
              <span class="info-label">State:</span>
              <span class="info-value">${address.State || "N/A"}</span>
            </div>
            <div class="info-field">
              <span class="info-label">Country:</span>
              <span class="info-value">${address.Country || "N/A"}</span>
            </div>
            <div class="info-field">
              <span class="info-label">Postal Code:</span>
              <span class="info-value">${address.PostalCode || "N/A"}</span>
            </div>
          </div>
        `;
      });
      addressSection.innerHTML = addressHtml;
    } else {
      addressSection.innerHTML = `<p>No addresses available.</p>`;
    }
  }
}

// Function to populate payment methods
function populatePaymentMethods(data) {
  const paymentMethodsSection = document.getElementById(
    "PaymentMethodsSection"
  );
  if (paymentMethodsSection) {
    if (Array.isArray(data.PaymentMethods) && data.PaymentMethods.length > 0) {
      let paymentHtml = "";
      data.PaymentMethods.forEach((method, index) => {
        // Determine if the payment method is expired based on ExpirationDate
        let isExpired = false;
        if (method.ExpirationDate) {
          const today = new Date();
          const expiration = new Date(method.ExpirationDate);
          isExpired = expiration < today;
        }

        paymentHtml += `
          <div class="info-card payment-card">
            <div class="info-card-header">
              <h6 class="info-card-title">Payment Method ${index + 1}</h6>
              <span class="card-status ${
                isExpired ? "status-expired" : "status-active"
              }">
                ${isExpired ? "Expired" : "Active"}
              </span>
            </div>
            <div class="info-field">
              <span class="info-label">Method:</span>
              <span class="info-value">${method.Method || "N/A"}</span>
            </div>
            <div class="info-field">
              <span class="info-label">Cardholder Name:</span>
              <span class="info-value">${
                method.CardholderName || "N/A"
              }</span>
            </div>
            <div class="info-field">
              <span class="info-label">Card Number:</span>
              <span class="info-value">${
                maskCardNumber(method.CardNumber) || "N/A"
              }</span>
            </div>
            <div class="info-field">
              <span class="info-label">Expiration Date:</span>
              <span class="info-value">${
                method.ExpirationDate
                  ? formatDate(method.ExpirationDate)
                  : "N/A"
              }</span>
            </div>
            <div class="info-field">
              <span class="info-label">Card Type:</span>
              <span class="info-value">${
                capitalizeFirstLetter(method.CardType) || "N/A"
              }</span>
            </div>
          </div>
        `;
      });
      paymentMethodsSection.innerHTML = paymentHtml;
    } else {
      paymentMethodsSection.innerHTML = `<p>No payment methods available.</p>`;
    }
  }
}

// Helper function to mask card numbers for security
function maskCardNumber(cardNumber) {
  if (!cardNumber) return "N/A";
  // Mask all digits except the last four
  const maskedSection = cardNumber.slice(-4).padStart(cardNumber.length, "*");
  // Insert spaces every 4 characters for readability
  return maskedSection.replace(/(.{4})/g, "$1 ").trim();
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper function to format date from ISO to readable format
function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (isNaN(date)) return "N/A";
  return date.toLocaleDateString();
}

// Function to initialize DataTables
function initializeDataTable() {
  if ($.fn.DataTable.isDataTable("#myDataTable")) {
    $("#myDataTable").DataTable().destroy();
  }

  $("#myDataTable").DataTable({
    responsive: true,
    autoWidth: false,
    paging: true,
    searching: true,
    info: true,
    lengthMenu: [10, 25, 50, 100],
    columnDefs: [{ targets: [-1, -3], className: "dt-body-right" }],
    language: {
      search: "Search Orders:",
      lengthMenu: "Show _MENU_ orders per page",
      info: "Showing _START_ to _END_ of _TOTAL_ orders",
      infoFiltered: "(filtered from _MAX_ total orders)",
      zeroRecords: "No matching orders found",
      emptyTable: "No orders available",
    },
  });
}

// Function to show or hide loading indicator
function showLoading(isLoading) {
  const mainContent = document.querySelector(".main");
  let spinner = document.getElementById("loadingSpinner");

  if (isLoading && !spinner) {
    spinner = document.createElement("div");
    spinner.id = "loadingSpinner";
    spinner.className =
      "spinner-border text-primary position-absolute top-50 start-50";
    spinner.style.zIndex = "1000"; // Ensure spinner is on top
    spinner.role = "status";
    spinner.innerHTML = `<span class="visually-hidden">Loading...</span>`;
    mainContent.appendChild(spinner);
  } else if (!isLoading && spinner) {
    spinner.remove();
  }
}
