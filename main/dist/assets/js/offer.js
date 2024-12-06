function initializeDataTable(selector, searchPlaceholder) {
    $(selector).DataTable({
        destroy: true,
        responsive: true,
        paging: true,
        searching: true,
        info: true,
        lengthMenu: [10, 25, 50, 100],
        pageLength: 10,
        columnDefs: [{ targets: [-1, -3], className: 'dt-body-right' }],
        language: {
            search: searchPlaceholder,
            lengthMenu: "Show _MENU_ entries per page",
            info: "Showing _START_ to _END_ of _TOTAL_ entries",
            zeroRecords: "No matching records found",
            emptyTable: "No data available"
        }
    });
}

function initializeTables() {
    initializeDataTable('#myPackagesTable', "Search Packages:");
    initializeDataTable('#myProductsTable', "Search Products:");
}

$("#submitOfferBtn").click(async function () {
    const discount = parseFloat($("#discount").val());
    const validFrom = formatDate($("#validFrom").val());
    const validTo = formatDate($("#validTo").val());

    // Validate required fields
    if (!discount || !validFrom || !validTo) {
        alert("Please fill in all fields");
        return;
    }
    if (discount <= 0) {
        alert("The Discount Cannot Be Negative or Zero");
        return;
    }
    if (validTo < validFrom) {
        alert("The Valid To date cannot be earlier than Valid From date");
        return;
    }

    const selectedPackages = $(".package-checkbox:checked").map(function () {
        return {
            PackageID: $(this).data("id"),
            Discount: discount,
            ValidFrom: validFrom,
            ValidTo: validTo,
            IsActive: true
        };
    }).get();

    const selectedProducts = $(".product-checkbox:checked").map(function () {
        return {
            ProductID: $(this).data("id"),
            Discount: discount,
            ValidFrom: validFrom,
            ValidTo: validTo
        };
    }).get();

    try {
        if (selectedPackages.length > 0) {
            await sendOfferToAPI("http://localhost:3000/api/offers/package", selectedPackages);
            alert("Offer for packages added successfully");
        }
        if (selectedProducts.length > 0) {
            await sendOfferToAPI("http://localhost:3000/api/offers", selectedProducts);
            alert("Offer for products added successfully");
        }

        // Refresh the tables
        await populateProducts();
        await populatePackages();
        initializeTables();

    } catch (error) {
        console.error("Error adding offer:", error);
        alert("Error adding offer");
    }
});

// Utility to send data to API
async function sendOfferToAPI(url, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
}

// Utility to fetch data
async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error fetching data from ${url}`);
    return response.json();
}

// Function to format date to YYYY-MM-DD
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
}

// Function to determine status badge class
function getStatusClass(status) {
    switch (status) {
        case "in stock":
            return "bg-success";
        case "running low":
            return "bg-warning";
        default:
            return "bg-danger";
    }
}

// Populate Products Table
async function populateProducts() {
    const products = await fetchData("http://localhost:3000/api/GetAllProducts");
    const productTableBody = document.getElementById("productTableBody");
    productTableBody.innerHTML = "";

    products
        .filter(p => !p.Offer || p.Offer.Discount === "0")
        .forEach(product => {
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
}

// Populate Packages Table
async function populatePackages() {
    const packages = await fetchData("http://localhost:3000/api/packages");
    const packageTableBody = document.getElementById("packageTableBody");
    packageTableBody.innerHTML = "";

    packages
        .filter(p => !p.Offer || p.Offer.Discount === "0")
        .forEach(pkg => {
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
}

// Initial population
(async function initialize() {
    await populateProducts();
    await populatePackages();
    initializeTables();
})();
