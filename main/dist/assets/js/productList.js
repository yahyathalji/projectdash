document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "http://localhost:5000/search";
  const rowsPerPage = 5; // As per the search limit
  let currentPage = 1;
  let totalPages = 1;
  let currentSearchQuery = "";

  const tableBody = document.getElementById("tableBody");
  const paginationControls = document.getElementById("paginationControls");
  const searchInput = document.getElementById("searchInput");

  if (!tableBody || !paginationControls || !searchInput) {
    console.error(
      "Essential DOM elements (tableBody, paginationControls, searchInput) not found."
    );
    return;
  }

  /**
   * Fetches products based on the search query and pagination.
   * @param {string} query - The search query.
   * @param {number} page - The current page number.
   */
  async function fetchProducts(query = "", page = 1) {
    try {
      const response = await fetch(
        `${apiUrl}?page=${page}&limit=${rowsPerPage}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            search: {
              Name: query,
            },
          }),
        }
      );

      if (!response.ok) {
        console.error("Response error:", response.status, response.statusText);
        return;
      }

      const data = await response.json();

      if (!data.data || !data.data.products) {
        console.error("Invalid response structure:", data);
        return;
      }

      renderTable(data.data.products);
      setupPagination(data.metadata);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  /**
   * Renders the products into the table.
   * @param {Array} products - The list of products to render.
   */
  function renderTable(products) {
    tableBody.innerHTML = "";

    if (products.length === 0) {
      const noDataRow = document.createElement("tr");
      noDataRow.innerHTML = `
          <td colspan="7" class="text-center">No products found.</td>
        `;
      tableBody.appendChild(noDataRow);
      return;
    }

    products.forEach((product) => {
      const row = document.createElement("tr");

      row.innerHTML = `
          <td><strong>#${product.ProductID}</strong></td>
          <td>${escapeHTML(product.Name)}</td>
          <td>
            <span class="badge ${product.Offer ? "bg-success" : "bg-danger"}">${
        product.Offer ? "Available" : "Not Available"
      }</span>
          </td>
          <td>$${parseFloat(product.Price).toFixed(2)}</td>
          <td>
            <span class="badge ${
              product.Status === "in stock"
                ? "bg-success"
                : product.Status === "running low"
                ? "bg-warning"
                : "bg-danger"
            }">${escapeHTML(product.Status)}</span>
          </td>
          <td>
            <span>${product.AvgRating}</span>
            <i class="icofont-star text-warning"></i>
          </td>
          <td>
            <div class="btn-group" role="group">
              <a href="product-edit.html?productId=${
                product.ProductID
              }" class="btn btn-outline-secondary">
                <i class="icofont-edit text-success"></i>
              </a>
              <button type="button" class="btn btn-outline-danger delete-button" data-product-id="${
                product.ProductID
              }">
                <i class="icofont-ui-delete text-danger"></i>
              </button>
            </div>
          </td>
        `;
      tableBody.appendChild(row);
    });

    // Attach event listeners for delete buttons
    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", handleDeleteProduct);
    });
  }

  /**
   * Sets up pagination controls based on metadata.
   * @param {Object} metadata - The metadata from the API response.
   */
  function setupPagination(metadata) {
    paginationControls.innerHTML = "";

    totalPages = metadata.totalPages;
    currentPage = metadata.currentPage;

    if (totalPages <= 1) {
      return; // No pagination needed
    }

    // Previous Button
    const prevLi = document.createElement("li");
    prevLi.classList.add("page-item", currentPage === 1 ? "disabled" : "");
    prevLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous" onclick="goToPage(${
          currentPage - 1
        })">
          <span aria-hidden="true">&laquo;</span>
        </a>
      `;
    paginationControls.appendChild(prevLi);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageLi = document.createElement("li");
      pageLi.classList.add("page-item", i === currentPage ? "active" : "");
      pageLi.innerHTML = `
          <a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>
        `;
      paginationControls.appendChild(pageLi);
    }

    // Next Button
    const nextLi = document.createElement("li");
    nextLi.classList.add(
      "page-item",
      currentPage === totalPages ? "disabled" : ""
    );
    nextLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Next" onclick="goToPage(${
          currentPage + 1
        })">
          <span aria-hidden="true">&raquo;</span>
        </a>
      `;
    paginationControls.appendChild(nextLi);
  }

  /**
   * Navigates to the specified page.
   * @param {number} page - The page number to navigate to.
   */
  window.goToPage = function (page) {
    if (page < 1 || page > totalPages) {
      return;
    }
    currentPage = page;
    fetchProducts(currentSearchQuery, currentPage);
  };

  /**
   * Handles the search input event.
   */
  searchInput.addEventListener("input", debounce(handleSearch, 300));

  /**
   * Handles the search logic.
   */
  function handleSearch(event) {
    const query = event.target.value.trim();
    currentSearchQuery = query;
    currentPage = 1;
    fetchProducts(currentSearchQuery, currentPage);
  }

  /**
   * Debounce function to limit the rate of function execution.
   * @param {Function} func - The function to debounce.
   * @param {number} wait - The debounce delay in milliseconds.
   * @returns {Function} - The debounced function.
   */
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Escapes HTML to prevent XSS attacks.
   * @param {string} unsafe - The unsafe string to escape.
   * @returns {string} - The escaped string.
   */
  function escapeHTML(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Handles the deletion of a product.
   * @param {Event} event - The click event.
   */
  async function handleDeleteProduct(event) {
    const productId = event.currentTarget.getAttribute("data-product-id");
    if (!productId) {
      console.error("Product ID not found for deletion.");
      return;
    }

    const confirmDelete = confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) {
      return;
    }

    try {
      const deleteUrl = `http://localhost:5000/api/products/${productId}`;
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          Cookie: `authToken=${sessionStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(
          "Failed to delete product:",
          response.status,
          response.statusText
        );
        if (response.status === 400) {
          alert("you can't delete this product cause it existed on order or on package.");
        }
        if (response.status === 401) {
          alert("You are not authorized to delete this product.");
          return;
        }
        if (response.status === 404) {
          alert("Product not found.");
        }

        return;
      }

      alert("Product deleted successfully.");
      fetchProducts(currentSearchQuery, currentPage);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("An error occurred while deleting the product.");
    }
  }

  // Initial fetch of products without any search query
  fetchProducts();
});
