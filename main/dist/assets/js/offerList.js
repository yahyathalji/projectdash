// Ensure that jQuery and DataTables libraries are loaded before this script
// Example HTML includes:
// <table id="myOffersTable" class="display">
//   <thead>
//     <tr>
//       <th>Offer ID</th>
//       <th>Product/Package Name</th>
//       <th>Discount (%)</th>
//       <th>Valid From</th>
//       <th>Valid To</th>
//       <th>Status</th>
//       <th>Actions</th>
//     </tr>
//   </thead>
//   <tbody id="offersTableBody">
//     <!-- Dynamic Rows Will Be Inserted Here -->
//   </tbody>
// </table>

// Initialize DataTable with desired configurations
function initializeDataTable() {
    // Check if DataTable is already initialized to prevent reinitialization errors
    if ($.fn.DataTable.isDataTable("#myOffersTable")) {
      $("#myOffersTable").DataTable().clear().destroy();
    }
  
    $("#myOffersTable").DataTable({
      responsive: true,
      paging: true,
      searching: true,
      info: true,
      lengthMenu: [10, 25, 50, 100],
      pageLength: 10, // Default to show 10 rows
      columnDefs: [
        { targets: [-1, -3], className: "dt-body-right" }, // Adjust alignment for specific columns
      ],
      language: {
        search: "Search Offers:",
        lengthMenu: "Show _MENU_ offers per page",
        info: "Showing _START_ to _END_ of _TOTAL_ offers",
        zeroRecords: "No matching offers found",
        emptyTable: "No offers available",
      },
      // Optional: Add other DataTable configurations as needed
    });
  }
  
  // Event listener for DOMContentLoaded to ensure the DOM is fully loaded before executing scripts
  document.addEventListener("DOMContentLoaded", async () => {
    const offersTableBody = document.getElementById("offersTableBody");
    if (!offersTableBody) {
      console.error("Element 'offersTableBody' is not found in the DOM.");
      return;
    }
  
    // Populate the table with offers data
    await populateOffers(offersTableBody);
  
    // Initialize DataTable after populating the table
    initializeDataTable();
  });
  
  /**
   * Fetch data from the specified URL with proper headers and credentials.
   * @param {string} url - The API endpoint to fetch data from.
   * @returns {Promise<Array>} - Returns a promise that resolves to an array of offers.
   */
  async function fetchData(url) {
    try {
      console.log(`Fetching data from: ${url}`);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          // Note: Browsers do not allow setting the 'cookie' header manually.
          // Cookies are handled automatically based on the domain and path.
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error fetching data. Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Data fetched:", data);
  
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      return [];
    }
  }
  
  /**
   * Populate the offers table with data fetched from the API.
   * @param {HTMLElement} offersTableBody - The tbody element where rows will be inserted.
   */
  async function populateOffers(offersTableBody) {
    const offers = await fetchData("http://localhost:5000/api/offers");
  
    // Validate that the fetched data is an array
    if (!Array.isArray(offers)) {
      console.error("Expected an array of offers, but received:", offers);
      offersTableBody.innerHTML = "<tr><td colspan='7'>Failed to load offers.</td></tr>";
      return;
    }
  
    // Clear any existing rows in the table body
    offersTableBody.innerHTML = "";
  
    // Iterate through each offer and create a table row
    offers.forEach((offer) => {
      // Extract Offer details
      const offerDetails = offer.Offer || {};
  
      const offerID = offerDetails.OfferID || "N/A";
      const discount = offerDetails.Discount !== undefined ? offerDetails.Discount : "N/A";
      const isActive = offerDetails.IsActive !== undefined ? offerDetails.IsActive : false;
      const validFrom = offerDetails.ValidFrom || "N/A";
      const validTo = offerDetails.ValidTo || "N/A";
  
      // Determine the type of offer: Product or Package
      let offerType = "Unknown";
      let offerName = "N/A";
  
      if (offer.ProductID) {
        offerType = "Product";
        offerName = offer.Name || "N/A";
      } else if (offer.PackageID) {
        offerType = "Package";
        offerName = offer.Name || "N/A";
      }
  
      // Format dates
      const formattedValidFrom = validFrom !== "N/A" ? formatDate(validFrom) : "N/A";
      const formattedValidTo = validTo !== "N/A" ? formatDate(validTo) : "N/A";
  
      // Create a table row element
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${offerID}</td>
        <td>${offerName}</td>
        <td class="discount-cell">${discount !== "N/A" ? discount + "%" : "N/A"}</td>
        <td class="valid-from-cell">${formattedValidFrom}</td>
        <td class="valid-to-cell">${formattedValidTo}</td>
        <td>
          <span class="badge ${
            isActive ? "bg-success" : "bg-danger"
          }">
            ${isActive ? "Available" : "Not Available"}
          </span>
        </td>
        <td class="action-cell">
          <button class="btn btn-outline-secondary edit-offer" data-id="${offerID}">
            <i class="fa fa-edit"></i> Edit
          </button>
        </td>
      `;
      offersTableBody.appendChild(row);
  
      // Add event listener for the edit button
      row.querySelector(".edit-offer").addEventListener("click", () => {
        makeRowEditable(row, offerID);
      });
    });
  }
  
  /**
   * Make a specific table row editable by replacing cells with input fields.
   * @param {HTMLTableRowElement} row - The table row to make editable.
   * @param {string|number} offerId - The unique identifier for the offer.
   */
  function makeRowEditable(row, offerId) {
    console.log("Making row editable for offer ID:", offerId);
  
    const discountCell = row.querySelector(".discount-cell");
    const validFromCell = row.querySelector(".valid-from-cell");
    const validToCell = row.querySelector(".valid-to-cell");
    const actionCell = row.querySelector(".action-cell");
  
    // Store original values in dataset attributes for potential cancellation
    row.dataset.originalDiscount = discountCell.textContent.trim().replace("%", "");
    row.dataset.originalValidFrom = validFromCell.textContent.trim();
    row.dataset.originalValidTo = validToCell.textContent.trim();
  
    // Replace cells with input fields
    discountCell.innerHTML = `<input type="number" class="form-control" value="${row.dataset.originalDiscount}" min="0" max="100" step="0.01">`;
    validFromCell.innerHTML = `<input type="date" class="form-control" value="${convertToInputDateFormat(
      row.dataset.originalValidFrom
    )}">`;
    validToCell.innerHTML = `<input type="date" class="form-control" value="${convertToInputDateFormat(
      row.dataset.originalValidTo
    )}">`;
  
    // Replace action buttons with Save and Cancel buttons
    actionCell.innerHTML = `
      <button class="btn btn-outline-primary save-edit">
        <i class="fa fa-save"></i> Save
      </button>
      <button class="btn btn-outline-secondary cancel-edit">
        <i class="fa fa-times"></i> Cancel
      </button>
    `;
  
    // Add event listeners for Save and Cancel buttons
    actionCell.querySelector(".save-edit").addEventListener("click", () => {
      saveRowChanges(row, offerId);
    });
  
    actionCell.querySelector(".cancel-edit").addEventListener("click", () => {
      cancelRowEdit(row);
    });
  }
  
  /**
   * Save the changes made to a table row by sending a PUT request to the API.
   * @param {HTMLTableRowElement} row - The table row containing the edited data.
   * @param {string|number} offerId - The unique identifier for the offer.
   */
  async function saveRowChanges(row, offerId) {
    try {
      console.log("Saving changes for offer ID:", offerId);
  
      const discountCell = row.querySelector(".discount-cell");
      const validFromCell = row.querySelector(".valid-from-cell");
      const validToCell = row.querySelector(".valid-to-cell");
      const actionCell = row.querySelector(".action-cell");
  
      const updatedDiscountInput = discountCell.querySelector("input").value;
      const updatedValidFromInput = validFromCell.querySelector("input").value;
      const updatedValidToInput = validToCell.querySelector("input").value;
  
      const updatedDiscount =
        updatedDiscountInput !== ""
          ? parseFloat(updatedDiscountInput)
          : parseFloat(row.dataset.originalDiscount);
      const updatedValidFrom =
        updatedValidFromInput !== "" ? updatedValidFromInput : row.dataset.originalValidFrom;
      const updatedValidTo =
        updatedValidToInput !== "" ? updatedValidToInput : row.dataset.originalValidTo;
  
      // Validate the inputs
      if (isNaN(updatedDiscount) || updatedDiscount < 0 || updatedDiscount > 100) {
        alert("Please enter a valid discount between 0 and 100.");
        return;
      }
  
      if (!isValidDate(updatedValidFrom) || !isValidDate(updatedValidTo)) {
        alert("Please enter valid dates for Valid From and Valid To.");
        return;
      }
  
      if (new Date(updatedValidFrom) > new Date(updatedValidTo)) {
        alert("Valid From date cannot be after Valid To date.");
        return;
      }
  
      // Prepare data for the PUT request
      const updatedData = {
        Discount: updatedDiscount.toString(), // Assuming API expects a string
        ValidFrom: new Date(updatedValidFrom).toISOString(),
        ValidTo: new Date(updatedValidTo).toISOString(),
      };
  
      // Send PUT request to update the offer
      const response = await fetch(`http://localhost:5000/api/offers/${offerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(updatedData),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update offer ID ${offerId}. Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Offer updated successfully:", data);
  
      // Update the table row with new data
      discountCell.innerHTML = `${updatedDiscount}%`;
      validFromCell.innerHTML = formatDate(updatedValidFrom);
      validToCell.innerHTML = formatDate(updatedValidTo);
  
      // Update the status badge based on the new dates
      const todayDate = new Date();
      const validFromDate = new Date(updatedValidFrom);
      const validToDate = new Date(updatedValidTo);
  
      let status = "Not Available";
      if (todayDate >= validFromDate && todayDate <= validToDate) {
        status = "Available";
      }
  
      const badge = row.querySelector(".badge");
      badge.textContent = status;
      badge.className = `badge ${status === "Available" ? "bg-success" : "bg-danger"}`;
  
      // Replace action buttons with the Edit button
      actionCell.innerHTML = `
        <button class="btn btn-outline-secondary edit-offer" data-id="${offerId}">
          <i class="fa fa-edit"></i> Edit
        </button>
      `;
  
      // Add event listener to the new Edit button
      actionCell.querySelector(".edit-offer").addEventListener("click", () => {
        makeRowEditable(row, offerId);
      });
  
      // Optional: Refresh the DataTable to reflect changes
      // initializeDataTable();
  
      alert("Offer updated successfully!");
    } catch (error) {
      console.error("Error updating the offer:", error);
      alert("Failed to update the offer. Please try again.");
    }
  }
  
  /**
   * Cancel the edit operation and restore the original row data.
   * @param {HTMLTableRowElement} row - The table row to restore.
   */
  function cancelRowEdit(row) {
    // Restore original values from dataset attributes
    const discountCell = row.querySelector(".discount-cell");
    const validFromCell = row.querySelector(".valid-from-cell");
    const validToCell = row.querySelector(".valid-to-cell");
    const actionCell = row.querySelector(".action-cell");
  
    discountCell.innerHTML = `${row.dataset.originalDiscount}%`;
    validFromCell.innerHTML = row.dataset.originalValidFrom;
    validToCell.innerHTML = row.dataset.originalValidTo;
  
    // Restore action buttons with the Edit button
    const offerId = row.querySelector(".edit-offer")?.dataset.id || "N/A";
    actionCell.innerHTML = `
      <button class="btn btn-outline-secondary edit-offer" data-id="${offerId}">
        <i class="fa fa-edit"></i> Edit
      </button>
    `;
  
    // Add event listener to the restored Edit button
    actionCell.querySelector(".edit-offer").addEventListener("click", () => {
      makeRowEditable(row, offerId);
    });
  
    console.log("Edit cancelled for offer ID:", offerId);
  }
  
  /**
   * Format a date string into 'YYYY-MM-DD' format.
   * @param {string} dateString - The date string to format.
   * @returns {string} - The formatted date string.
   */
  function formatDate(dateString) {
    if (!dateString) return "N/A";
  
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid Date";
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Convert a date string to a format suitable for HTML input fields.
   * Assumes the input date is in 'YYYY-MM-DD' or similar format.
   * @param {string} dateString - The date string to convert.
   * @returns {string} - The converted date string.
   */
  function convertToInputDateFormat(dateString) {
    // If the date is in 'YYYY-MM-DD' format, return as is
    // Otherwise, attempt to parse and format it
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Validate whether a given string is a valid date.
   * @param {string} dateString - The date string to validate.
   * @returns {boolean} - Returns true if valid, false otherwise.
   */
  function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date);
  }
  