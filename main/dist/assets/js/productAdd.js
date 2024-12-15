<!doctype html>
<html class="no-js" lang="en" dir="ltr">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>::Fantasize:: Product Add</title>
    <link rel="icon" href="favicon.ico" type="image/x-icon"> <!-- Favicon-->

    <!-- Plugin CSS files -->
    <link rel="stylesheet" href="assets/plugin/multi-select/css/multi-select.css"><!-- Multi Select Css -->
    <link rel="stylesheet" href="assets/plugin/bootstrap-tagsinput/bootstrap-tagsinput.css"><!-- Bootstrap Tagsinput Css -->
    <link rel="stylesheet" href="assets/plugin/cropper/cropper.min.css"><!-- Cropperer Css -->   
    <link rel="stylesheet" href="assets/plugin/dropify/dist/css/dropify.min.css"/><!-- Dropify Css -->
    <link rel="stylesheet" href="assets/plugin/datatables/responsive.dataTables.min.css"><!-- Datatable Css -->
    <link rel="stylesheet" href="assets/plugin/datatables/dataTables.bootstrap5.min.css"><!-- Datatable Css -->

    <!-- Project CSS file -->
    <link rel="stylesheet" href="assets/css/ebazar.style.min.css">
</head>
<body>
    <div id="ebazar-layout" class="theme-blue">
        
        <!-- Sidebar -->
        <div id="sidebar"></div>

        <!-- Main Body Area -->
        <div class="main px-lg-4 px-md-4"> 

            <!-- Header -->
            <div id="header"></div>

            <!-- Product Add Form -->
            <form id="addProductForm" enctype="multipart/form-data">

                <div class="body d-flex py-3">
                    
                    <div class="container-xxl">
                        <div class="row align-items-center">
                            <div class="border-0 mb-4">
                                <div class="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                                    <h3 class="fw-bold mb-0">Add Product</h3>
                                    <div id="responseMessage"></div>
                                    <button type="submit" class="btn btn-primary btn-set-task w-sm-100 py-2 px-5 text-uppercase">Save</button>
                                </div>
                            </div>
                        </div> <!-- Row end  -->  
                        
                       
                        <div class="col-xl-12 col-lg-8">

                            <!-- Basic Information Card -->
                            <div class="card mb-3">
                                <div class="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                                    <h6 class="mb-0 fw-bold">Basic Information</h6>
                                </div>
                                <div class="card-body">
                                    <div class="row g-3 align-items-center">
                                        <!-- Product Name -->
                                        <div class="col-md-4">
                                            <label class="form-label" for="productName">Name</label>
                                            <input type="text" id="productName" name="Name" class="form-control" placeholder="Enter Product Name" required>
                                        </div>
                                        <!-- Quantity -->
                                        <div class="col-md-4">
                                            <label class="form-label" for="quantity">Quantity</label>
                                            <input type="number" id="quantity" name="Quantity" class="form-control" placeholder="Enter Quantity" min="0" required>
                                        </div>
                                        <!-- Price -->
                                        <div class="col-md-4">
                                            <label class="form-label" for="price">Price</label>
                                            <div class="input-group">
                                                <span class="input-group-text">$</span>
                                                <input type="number" id="price" name="Price" class="form-control" placeholder="Enter Price" min="0" step="0.01" required>
                                            </div>
                                        </div>
                                        <!-- Product Description -->
                                        <div class="col-md-12">
                                            <label class="form-label" for="description">Product Description</label>
                                            <textarea class="form-control" id="description" name="Description" rows="4" placeholder="Enter Product Description Here" required></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Brand Selection Card -->
                            <div class="card mb-3">
                                <div class="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                                    <h6 class="mb-0 fw-bold">Select a Brand</h6>
                                </div>
                                <div class="card-body">
                                    <select id="brandSelect" name="BrandID" class="ms w-100" style="font-size: 18px; padding: 10px;" required>
                                        <!-- Brands will be populated here dynamically -->
                                    </select>
                                </div>
                            </div>

                            <!-- Categories Selection Card -->
                            <div class="card mb-3"> 
                                <div class="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                                    <h6 class="mb-0 fw-bold">Categories</h6>
                                </div>
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <!-- Categories List (Single Selection) -->
                                        <div class="flex-column" style="width: 48%;">
                                            <select id="categorySelect" size="10" class="ms w-100" style="font-size: 16px; padding: 10px;" required>
                                                <!-- Categories with subcategories will be populated here -->
                                            </select>
                                        </div>
                            
                                        <!-- Selected Category List -->
                                        <div class="flex-column" style="width: 48%;">
                                            <h6 class="fw-bold">Selected Category</h6>
                                            <ul id="selectedCategoriesList" style="list-style-type: none; padding: 0;">
                                                <!-- Selected category will be added here dynamically -->
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Video Upload Card -->
                            <div class="card mb-3">
                                <div class="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                                    <h6 class="mb-0 fw-bold">Video Upload</h6>
                                </div>
                                <div class="card-body">
                                    <form id="videoUploadForm">
                                        <div class="row g-3 align-items-center">
                                            <div class="col-md-12">
                                                <label class="form-label" for="videoInput">Product Video Upload</label>
                                                <small class="d-block text-muted mb-2">
                                                    Only one video is allowed. Maximum size: 10MB.
                                                </small>
                                                <input type="file" id="videoInput" class="form-control" accept="video/*">
                                                <small id="errorText" class="text-danger mt-1" style="display: none;">
                                                    Video size exceeds the 10MB limit. Please choose a smaller file.
                                                </small>
                                            </div>
                                            <div class="col-md-12 mt-3" id="videoPreviewContainer" style="display: none;">
                                                <video id="videoPreview" controls style="width: 100%; max-height: 400px;"></video>
                                                <button type="button" id="deleteVideoButton" class="btn btn-danger mt-2">Delete Video</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <!-- Images Upload Card -->
                            <div class="card mb-3">
                                <div class="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                                    <h6 class="mb-0 fw-bold">Images</h6>
                                </div>
                                <div class="card-body">
                                    <div class="row g-3 align-items-center">
                                        <div class="col-md-12">
                                            <label class="form-label" for="image-uploader">Product Images Upload</label>
                                            <small class="d-block text-muted mb-2">Only portrait or square images, 2MB max and 2000px max-height.</small>
                                            <input type="file" id="image-uploader" class="form-control" accept="image/*" multiple>
                                            <div id="uploaded-images" class="mt-3 d-flex flex-wrap gap-2"></div>
                                            <div id="file-limit-warning" class="text-danger mt-2" style="display:none;">You can only upload a maximum of 5 images.</div>
                                            <div id="file-size-warning" class="text-danger mt-2" style="display:none;">Image size must not exceed 2MB.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        
                        </div>
                    </div><!-- Row end  --> 
                    
                </div>
            </form>

            <!-- Materials Assignment Section (Outside the Main Form) -->
            <div class="card mb-3" id="materialsAssignmentSection" style="display: none;">
                <div class="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                    <h6 class="mb-0 fw-bold">Assign Materials</h6>
                </div>
                <div class="card-body">
                    <div id="materialsContainer">
                        <!-- Material item will be dynamically generated -->
                    </div>
                    <button type="button" class="btn btn-secondary" id="addMaterialBtn">Add Another Material</button>
                    <button type="button" class="btn btn-primary" id="assignMaterialsBtn">Assign Materials</button>
                    <div id="materialsResponseMessage" class="mt-3"></div>
                </div>
            </div>

            <!-- Modal Custom Settings-->
            <div id="modal"></div>

        </div>      

    </div>

    <!-- Load Components (Sidebar, Header, Modal) -->
    <script>
        function loadComponent(selector, url) {
            fetch(url)
                .then(response => response.text())
                .then(data => {
                    document.querySelector(selector).innerHTML = data;
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }

        loadComponent('#sidebar', 'sidebar.html');
        loadComponent('#header', 'header.html');
        loadComponent('#modal', 'modal.html');
    </script>

    <!-- Jquery Core Js -->      
    <script src="assets/bundles/libscripts.bundle.js"></script>

    <!-- Jquery Plugin -->  
    <script src="assets/plugin/multi-select/js/jquery.multi-select.js"></script>
    <script src="assets/plugin/bootstrap-tagsinput/bootstrap-tagsinput.js"></script>  

    <!-- Custom Page JS -->
    <script>
    document.addEventListener('DOMContentLoaded', function () {
        // ---------------------------- Element References ----------------------------
        const addProductForm = document.getElementById('addProductForm');
        const categorySelect = document.getElementById('categorySelect');
        const selectedCategoriesList = document.getElementById('selectedCategoriesList');
        const brandSelect = document.getElementById('brandSelect');
        const materialsAssignmentSection = document.getElementById('materialsAssignmentSection');
        const addMaterialBtn = document.getElementById('addMaterialBtn');
        const assignMaterialsBtn = document.getElementById('assignMaterialsBtn');
        const materialsContainer = document.getElementById('materialsContainer');
        const materialsResponseMessage = document.getElementById('materialsResponseMessage');
        const responseMessage = document.getElementById('responseMessage');
        const imageUploader = document.getElementById("image-uploader");
        const uploadedImagesContainer = document.getElementById('uploaded-images');
        const fileLimitWarning = document.getElementById('file-limit-warning');
        const fileSizeWarning = document.getElementById('file-size-warning');
        const videoInput = document.getElementById("videoInput");
        const videoPreviewContainer = document.getElementById("videoPreviewContainer");
        const videoPreview = document.getElementById("videoPreview");
        const deleteVideoButton = document.getElementById("deleteVideoButton");
        const errorText = document.getElementById("errorText");

        // ---------------------------- State Variables ----------------------------
        let uploadedImagesCount = 0;
        let selectedFiles = [];
        let createdProductId = null; // To store the ProductID after creation
        let materialsAssigned = false; // Flag to track if materials are assigned
        let availableMaterials = []; // Will store the fetched materials

        // ---------------------------- Fetch Brands from API ----------------------------
        function fetchBrands() {
            fetch('http://localhost:5000/api/brands', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch brands');
                }
                return response.json();
            })
            .then(data => {
                // Clear existing options
                brandSelect.innerHTML = '';

                // Populate brands
                data.forEach(brand => {
                    const option = document.createElement('option');
                    option.value = brand.BrandID;
                    option.textContent = brand.Name;
                    brandSelect.appendChild(option);
                });

                // Optionally, add a 'None' option
                const noneOption = document.createElement('option');
                noneOption.value = 'none';
                noneOption.textContent = 'None';
                brandSelect.appendChild(noneOption);
            })
            .catch(error => {
                console.error('Error fetching brands:', error);
                brandSelect.innerHTML = '<option value="">Failed to load brands</option>';
            });
        }

        // ---------------------------- Fetch Categories and Subcategories ----------------------------
        function fetchCategories() {
            fetch('http://localhost:5000/api/categories/subcategories', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }
                return response.json();
            })
            .then(data => {
                data.forEach(category => {
                    if (category.SubCategory && category.SubCategory.length > 0) {
                        const optgroup = document.createElement('optgroup');
                        optgroup.label = category.Name;

                        category.SubCategory.forEach(subCategory => {
                            const option = document.createElement('option');
                            option.value = subCategory.SubCategoryID; 
                            option.textContent = subCategory.Name;
                            optgroup.appendChild(option);
                        });

                        categorySelect.appendChild(optgroup);
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
                categorySelect.innerHTML = '<option value="">Failed to load categories</option>';
            });
        }

        // ---------------------------- Fetch Materials ----------------------------
        function fetchMaterials() {
            return fetch('http://localhost:5000/material/material', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch materials');
                }
                return response.json();
            })
            .then(data => {
                availableMaterials = data;
            })
            .catch(error => {
                console.error('Error fetching materials:', error);
            });
        }

        // ---------------------------- Initialize Categories and Brands and Materials ----------------------------
        fetchBrands();
        fetchCategories();
        fetchMaterials().then(() => {
            // Materials fetched and stored
        });

        // ---------------------------- Category Selection Logic ----------------------------
        categorySelect.addEventListener('dblclick', function (event) {
            const selectedOption = event.target;

            if (selectedOption.tagName === 'OPTION' && !selectedOption.disabled) {
                // Clear previously selected categories to allow only one selection
                selectedCategoriesList.innerHTML = '';

                // Create a list item
                const listItem = document.createElement('li');
                listItem.textContent = selectedOption.textContent;
                listItem.setAttribute('data-value', selectedOption.value);
                listItem.style.cursor = 'pointer';
                listItem.title = 'Click to remove';

                // Add to selected list
                selectedCategoriesList.appendChild(listItem);

                // Disable the selected option to prevent duplicate selection
                selectedOption.disabled = true;
            }
        });

        // Remove selected category on click
        selectedCategoriesList.addEventListener('click', function (event) {
            const clickedItem = event.target;

            if (clickedItem.tagName === 'LI') {
                const value = clickedItem.getAttribute('data-value');

                // Remove from selected list
                clickedItem.remove();

                // Re-enable the option in the original select
                const option = categorySelect.querySelector(`option[value="${value}"]`);
                if (option) option.disabled = false;
            }
        });

        // ---------------------------- Materials Assignment Logic ----------------------------
        function createMaterialItem() {
            const materialCount = materialsContainer.querySelectorAll('.material-item').length + 1;
            const materialItem = document.createElement('div');
            materialItem.classList.add('material-item', 'mb-3');
            const selectID = `materialName${materialCount}`;
            const percentageID = `materialPercentage${materialCount}`;

            // Create a dropdown for materials
            let materialOptions = '';
            availableMaterials.forEach(mat => {
                materialOptions += `<option value="${mat.Name}">${mat.Name}</option>`;
            });

            materialItem.innerHTML = `
                <div class="row g-3 align-items-center">
                    <div class="col-md-6">
                        <label class="form-label" for="${selectID}">Material Name</label>
                        <select class="form-select material-name" id="${selectID}" required>
                            <option value="" disabled selected>Select a material</option>
                            ${materialOptions}
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label" for="${percentageID}">Percentage</label>
                        <input type="number" class="form-control material-percentage" id="${percentageID}" placeholder="Enter Percentage" min="0" max="100" required>
                    </div>
                    <div class="col-md-2 d-flex align-items-end">
                        <button type="button" class="btn btn-danger remove-material-btn">Remove</button>
                    </div>
                </div>
            `;
            return materialItem;
        }

        // Initial material item
        materialsContainer.appendChild(createMaterialItem());

        // Add Material Button Click
        addMaterialBtn.addEventListener('click', function () {
            materialsContainer.appendChild(createMaterialItem());
        });

        // Remove Material Item
        materialsContainer.addEventListener('click', function (e) {
            if (e.target && e.target.classList.contains('remove-material-btn')) {
                e.target.closest('.material-item').remove();
            }
        });

        // Assign Materials Button Click
        assignMaterialsBtn.addEventListener('click', function () {
            if (!createdProductId) {
                alert('Product ID not found. Please create the product first.');
                return;
            }

            const materials = [];
            const materialItems = document.querySelectorAll('.material-item');
            let totalPercentage = 0;
            let valid = true;

            materialItems.forEach(item => {
                const name = item.querySelector('.material-name').value;
                const percentage = parseInt(item.querySelector('.material-percentage').value, 10);

                if (!name || isNaN(percentage) || percentage < 0 || percentage > 100) {
                    valid = false;
                    return;
                }

                totalPercentage += percentage;
                materials.push({ name, percentage });
            });

            if (!valid) {
                alert('Please ensure all materials are selected and percentages are between 0 and 100.');
                return;
            }

            if (totalPercentage !== 100) {
                alert('Total percentage of materials must equal 100%. Currently, it is ' + totalPercentage + '%.');
                return;
            }

            const assignMaterials = {
                ProductID: createdProductId,
                Materials: materials
            };

            // Disable the assign button to prevent multiple clicks
            assignMaterialsBtn.disabled = true;
            assignMaterialsBtn.textContent = 'Assigning...';

            fetch('http://localhost:5000/material/product/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                },
                body: JSON.stringify(assignMaterials),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to assign materials');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    materialsResponseMessage.innerHTML = '<div class="alert alert-success">Materials assigned successfully!</div>';
                    materialsAssigned = true;
                    // Optionally, hide the materials assignment section
                    materialsAssignmentSection.style.display = 'none';
                    // Remove the beforeunload event listener as materials are now assigned
                    window.removeEventListener('beforeunload', beforeUnloadListener);
                } else {
                    materialsResponseMessage.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
                }
            })
            .catch(error => {
                console.error('Error assigning materials:', error);
                materialsResponseMessage.innerHTML = '<div class="alert alert-danger">Failed to assign materials.</div>';
            })
            .finally(() => {
                assignMaterialsBtn.disabled = false;
                assignMaterialsBtn.textContent = 'Assign Materials';
                setTimeout(function() {
                    materialsResponseMessage.innerHTML = '';
                }, 5000);
            });
        });

        // ---------------------------- Image Upload Logic ----------------------------
        function removeSelectedFile(file) {
            const index = selectedFiles.indexOf(file);
            if (index !== -1) {
                selectedFiles.splice(index, 1);
            }
        }

        imageUploader.addEventListener('change', function(event) {
            const files = event.target.files;
            let validFiles = [];

            Array.from(files).forEach(file => {
                if (file.size > 2 * 1024 * 1024) { // 2MB
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
                    wrapper.style.position = 'relative';
                    wrapper.style.display = 'inline-block';
                    wrapper.style.margin = '5px';
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

        // ---------------------------- Video Upload Logic ----------------------------
        videoInput.addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (!file) return;

            if (file.size > 10 * 1024 * 1024) { // 10MB
                errorText.style.display = "block";
                this.value = "";
                return;
            }

            errorText.style.display = "none";
            const fileURL = URL.createObjectURL(file);

            videoPreview.src = fileURL;
            videoPreviewContainer.style.display = "block";
        });

        deleteVideoButton.addEventListener("click", function () {
            videoInput.value = "";
            videoPreview.src = "";
            videoPreviewContainer.style.display = "none";
            errorText.style.display = "none"; 
        });

        // ---------------------------- Form Submission Logic ----------------------------
        addProductForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const formData = new FormData();
            formData.append("Name", document.getElementById("productName").value);
            formData.append("Price", document.getElementById("price").value);
            formData.append("Quantity", document.getElementById("quantity").value);
            formData.append("Description", document.getElementById("description").value);
            formData.append("SubCategoryID", document.getElementById("categorySelect").value);
            formData.append("BrandID", document.getElementById("brandSelect").value);

            // Append images
            selectedFiles.forEach(file => {
                formData.append("images", file);
            });

            // Add video
            const video = videoInput.files[0];
            if (video) {
                formData.append("videos", video);
            }

            // Disable the submit button to prevent multiple submissions
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Saving...';

            fetch('http://localhost:5000/api/createProduct', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                },
                body: formData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to create product');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    responseMessage.innerHTML = '<div class="alert alert-success">Product added successfully!</div>';
                    // Fetch the last created product to get its ProductID
                    return fetchLastProduct();
                } else {
                    throw new Error(data.message || 'Failed to add product.');
                }
            })
            .then(lastProductData => {
                if (lastProductData && lastProductData.ProductID) {
                    createdProductId = lastProductData.ProductID;
                    // Activate and Enable Materials Assignment Section
                    activateMaterialsSection();
                    // Prevent user from leaving the page
                    window.addEventListener('beforeunload', beforeUnloadListener);
                } else {
                    throw new Error('Failed to retrieve the last created product.');
                }
            })
            .catch(error => {
                console.error('Error adding product:', error);
                responseMessage.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Save';
                setTimeout(function() {
                    responseMessage.innerHTML = '';
                }, 5000);
            });
        });

        // ---------------------------- Fetch Last Created Product ----------------------------
        function fetchLastProduct() {
            return fetch('http://localhost:5000/api/last/product', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch the last created product');
                }
                return response.json();
            })
            .catch(error => {
                console.error('Error fetching last product:', error);
                throw error;
            });
        }

        // ---------------------------- Prevent User from Leaving Page Until Materials are Assigned ----------------------------
        function beforeUnloadListener(event) {
            if (!materialsAssigned) {
                event.preventDefault();
                event.returnValue = '';
                return '';
            }
        }

        // ---------------------------- Activate and Enable Materials Assignment Section ----------------------------
        function activateMaterialsSection() {
            // Enable all input fields in the materials section
            const inputs = materialsAssignmentSection.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.disabled = false;
            });

            // Enable the add and assign buttons
            addMaterialBtn.disabled = false;
            assignMaterialsBtn.disabled = false;

            materialsResponseMessage.innerHTML = '<div class="alert alert-info">Please assign materials to complete the product setup.</div>';

            // Ensure the materials section is visible
            materialsAssignmentSection.style.display = 'block';
        }

        // ---------------------------- Initialize Materials Assignment Section as Disabled ----------------------------
        function initializeMaterialsSection() {
            const inputs = materialsAssignmentSection.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.disabled = true;
            });

            addMaterialBtn.disabled = true;
            assignMaterialsBtn.disabled = true;

            materialsResponseMessage.innerHTML = '<div class="alert alert-secondary">After saving the product, please assign materials.</div>';
        }

        // Initialize the materials section as disabled on page load
        initializeMaterialsSection();
    });
    </script>
</body>
</html>
