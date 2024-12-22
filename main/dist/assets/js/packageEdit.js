

function getPackageIdFormUrl(){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('packageID');
}
// console.log(getPackageIdFormUrl());
const params = getPackageIdFormUrl();

document.addEventListener("DOMContentLoaded",() =>{
    const apiUrl = `http://35.234.135.60:5000/api/packages/${params}`;
    fetch(apiUrl,
    {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            cookie: 'authToken=' + sessionStorage.getItem("authToken"),
        },
    }

    ).then((response)=>{
        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }).then((data)=>{
        fillInTheFields(data);
    })

});

function fillInTheFields(data){
    $("#packageName").val(data.Name);
    $("#packagePrice").val(data.Price);
    $("#packageQuantity").val(data.Quantity);
    $("#packageDescription").val(data.Description);

    const selectedCategoriesList = document.getElementById("selectedCategoriesList");
    const li = document.createElement("li");
    li.textContent = data.SubCategory.Name;
    li.id = data.SubCategory.SubCategoryID;
    selectedCategoriesList.appendChild(li);
    li.style.fontWeight = "bold";  

    

    data.PackageProduct.forEach(product => {
        const row = document.createElement('tr');
  
        const productIdCell = document.createElement('td');
        productIdCell.innerHTML = `<strong>#${product.Product.ProductID}</strong>`;
  
        const productNameCell = document.createElement('td');
        productNameCell.textContent = product.Product.Name;
  
        const quantityCell = document.createElement('td');
        quantityCell.innerHTML = `
          <div class="input-group">
            <button class="btn btn-outline-secondary decrease-quantity">-</button>
            <input type="text" class="form-control text-center quantity-input" value="${product.Quantity}" readonly>
            <button class="btn btn-outline-secondary increase-quantity">+</button>
          </div>
        `;
  
        const mainQuantityCell = document.createElement('td');
        mainQuantityCell.classList.add('main-quantity');
        mainQuantityCell.textContent = product.Product.Quantity;
  
        const actionCell = document.createElement('td');
        actionCell.innerHTML = `
          <button class="btn btn-outline-danger remove-from-selected">
            <i class="icofont-ui-delete text-danger"></i>
          </button>
        `;
  
        actionCell.querySelector('.remove-from-selected').addEventListener('click', () => {
          row.remove();
        });
  
        row.appendChild(productIdCell);
        row.appendChild(productNameCell);
        row.appendChild(quantityCell);
        row.appendChild(mainQuantityCell);
        row.appendChild(actionCell);
  
        selectedProductsBody.appendChild(row);
      });
      
      
      const imageResources = data.Resource.filter(resource => resource.fileType.startsWith('image/'));
      imageResources.forEach(image => displayImage(image.filePath, false));
      const videoResources = data.Resource.filter(resource => resource.fileType.startsWith('video/'));
      if (videoResources.length > 0) {
          displayVideo(`http://35.234.135.60:5000/${videoResources[0].filePath}`);
      }
}


       // this code when admin selected product 
       document.addEventListener("DOMContentLoaded", function () {
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
    
        fetch("http://35.234.135.60:5000/api/GetAllProducts")
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
                    <td><span class="badge bg-${status === "In Stock" ? "success" : status === "Out of Stock" ? "danger" : "warning"}">${status}</span></td>
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
    
        mainTable.addEventListener("click", function (event) {
            if (event.target.closest(".add-to-selected")) {
                const row = event.target.closest("tr");
                const productName = row.children[1].textContent.trim();
                const quantityCell = row.querySelector(".main-quantity");
                let mainQuantity = parseInt(quantityCell.textContent, 10);
    
                if (mainQuantity > 0) {
                    const existingRow = Array.from(selectedProductsTable.rows).find(
                        (r) => r.children[1].textContent.trim() === productName
                    );
    
                    if (existingRow) {
                        const quantityInput = existingRow.querySelector(".quantity-input");
                        quantityInput.value = parseInt(quantityInput.value, 10) + 1;
                        mainQuantity -= 1;
                    } else {
                        const clonedRow = row.cloneNode(true);
                        clonedRow.deleteCell(3); 
                        clonedRow.deleteCell(2); 
    
                        const selectedQuantity = 1;
                        mainQuantity -= selectedQuantity;
    
                        const actionCell = clonedRow.querySelector("td:last-child");
                        actionCell.innerHTML = `
                            <button class="btn btn-outline-danger remove-from-selected">
                                <i class="icofont-ui-delete text-danger"></i>
                            </button>
                        `;
    
                        const quantityCellClone = clonedRow.children[2];
                        quantityCellClone.innerHTML = `
                            <div class="input-group">
                                <button class="btn btn-outline-secondary decrease-quantity">-</button>
                                <input type="text" class="form-control text-center quantity-input" value="${selectedQuantity}" readonly>
                                <button class="btn btn-outline-secondary increase-quantity">+</button>
                            </div>
                        `;
    
                        selectedProductsTable.appendChild(clonedRow);
                    }
    
                    quantityCell.textContent = mainQuantity;
                    if (mainQuantity <= 0) {
                        row.querySelector(".add-to-selected").disabled = true;
                    }
                }
            }
        });
selectedProductsTable.addEventListener("click", function (event) {
const target = event.target;

if (target.closest(".decrease-quantity")) {
    const row = target.closest("tr");
    const quantityInput = row.querySelector(".quantity-input");
    const currentQuantity = parseInt(quantityInput.value, 10);
    const productName = row.children[1].textContent.trim();

    if (currentQuantity > 1) {
        quantityInput.value = currentQuantity - 1;

        // Update the main product table quantity
        const mainRow = Array.from(mainTable.rows).find(
            (r) => r.children[1].textContent.trim() === productName
        );

        if (mainRow) {
            const mainQuantityCell = mainRow.querySelector(".main-quantity");
            let mainQuantity = parseInt(mainQuantityCell.textContent, 10);
            mainQuantity += 1;
            mainQuantityCell.textContent = mainQuantity;

            mainRow.querySelector(".add-to-selected").disabled = false;
        }
    }
}

if (target.closest(".increase-quantity")) {
    const row = target.closest("tr");
    const quantityInput = row.querySelector(".quantity-input");
    const currentQuantity = parseInt(quantityInput.value, 10);
    const productName = row.children[1].textContent.trim();

    // Update the main product table quantity
    const mainRow = Array.from(mainTable.rows).find(
        (r) => r.children[1].textContent.trim() === productName
    );

    if (mainRow) {
        const mainQuantityCell = mainRow.querySelector(".main-quantity");
        let mainQuantity = parseInt(mainQuantityCell.textContent, 10);

        if (mainQuantity > 0) {
            quantityInput.value = currentQuantity + 1;
            mainQuantity -= 1;
            mainQuantityCell.textContent = mainQuantity;

            if (mainQuantity <= 0) {
                mainRow.querySelector(".add-to-selected").disabled = true;
            }
        }
    }
}
});

        selectedProductsTable.addEventListener("click", function (event) {
            if (event.target.closest(".remove-from-selected")) {
                const row = event.target.closest("tr");
                const productName = row.children[1].textContent.trim();
                const quantityInput = row.querySelector(".quantity-input");
                const selectedQuantity = parseInt(quantityInput.value, 10);
    
                const mainRow = Array.from(mainTable.rows).find(
                    (r) => r.children[1].textContent.trim() === productName
                );
    
                if (mainRow) {
                    const mainQuantityCell = mainRow.querySelector(".main-quantity");
                    let mainQuantity = parseInt(mainQuantityCell.textContent, 10);
                    mainQuantity += selectedQuantity;
                    mainQuantityCell.textContent = mainQuantity;
    
                    mainRow.querySelector(".add-to-selected").disabled = false;
                }
    
                row.remove();
            }
        });
    });
    



// ---------------------------- Fetch Categories and Subcategories ----------------------------
let selectedCategoryId = null;

// Fetch categories and subcategories data from API
fetch('http://35.234.135.60:5000/api/categories/subcategories')
    .then(response => response.json())
    .then(data => {
        const categorySelect = document.getElementById('categorySelect');

        // Loop through the categories and add only those with subcategories
        data.forEach(category => {
            if (category.SubCategory && category.SubCategory.length > 0) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = category.Name;

                // Loop through subcategories and add them as options
                category.SubCategory.forEach(subCategory => {
                    const option = document.createElement('option');
                    option.value = subCategory.SubCategoryID;  // Store SubCategory ID in the option's value
                    option.textContent = subCategory.Name;
                    optgroup.appendChild(option);
                });

                // Append optgroup to the select element
                categorySelect.appendChild(optgroup);
            }
        });
    })
    .catch(error => {
        console.error('Error fetching categories:', error);
    });

// Event listener for category selection
document.getElementById('categorySelect').addEventListener('change', function(event) {
    const selectedCategoriesList = document.getElementById('selectedCategoriesList');
    selectedCategoriesList.innerHTML = '';  // Clear previously selected categories

    // Get selected category name and ID
    const selectedOption = event.target.options[event.target.selectedIndex];
    if (selectedOption) {
        // Save the selected category ID
        selectedCategoryId = selectedOption.value;  // This will store the SubCategory ID

        // Display the selected category name
        const listItem = document.createElement('li');
        listItem.textContent = selectedOption.textContent;
        selectedCategoriesList.appendChild(listItem);
    }
});

// Function to get the selected category ID for later use in adding a product
function getSelectedCategoryId() {
    return selectedCategoryId;
}

document.addEventListener('DOMContentLoaded', function () {
    const categorySelect = document.getElementById('categorySelect');
    const selectedCategoriesList = document.getElementById('selectedCategoriesList');

    categorySelect.addEventListener('dblclick', function (event) {
        const selectedOption = event.target;

        if (selectedOption.tagName === 'OPTION') {
            selectedCategoriesList.innerHTML = '';

            const listItem = document.createElement('li');
            listItem.textContent = selectedOption.textContent;  
            listItem.setAttribute('data-value', selectedOption.value); 

            selectedCategoriesList.appendChild(listItem);
        }
    });

    selectedCategoriesList.addEventListener('click', function (event) {
        const clickedItem = event.target;

        if (clickedItem.tagName === 'LI') {
            const value = clickedItem.getAttribute('data-value');

            clickedItem.remove();

            const option = categorySelect.querySelector(`option[value="${value}"]`);
            if (option) option.disabled = false;
        }
    });
});


// ---------------------------- Image Upload ----------------------------
const uploadedImagesContainer = document.getElementById('uploaded-images');
const imageUploader = document.getElementById("image-uploader");
const fileLimitWarning = document.getElementById('file-limit-warning');
const fileSizeWarning = document.getElementById('file-size-warning');

let uploadedImagesCount = 0;
let selectedFiles = [];

function removeSelectedFile(file) {
    const index = selectedFiles.indexOf(file);
    if (index !== -1) {
        selectedFiles.splice(index, 1);
    }
}
function displayImage(fileOrUrl, isFile = true) { 
    uploadedImagesCount++;

    const filePath = isFile ? URL.createObjectURL(fileOrUrl) : `http://35.234.135.60:5000${fileOrUrl.replace(/\\/g, '/')}`;

    const imgElement = document.createElement('img');
    imgElement.src = filePath;
    imgElement.style.width = '100px';
    imgElement.style.height = '100px';
    imgElement.style.objectFit = 'cover';
    imgElement.className = 'rounded border';
    imgElement.onerror = () => {
        console.error('Failed to load image:', filePath);
        imgElement.src = 'fallback-image.png';
    };

    const removeButton = document.createElement('button');
    removeButton.innerHTML = '&times;';
    removeButton.className = 'btn btn-sm btn-danger position-absolute top-0 end-0';
    removeButton.style.margin = '-5px';
    removeButton.style.zIndex = '1';

    const wrapper = document.createElement('div');
    wrapper.className = 'position-relative d-inline-block';
    wrapper.appendChild(imgElement);
    wrapper.appendChild(removeButton);

    uploadedImagesContainer.appendChild(wrapper);

    removeButton.addEventListener('click', () => {
        wrapper.remove();
        uploadedImagesCount--;
        fileLimitWarning.style.display = 'none';
    });

    console.log('Image added:', filePath);
}



imageUploader.addEventListener('change', function(event) {
    const files = event.target.files;
    let validFiles = [];

    Array.from(files).forEach(file => {
        if (file.size > 2 * 1024 * 1024) { 
            fileSizeWarning.style.display = 'block';
        } else {
            fileSizeWarning.style.display = 'none';
            validFiles.push(file);
        }
    });

    if (uploadedImagesCount + validFiles.length > 5) {
        fileLimitWarning.style.display = 'block';
        event.target.value = ''; 
        return;
    }

    fileLimitWarning.style.display = 'none';

    validFiles.forEach(file => {
        uploadedImagesCount++;
        selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = function(e) {
            const imgElement = document.createElement('img');
            imgElement.src = e.target.result;
            imgElement.style.width = '100px';
            imgElement.style.height = '100px';
            imgElement.style.objectFit = 'cover';
            imgElement.className = 'rounded border uploaded-image'; 

            const removeButton = document.createElement('button');
            removeButton.innerHTML = '&times;';
            removeButton.className = 'btn btn-sm btn-danger position-absolute top-0 end-0';
            removeButton.style.margin = '-5px';
            removeButton.style.zIndex = '1';

            const wrapper = document.createElement('div');
            wrapper.className = 'position-relative d-inline-block';
            wrapper.appendChild(imgElement);
            wrapper.appendChild(removeButton);

            uploadedImagesContainer.appendChild(wrapper);

            removeButton.addEventListener('click', () => {
                wrapper.remove();
                uploadedImagesCount--;
                removeSelectedFile(file);
                fileLimitWarning.style.display = 'none';
            });
        };
        reader.readAsDataURL(file);
    });

    event.target.value = '';
});

function displayVideo(videoUrl) {
    const correctedUrl = videoUrl.replace(/\/\//g, '/').replace(':/', '://');
    videoPreview.src = correctedUrl;
    videoPreview.type = "video/mp4";
    videoPreview.controls = true;
    videoPreviewContainer.style.display = "block";

}


        // ----------------------------upload one vedio ---------------------------------------
        document.getElementById("videoInput").addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (!file) return;
        
            if (file.size > 10 * 1024 * 1024) {
                document.getElementById("errorText").style.display = "block";
                this.value = ""; 
                return;
            }
        
            const videoPreviewContainer = document.getElementById("videoPreviewContainer");
            const videoPreview = document.getElementById("videoPreview");
            const fileURL = URL.createObjectURL(file);
        
            videoPreview.src = fileURL; 
            videoPreviewContainer.style.display = "block"; 
        });
        
        document.getElementById("deleteVideoButton").addEventListener("click", function () {
            const videoInput = document.getElementById("videoInput");
            const videoPreviewContainer = document.getElementById("videoPreviewContainer");
            const videoPreview = document.getElementById("videoPreview");
        
            videoInput.value = "";
            videoPreview.src = "";
            videoPreviewContainer.style.display = "none";
            document.getElementById("errorText").style.display = "none"; 
        });
        

        
        params
        //------------------
        document.getElementById('submitButton').addEventListener('click', async function (e) {
            e.preventDefault();
        
            try {
                // Collect package details
                const name = document.getElementById('packageName').value.trim();
                const description = document.getElementById('packageDescription').value.trim();
                const price = parseFloat(document.getElementById('packagePrice').value);
                const packageQuantity = parseInt(document.getElementById('packageQuantity').value, 10);
                const subCategoryId = getSelectedCategoryId();
        
               
        
                // Collect selected products
                const selectedProducts = [];
                document.querySelectorAll('#selectedProductsBody tr').forEach(row => {
                    const productName = row.children[1].textContent.trim();
                    const productQuantity = parseInt(row.querySelector('.quantity-input').value, 10);
                    selectedProducts.push({
                        productName,
                        quantity: productQuantity,
                    });
                });
        
                // Initialize FormData
                const formData = new FormData();
                formData.append('Name', name);
                formData.append('Description', description);
                formData.append('Price', price);
                formData.append('Quantity', packageQuantity);
                formData.append('SubCategoryId', subCategoryId);
                formData.append('products', JSON.stringify(selectedProducts));
        
                // Handle image uploads
                selectedFiles.forEach(file => {
                    formData.append("images", file);
                });
            
        
                // Handle video upload
                const videoFile = document.getElementById('videoInput').files[0];
                if (videoFile) {
                    formData.append('videos', videoFile);
                }

                
        
                // Debugging FormData contents
                console.log('FormData contents:');
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }
        
                // Submit data to the API
                const response = await fetch(`http://35.234.135.60:5000/api/packages/${params}`, {
                    method: 'PUT',
                    body: formData,
                });
        
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
        
                const result = await response.json();
                console.log('Success:', result);
        
                // Store the success message in localStorage
                localStorage.setItem('responseMessage', 'Package added successfully!');
                localStorage.setItem('responseSuccess', 'true');
        
                // Refresh the page
                window.location.reload();
            } catch (error) {
                console.error('Error submitting the package:', error);
        
                // Show error message without refreshing the page
                showMessage('An error occurred while submitting the package. Check the console for details.', false);
            }
        });

                // Display message after page refresh
                window.addEventListener('load', () => {
                    const message = localStorage.getItem('responseMessage');
                    const isSuccess = localStorage.getItem('responseSuccess') === 'true';
                
                    if (message) {
                        showMessage(message, isSuccess);
                        localStorage.removeItem('responseMessage');
                        localStorage.removeItem('responseSuccess');
                    }
                });
                