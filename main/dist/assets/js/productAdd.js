// $(document).ready(function() {
// //Ch-editer
// ClassicEditor.create( document.querySelector( '#editor' ) ).catch( error => {
//         console.error( error );} );
//     //Datatable
//     $('#myCartTable')
//     .addClass( 'nowrap' )
//     .dataTable( {
//         responsive: true,
//         columnDefs: [
//             { targets: [-1, -3], className: 'dt-body-right' }
//         ]
//     });
//     $('.deleterow').on('click',function(){
//     var tablename = $(this).closest('table').DataTable();  
//     tablename
//             .row( $(this)
//             .parents('tr') )
//             .remove()
//             .draw();

//     } );
//    //Multiselect
//    $('#optgroup').multiSelect({ selectableOptgroup: true });
// });

// $(function() {
//     $('.dropify').dropify();

//     var drEvent = $('#dropify-event').dropify();
//     drEvent.on('dropify.beforeClear', function(event, element) {
//         return confirm("Do you really want to delete \"" + element.file.name + "\" ?");
//     });

//     drEvent.on('dropify.afterClear', function(event, element) {
//         alert('File deleted');
//     });

//     $('.dropify-fr').dropify({
//         messages: {
//             default: 'Glissez-dÃ©posez un fichier ici ou cliquez',
//             replace: 'Glissez-dÃ©posez un fichier ou cliquez pour remplacer',
//             remove: 'Supprimer',
//             error: 'DÃ©solÃ©, le fichier trop volumineux'
//         }
//     });
// });


// ---------------------------- Document Ready ----------------------------
document.addEventListener('DOMContentLoaded', function () {
    const categorySelect = document.getElementById('categorySelect');
    const selectedCategoriesList = document.getElementById('selectedCategoriesList');

    // Event listener for double-click on options (single selection)
    categorySelect.addEventListener('dblclick', function (event) {
        const selectedOption = event.target;

        // Check if the target is a valid <option> and it's not disabled
        if (selectedOption.tagName === 'OPTION') {
            // Clear previously selected category from the list to allow only one selection
            selectedCategoriesList.innerHTML = '';

            // Create a list item to add to the selected category list
            const listItem = document.createElement('li');
            listItem.textContent = selectedOption.textContent;  // Use the option's text as the list item text
            listItem.setAttribute('data-value', selectedOption.value);  // Store the value for later use

            // Add the item to the list
            selectedCategoriesList.appendChild(listItem);
        }
    });

    // Event listener for clicking on the selected category to remove it
    selectedCategoriesList.addEventListener('click', function (event) {
        const clickedItem = event.target;

        if (clickedItem.tagName === 'LI') {
            const value = clickedItem.getAttribute('data-value');

            // Remove the item from the selected list
            clickedItem.remove();

            // Re-enable the option in the original list
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

// ---------------------------- Video Upload ----------------------------
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

// ---------------------------- Fetch Categories and Subcategories ----------------------------
let selectedCategoryId = null;

// Fetch categories and subcategories data from API
fetch('http://localhost:5000/api/categories/subcategories',
    {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            cookie: 'authToken=' + sessionStorage.getItem("authToken"),
        },
    }
)
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

// ---------------------------- Form Submit ----------------------------
document.getElementById("addProductForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("Name", document.getElementById("productName").value);
    formData.append("Price", document.getElementById("price").value);
    formData.append("Quantity", document.getElementById("quantity").value);
    formData.append("Description", document.getElementById("description").value);
    formData.append("SubCategoryID", document.getElementById("categorySelect").value);
    formData.append("BrandName", document.getElementById("brandSelect").value);
    formData.append("Material", document.getElementById("materialSelect").value);

    // Append images
    selectedFiles.forEach(file => {
        formData.append("images", file);
    });

    // Add video
    const video = document.getElementById("videoInput").files[0];
    if (video) {
        formData.append("videos", video);
    }

    fetch('http://localhost:5000/api/createProduct', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            cookie: 'authToken=' + sessionStorage.getItem("authToken"),
        },
        body: formData,
        
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('responseMessage').innerHTML = '<div class="alert alert-success">Product added successfully!</div>';
        } else {
            document.getElementById('responseMessage').innerHTML = '<div class="alert alert-danger">' + data.message + '</div>';
        }
    })
    .catch(error => {
        console.error('Error adding product:', error);
        document.getElementById('responseMessage').innerHTML = '<div class="alert alert-danger">Failed to add product.</div>';
    });

    setTimeout(function() {
        document.getElementById('responseMessage').innerHTML = '';
    }, 1500);
});