// Assuming you're using jQuery for DOM manipulation and event handling

// Utility to send data to API
async function sendOfferToAPI(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        cookie: "authToken=" + sessionStorage.getItem("authToken"),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to add offer. Status: ${response.status}. Message: ${errorText}`
      );
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

// Utility to fetch data
async function fetchData(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        cookie: "authToken=" + sessionStorage.getItem("authToken"),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error fetching data from ${url}. Message: ${errorText}`);
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

// Function to format date to YYYY-MM-DD
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

// Function to determine status badge class
function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case "in stock":
      return "bg-success";
    case "running low":
      return "bg-warning";
    default:
      return "bg-danger";
  }
}

// Initialize Data Tables
function initializeDataTable(selector, searchPlaceholder) {
  $(selector).DataTable({
    destroy: true,
    responsive: true,
    paging: true,
    searching: true,
    info: true,
    lengthMenu: [10, 25, 50, 100],
    pageLength: 10,
    columnDefs: [{ targets: [-1, -3], className: "dt-body-right" }],
    language: {
      search: searchPlaceholder,
      lengthMenu: "Show _MENU_ entries per page",
      info: "Showing _START_ to _END_ of _TOTAL_ entries",
      zeroRecords: "No matching records found",
      emptyTable: "No data available",
    },
  });
}

function initializeTables() {
  initializeDataTable("#myPackagesTable", "Search Packages:");
  initializeDataTable("#myProductsTable", "Search Products:");
}

// Populate Products Table
async function populateProducts() {
  try {
    const products = await fetchData("http://localhost:5000/api/GetAllProducts");

    const productTableBody = document.getElementById("productTableBody");
    productTableBody.innerHTML = "";

    products
      .filter((p) => !p.Offer || p.Offer.Discount === "0")
      .forEach((product) => {
        const row = `
          <tr>
              <td>${product.ProductID}</td>
              <td>${product.Name}</td>
              <td>${product.Price}</td>
              <td>${product.Offer?.Discount || "0"}%</td>
              <td><span class="badge ${getStatusClass(product.Status)}">${product.Status}</span></td>
              <td><input type="checkbox" class="product-checkbox" data-id="${product.ProductID}"></td>
          </tr>
        `;
        productTableBody.insertAdjacentHTML("beforeend", row);
      });
  } catch (error) {
    console.error("Error populating products:", error);
    alert("Error populating products: " + error.message);
  }
}

// Populate Packages Table
async function populatePackages() {
  try {
    const packages = await fetchData("http://localhost:5000/api/packages");

    const packageTableBody = document.getElementById("packageTableBody");
    packageTableBody.innerHTML = "";

    packages
      .filter((p) => !p.Offer || p.Offer.Discount === "0")
      .forEach((pkg) => {
        const row = `
          <tr>
              <td>${pkg.PackageID}</td>
              <td>${pkg.Name}</td>
              <td>${pkg.Price}</td>
              <td>${pkg.Offer?.Discount || "0"}%</td>
              <td><span class="badge ${getStatusClass(pkg.Status)}">${pkg.Status}</span></td>
              <td><input type="checkbox" class="package-checkbox" data-id="${pkg.PackageID}"></td>
          </tr>
        `;
        packageTableBody.insertAdjacentHTML("beforeend", row);
      });
  } catch (error) {
    console.error("Error populating packages:", error);
    alert("Error populating packages: " + error.message);
  }
}

// Handle Submit Offer Button Click
$("#submitOfferBtn").click(async function () {
  const discount = parseFloat($("#discount").val());
  const validFrom = formatDate($("#validFrom").val());
  const validTo = formatDate($("#validTo").val());

  // Validate required fields
  if (!discount || isNaN(discount)) {
    alert("Please enter a valid discount value.");
    return;
  }

  if (!validFrom || isNaN(new Date(validFrom).getTime())) {
    alert("Please enter a valid 'Valid From' date.");
    return;
  }

  if (!validTo || isNaN(new Date(validTo).getTime())) {
    alert("Please enter a valid 'Valid To' date.");
    return;
  }

  if (validTo < validFrom) {
    alert("The 'Valid To' date cannot be earlier than the 'Valid From' date.");
    return;
  }

  const selectedPackages = $(".package-checkbox:checked")
    .map(function () {
      return {
        PackageID: $(this).data("id"),
        Discount: discount,
        ValidFrom: validFrom,
        ValidTo: validTo,
        IsActive: true,
      };
    })
    .get();

  const selectedProducts = $(".product-checkbox:checked")
    .map(function () {
      return {
        ProductID: $(this).data("id"),
        Discount: discount,
        ValidFrom: validFrom,
        ValidTo: validTo,
      };
    })
    .get();

  try {
    // Initialize an array to hold all API calls
    const apiCalls = [];

    // Send package offers if any packages are selected
    if (selectedPackages.length > 0) {
      apiCalls.push(
        sendOfferToAPI(
          "http://localhost:5000/api/offers/packages", // Ensure this matches your backend route
          selectedPackages
        )
      );
    }

    // Send product offers if any products are selected
    if (selectedProducts.length > 0) {
      apiCalls.push(
        sendOfferToAPI(
          "http://localhost:5000/api/offers/products", // Ensure this matches your backend route
          selectedProducts
        )
      );
    }

    // Execute all API calls concurrently
    const results = await Promise.all(apiCalls);

    // Handle success responses
    if (selectedPackages.length > 0) {
      alert("Offers for packages added successfully.");
    }
    if (selectedProducts.length > 0) {
      alert("Offers for products added successfully.");
    }

    // Refresh the tables
    await populateProducts();
    await populatePackages();
    initializeTables();
  } catch (error) {
    console.error("Error adding offers:", error);
    alert("Error adding offers: " + error.message);
  }
});

// Initial population of tables and DataTables
(async function initialize() {
  await populateProducts();
  await populatePackages();
  initializeTables();
})();
