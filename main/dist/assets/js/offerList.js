// Initialize DataTable
function initializeDataTable() {
    $('#myOffersTable').DataTable({
        responsive: true,
        paging: true,
        searching: true,
        info: true,
        lengthMenu: [10, 25, 50, 100],
        pageLength: 10, // Default to show 10 rows
        columnDefs: [
            { targets: [-1, -3], className: 'dt-body-right' }
        ],
        language: {
            search: "Search Offers:",
            lengthMenu: "Show _MENU_ offers per page",
            info: "Showing _START_ to _END_ of _TOTAL_ offers",
            zeroRecords: "No matching offers found",
            emptyTable: "No offers available",
        }
    });
}
    
        document.addEventListener("DOMContentLoaded", async () => {
            const offersTableBody = document.getElementById("offersTableBody");
            if (!offersTableBody) {
                console.error("Element 'offersTableBody' is not found in the DOM.");
                return;
            }
    
            await populateOffers(offersTableBody);
    
            initializeDataTable();
        });
    
        async function fetchData(url) {
            try {
                console.log(`Fetching data from: ${url}`);
                const response = await fetch(url);
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
    
        async function populateOffers(offersTableBody) {
            const offers = await fetchData("http://localhost:3000/api/offers");
            offersTableBody.innerHTML = ""; 
    
            offers.forEach(offer => {
                const formattedValidFrom = formatDate(offer.ValidFrom);
                const formattedValidTo = formatDate(offer.ValidTo);
    
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${offer.OfferID}</td>
                    <td>${offer.Products?.[0]?.Name || offer.Packages?.[0]?.Name}</td>
                    <td class="discount-cell">${offer.Discount}%</td>
                    <td class="valid-from-cell">${formattedValidFrom}</td>
                    <td class="valid-to-cell">${formattedValidTo}</td>
                    <td><span class="badge ${offer.IsActive ? 'bg-success' : 'bg-danger'}">${offer.IsActive ? "Available" : "Not-available"}</span></td>
                    <td class="action-cell">
                        <button class="btn btn-outline-secondary edit-offer" data-id="${offer.OfferID}">
                            <i class="fa fa-edit"></i> Edit
                        </button>
                    </td>
                `;
                offersTableBody.appendChild(row);
    
                row.querySelector('.edit-offer').addEventListener('click', () => {
                    makeRowEditable(row, offer.OfferID);
                });
            });
        }
    
        function makeRowEditable(row, offerId) {
            console.log("Making row editable for offer ID:", offerId);
    
            const discountCell = row.querySelector('.discount-cell');
            const validFromCell = row.querySelector('.valid-from-cell');
            const validToCell = row.querySelector('.valid-to-cell');
            const actionCell = row.querySelector('.action-cell');
    
            row.dataset.originalDiscount = discountCell.textContent.trim().replace('%', '');
            row.dataset.originalValidFrom = validFromCell.textContent.trim();
            row.dataset.originalValidTo = validToCell.textContent.trim();
    
            discountCell.innerHTML = `<input type="number" class="form-control" value="${row.dataset.originalDiscount}">`;
            validFromCell.innerHTML = `<input type="date" class="form-control" value="${row.dataset.originalValidFrom}">`;
            validToCell.innerHTML = `<input type="date" class="form-control" value="${row.dataset.originalValidTo}">`;
    
            actionCell.innerHTML = `
                <button class="btn btn-outline-primary save-edit">
                    <i class="fa fa-save"></i> Save
                </button>
            `;
    
            actionCell.querySelector('.save-edit').addEventListener('click', () => {
                saveRowChanges(row, offerId);
            });
        }
    
        async function saveRowChanges(row, offerId) {
            try {
                console.log("Saving changes for offer ID:", offerId);
    
                const discountCell = row.querySelector('.discount-cell');
                const validFromCell = row.querySelector('.valid-from-cell');
                const validToCell = row.querySelector('.valid-to-cell');
                const actionCell = row.querySelector('.action-cell');
    
                const updatedDiscount = parseFloat(discountCell.querySelector('input').value) || parseFloat(row.dataset.originalDiscount);
                let updatedValidFrom = validFromCell.querySelector('input').value || row.dataset.originalValidFrom;
                let updatedValidTo = validToCell.querySelector('input').value || row.dataset.originalValidTo;
    
                updatedValidFrom = formatDate(updatedValidFrom);
                updatedValidTo = formatDate(updatedValidTo);
    
                const updatedData = {
                    Discount: updatedDiscount,
                    ValidFrom: updatedValidFrom,
                    ValidTo: updatedValidTo
                };
    
                const response = await fetch(`http://localhost:3000/api/offers/${offerId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedData)
                });
    
                if (!response.ok) {
                    throw new Error(`Failed to update offer ID ${offerId}. Status: ${response.status}`);
                }
    
                const data = await response.json();
                console.log("Offer updated successfully:", data);
    
                discountCell.innerHTML = `${updatedDiscount}%`;
                validFromCell.innerHTML = updatedValidFrom;
                validToCell.innerHTML = updatedValidTo;
    
                const todayDate = new Date();
                const validFromDate = new Date(updatedValidFrom);
                const validToDate = new Date(updatedValidTo);
    
                let status = 'Not-available';
                if (todayDate >= validFromDate && todayDate <= validToDate) {
                    status = 'Available';
                }
                row.querySelector('.badge').textContent = status;
                row.querySelector('.badge').className = `badge ${status === 'Available' ? 'bg-success' : 'bg-danger'}`;
    
                actionCell.innerHTML = `
                    <button class="btn btn-outline-secondary edit-offer">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                `;
    
                actionCell.querySelector('.edit-offer').addEventListener('click', () => {
                    makeRowEditable(row, offerId);
                });
    
                alert("Offer updated successfully!");
            } catch (error) {
                console.error("Error updating the offer:", error);
                alert("Failed to update the offer. Please try again.");
            }
        }
    
        function formatDate(dateString) {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); 
            const day = String(date.getDate()).padStart(2, '0'); 
            return `${year}-${month}-${day}`;
        }
