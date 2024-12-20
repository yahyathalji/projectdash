"use strict";

function initializeProductTableLogic() {
  const mainTable = document.getElementById("tableBody");
  const selectedProductsTable = document.getElementById("selectedProductsBody");
  const searchInput = document.getElementById("searchInput");
  const prevPageButton = document.getElementById("prevPage");
  const nextPageButton = document.getElementById("nextPage");
  const pageNumber = document.getElementById("pageNumber");

  const rowsPerPage = 10;
  let currentPage = 1;
  let products = [];
  let filteredProducts = [];

  const authToken = sessionStorage.getItem("authToken");
  fetch(`${baseURL}/api/GetAllProducts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      products = data;
      filteredProducts = products;
      renderTable();
    })
    .catch((error) => console.error("Error fetching data:", error));

  function renderTable() {
    mainTable.innerHTML = "";
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageProducts = filteredProducts.slice(start, end);

    pageProducts.forEach((product) => {
      const row = document.createElement("tr");

      const productId = product.ProductID;
      const productName = product.Name;
      const offerStatus = product.Offer?.IsActive === false ? "Available" : "Not Available";
      const price = `$${parseFloat(product.Price).toFixed(2)}`;
      const status =
        product.Status === "in stock"
          ? "In Stock"
          : product.Status === "out of stock"
          ? "Out of Stock"
          : "Running Low";
      const quantity = product.Quantity;

      row.innerHTML = `
        <td><strong>#${productId}</strong></td>
        <td>${productName}</td>
        <td><span class="badge bg-${offerStatus === "Available" ? "success" : "danger"}">${offerStatus}</span></td>
        <td>${price}</td>
        <td><span class="badge bg-${
          status === "In Stock" ? "success" : status === "Out of Stock" ? "danger" : "warning"
        }">${status}</span></td>
        <td class="main-quantity">${quantity}</td>
        <td>
            <button class="btn btn-outline-primary add-to-selected" ${quantity <= 0 ? "disabled" : ""}>
                <i class="icofont-plus text-primary"></i>
            </button>
        </td>
      `;
      mainTable.appendChild(row);
    });

    updatePaginationControls();
    updatePageNumber();
  }

  function updatePaginationControls() {
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage * rowsPerPage >= filteredProducts.length;
  }

  function updatePageNumber() {
    const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
    pageNumber.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();
    filteredProducts = products.filter((product) => {
      return (
        product.Name.toLowerCase().includes(searchTerm) ||
        product.ProductID.toString().includes(searchTerm)
      );
    });
    currentPage = 1;
    renderTable();
  });

  prevPageButton.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  nextPageButton.addEventListener("click", function () {
    if (currentPage * rowsPerPage < filteredProducts.length) {
      currentPage++;
      renderTable();
    }
  });

  // Event listeners for product selection logic
  mainTable.addEventListener("click", handleMainTableClick);
  selectedProductsTable.addEventListener("click", handleSelectedProductsClick);

  function handleMainTableClick(event) {
    // Similar logic as in original code...
  }

  function handleSelectedProductsClick(event) {
    // Similar logic as in original code...
  }
}
