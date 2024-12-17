// assets/js/editCustomization.js

document.addEventListener("DOMContentLoaded", function () {
    // ------------------------
    // DOM Elements
    // ------------------------
    const customizationNameInput = document.getElementById('customizationName');
    const customizationTypeInput = document.getElementById('customizationType');
    const optionValuesContainer = document.getElementById('optionValuesContainer');
    const editCustomizationForm = document.getElementById('editCustomizationForm');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noData = document.getElementById('noData');
    const addOptionValueBtn = document.getElementById('addOptionValueBtn');
    const feedbackContainer = document.getElementById('feedbackContainer');
    
    let customizationId = null;
    let customizationType = null; // To handle different types dynamically

    // ------------------------
    // Customization Types Definition
    // ------------------------
    const customizationTypes = {
        "color": {
            title: "Color Customization",
            fields: [
                {
                    label: "Customization Name",
                    type: "text",
                    class: "customization-name",
                    placeholder: "Enter customization name",
                    required: true
                }
            ],
            optionFields: [
                {
                    label: "Option Name",
                    type: "text",
                    class: "option-name",
                    placeholder: "Enter option name",
                    required: true
                },
                {
                    label: "Color Value",
                    type: "color",
                    class: "color-value",
                    default: "#000000",
                    required: true
                }
            ],
            multipleOptions: true,
            transformOption: function(optionGroup) {
                // Ensure required inputs exist
                const nameInput = optionGroup.querySelector('.option-name');
                const colorInput = optionGroup.querySelector('.color-value');

                if (!nameInput || !colorInput) {
                    throw new Error("Option field is missing.");
                }

                const name = nameInput.value.trim();
                let colorHex = colorInput.value.trim();

                if (colorHex.startsWith('#')) {
                    colorHex = `0xFF${colorHex.substring(1).toUpperCase()}`; // Convert to 0xFFXXXXXX format
                } else {
                    throw new Error("Invalid color format.");
                }

                if (name === "" || colorHex === "0xFF") {
                    throw new Error("Option name and color value cannot be empty.");
                }

                return {
                    name: name,
                    value: colorHex,
                    filePath: "",
                    isSelected: false
                };
            }
        },
        "button": {
            title: "Button Customization",
            fields: [
                {
                    label: "Customization Name",
                    type: "text",
                    class: "customization-name",
                    placeholder: "Enter customization name",
                    required: true
                }
            ],
            optionFields: [
                {
                    label: "Option Name",
                    type: "text",
                    class: "option-name",
                    placeholder: "Enter option name",
                    required: true
                },
                {
                    label: "Option Value",
                    type: "text",
                    class: "option-value-input",
                    placeholder: "Enter option value",
                    required: true
                }
            ],
            multipleOptions: true,
            transformOption: function(optionGroup) {
                const nameInput = optionGroup.querySelector('.option-name');
                const valueInput = optionGroup.querySelector('.option-value-input');

                if (!nameInput || !valueInput) {
                    throw new Error("Option field is missing.");
                }

                const name = nameInput.value.trim();
                const value = valueInput.value.trim();

                if (name === "" || value === "") {
                    throw new Error("Option name and value cannot be empty.");
                }

                return {
                    name: name,
                    value: value,
                    filePath: "",
                    isSelected: false
                };
            }
        },
        "uploadPicture": {
            title: "Upload Photo Customization",
            fields: [
                {
                    label: "Customization Name",
                    type: "text",
                    class: "customization-name",
                    placeholder: "Enter customization name",
                    required: true
                }
            ],
            optionFields: [
                {
                    label: "Photo Name",
                    type: "text",
                    class: "photo-name",
                    placeholder: "Enter photo name",
                    required: true
                }
                // Removed the "Upload Photo" field as per requirements
            ],
            multipleOptions: false,
            transformOption: function(optionGroup) {
                const nameInput = optionGroup.querySelector('.photo-name');

                if (!nameInput) {
                    throw new Error("Option field is missing.");
                }

                const name = nameInput.value.trim();

                if (name === "") {
                    throw new Error("Photo name cannot be empty.");
                }

                return {
                    name: name,
                    value: "",
                    filePath: "", // Must be empty as client uploads it separately
                    isSelected: false
                };
            }
        },
        "attachMessage": {
            title: "Add Message Customization",
            fields: [
                {
                    label: "Customization Name",
                    type: "text",
                    class: "customization-name",
                    placeholder: "Enter customization name",
                    required: true
                }
            ],
            optionFields: [
                {
                    label: "Message Name",
                    type: "text",
                    class: "message-name",
                    placeholder: "Enter message name",
                    required: true
                },
                {
                    label: "Attach Message",
                    type: "textarea",
                    class: "attach-message",
                    placeholder: "Enter your message",
                    required: false
                }
            ],
            multipleOptions: false,
            transformOption: function(optionGroup) {
                const nameInput = optionGroup.querySelector('.message-name');

                if (!nameInput) {
                    throw new Error("Option field is missing.");
                }

                const name = nameInput.value.trim();
                const message = optionGroup.querySelector('.attach-message').value.trim();

                if (name === "") {
                    throw new Error("Message name cannot be empty.");
                }

                return {
                    name: name,
                    value: message,
                    filePath: "",
                    isSelected: false
                };
            }
        },
        "image": {
            title: "Image Stitch Customization",
            fields: [
                {
                    label: "Customization Name",
                    type: "text",
                    class: "customization-name",
                    placeholder: "Enter customization name",
                    required: true
                }
            ],
            optionFields: [
                {
                    label: "Option One Name",
                    type: "text",
                    class: "option-one-name",
                    placeholder: "Enter first option name",
                    required: true
                },
                {
                    label: "Option One Value",
                    type: "text",
                    class: "option-one-value",
                    placeholder: "Enter first option value",
                    required: true
                },
                {
                    label: "Upload Option One File",
                    type: "file",
                    class: "upload-option-one-file",
                    accept: "image/*",
                    required: false
                },
                {
                    label: "Option Two Name",
                    type: "text",
                    class: "option-two-name",
                    placeholder: "Enter second option name",
                    required: true
                },
                {
                    label: "Option Two Value",
                    type: "text",
                    class: "option-two-value",
                    placeholder: "Enter second option value",
                    required: true
                },
                {
                    label: "Upload Option Two File",
                    type: "file",
                    class: "upload-option-two-file",
                    accept: "image/*",
                    required: false
                }
            ],
            multipleOptions: true,
            transformOption: function(optionGroup) {
                const optionOneNameInput = optionGroup.querySelector('.option-one-name');
                const optionOneValueInput = optionGroup.querySelector('.option-one-value');
                const optionOneFileInput = optionGroup.querySelector('.upload-option-one-file');

                const optionTwoNameInput = optionGroup.querySelector('.option-two-name');
                const optionTwoValueInput = optionGroup.querySelector('.option-two-value');
                const optionTwoFileInput = optionGroup.querySelector('.upload-option-two-file');

                if (!optionOneNameInput || !optionOneValueInput || !optionTwoNameInput || !optionTwoValueInput) {
                    throw new Error("Option fields are missing.");
                }

                const name1 = optionOneNameInput.value.trim();
                const value1 = optionOneValueInput.value.trim();
                const fileName1 = optionOneFileInput && optionOneFileInput.files.length > 0 ? optionOneFileInput.files[0].name : "";

                const name2 = optionTwoNameInput.value.trim();
                const value2 = optionTwoValueInput.value.trim();
                const fileName2 = optionTwoFileInput && optionTwoFileInput.files.length > 0 ? optionTwoFileInput.files[0].name : "";

                if (name1 === "" || value1 === "" || name2 === "" || value2 === "") {
                    throw new Error("Image option names and values cannot be empty.");
                }

                return [
                    {
                        name: name1,
                        value: value1,
                        filePath: fileName1,
                        isSelected: false
                    },
                    {
                        name: name2,
                        value: value2,
                        filePath: fileName2,
                        isSelected: false
                    }
                ];
            }
        }
    };

    // ------------------------
    // Feedback Function
    // ------------------------
    function showFeedback(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        feedbackContainer.appendChild(alertDiv);

        // Automatically remove the alert after 5 seconds
        setTimeout(() => {
            const alert = bootstrap.Alert.getOrCreateInstance(alertDiv);
            alert.close();
        }, 5000);
    }

    // ------------------------
    // Get Customization ID from URL
    // ------------------------
    function getCustomizationIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    // ------------------------
    // Fetch Customization Data
    // ------------------------
    async function fetchCustomization(id) {
        try {
            loadingSpinner.style.display = "flex";
            noData.style.display = "none";
            editCustomizationForm.style.display = "none";

            const response = await fetch(`http://localhost:5000/api/customization/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("authToken")}` // Include if required
                }
            });

            if (!response.ok) {
                throw new Error(`Error fetching customization: ${response.status} ${response.statusText}`);
            }

            const customization = await response.json();

            // Hide loading spinner
            loadingSpinner.style.display = "none";

            if (customization && customization.CustomizationID) {
                customizationId = customization.CustomizationID;
                customizationType = customization.option && customization.option.type ? customization.option.type : null;
                if (!customizationType || !customizationTypes[customizationType]) {
                    throw new Error("Unsupported customization type.");
                }
                populateForm(customization);
                editCustomizationForm.style.display = "block";
            } else {
                noData.style.display = "block";
            }
        } catch (error) {
            loadingSpinner.style.display = "none";
            showFeedback(error.message, 'danger');
            console.error(error);
        }
    }

    // ------------------------
    // Populate Form with Customization Data
    // ------------------------
    function populateForm(customization) {
        customizationNameInput.value = customization.option && customization.option.name ? customization.option.name : '';
        customizationTypeInput.value = customization.option && customization.option.type ? customization.option.type : '';

        optionValuesContainer.innerHTML = ''; // Clear existing option values

        if (customization.option && Array.isArray(customization.option.optionValues)) {
            customization.option.optionValues.forEach(optionValue => {
                if (customizationType === 'image') {
                    // For 'image' type, each optionValue represents a pair of options
                    addOptionValue(optionValue.name, optionValue.value, optionValue.filePath, customizationType);
                } else {
                    addOptionValue(optionValue.name, optionValue.value, optionValue.filePath, customizationType);
                }
            });
        }
    }

    // ------------------------
    // Add Option Value Field
    // ------------------------
    function addOptionValue(name = '', value = '', fileName = '', type = '') {
        const div = document.createElement('div');
        div.className = 'option-value';

        // Determine the type to render appropriate fields
        let optionFields = '';

        switch (type) {
            case 'color':
                optionFields = `
                    <div class="d-flex gap-2 align-items-center mb-2">
                        <input type="text" class="form-control option-name" placeholder="Option Name" value="${name}" required>
                        <input type="color" class="form-control-color color-value" value="${value.startsWith('0xFF') ? `#${value.substring(4)}` : value}" title="Choose your color" required>
                        <button type="button" class="btn btn-outline-danger remove-option-btn" title="Remove Option">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                `;
                break;
            case 'button':
                optionFields = `
                    <div class="d-flex gap-2 align-items-center mb-2">
                        <input type="text" class="form-control option-name" placeholder="Option Name" value="${name}" required>
                        <input type="text" class="form-control option-value-input" placeholder="Option Value" value="${value}" required>
                        <button type="button" class="btn btn-outline-danger remove-option-btn" title="Remove Option">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                `;
                break;
            case 'uploadPicture':
                // File upload is handled separately; fileName is not editable here
                optionFields = `
                    <div class="d-flex gap-2 align-items-center mb-2">
                        <input type="text" class="form-control photo-name" placeholder="Photo Name" value="${name}" required>
                        <button type="button" class="btn btn-outline-danger remove-option-btn" title="Remove Option">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                `;
                break;
            case 'attachMessage':
                optionFields = `
                    <div class="d-flex flex-column gap-2 mb-2">
                        <input type="text" class="form-control message-name" placeholder="Message Name" value="${name}" required>
                        <textarea class="form-control attach-message" placeholder="Enter your message">${value}</textarea>
                        <button type="button" class="btn btn-outline-danger remove-option-btn" title="Remove Option">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                `;
                break;
            case 'image':
                // For 'image' type, handle two sets of option fields per group
                optionFields = `
                    <div class="d-flex flex-column gap-2 mb-2 border p-3 rounded">
                        <div class="d-flex gap-2">
                            <input type="text" class="form-control option-one-name" placeholder="Option One Name" value="${name}" required>
                            <input type="text" class="form-control option-one-value" placeholder="Option One Value" value="${value}" required>
                            <input type="file" class="form-control upload-option-one-file" accept="image/*">
                        </div>
                        <div class="d-flex gap-2">
                            <input type="text" class="form-control option-two-name" placeholder="Option Two Name" value="" required>
                            <input type="text" class="form-control option-two-value" placeholder="Option Two Value" value="" required>
                            <input type="file" class="form-control upload-option-two-file" accept="image/*">
                        </div>
                        <button type="button" class="btn btn-outline-danger remove-option-btn mt-2" title="Remove Option">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                `;
                break;
            default:
                // Unsupported type
                optionFields = '';
        }

        div.innerHTML = optionFields;

        optionValuesContainer.appendChild(div);

        // Attach event listener to the remove option button
        const removeBtn = div.querySelector('.remove-option-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', function () {
                optionValuesContainer.removeChild(div);
            });
        }
    }

    // ------------------------
    // Handle Add Option Value Button Click
    // ------------------------
    addOptionValueBtn.addEventListener('click', function () {
        addOptionValue('', '', '', customizationType);
    });

    // ------------------------
    // Handle Form Submission
    // ------------------------
    editCustomizationForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Gather data from form
        const name = customizationNameInput.value.trim();
        const type = customizationTypeInput.value.trim();

        const optionValues = [];
        const optionValueDivs = optionValuesContainer.querySelectorAll('.option-value');

        // Set to track unique option names
        const optionNamesSet = new Set();

        // Object to hold file mappings: { 'optionName': File }
        const fileMappings = {};

        for (let div of optionValueDivs) {
            try {
                let transformedOptions;
                switch (type) {
                    case 'color':
                        transformedOptions = customizationTypes[type].transformOption(div);
                        // Check for duplicate option names
                        if (optionNamesSet.has(transformedOptions.name)) {
                            throw new Error(`Duplicate option name detected: ${transformedOptions.name}`);
                        }
                        optionNamesSet.add(transformedOptions.name);
                        optionValues.push(transformedOptions);
                        break;
                    case 'button':
                        transformedOptions = customizationTypes[type].transformOption(div);
                        // Check for duplicate option names
                        if (optionNamesSet.has(transformedOptions.name)) {
                            throw new Error(`Duplicate option name detected: ${transformedOptions.name}`);
                        }
                        optionNamesSet.add(transformedOptions.name);
                        optionValues.push(transformedOptions);
                        break;
                    case 'uploadPicture':
                        transformedOptions = customizationTypes[type].transformOption(div);
                        // Since multipleOptions is false, no need to check for duplicates
                        optionValues.push(transformedOptions);
                        break;
                    case 'attachMessage':
                        transformedOptions = customizationTypes[type].transformOption(div);
                        // Since multipleOptions is false, no need to check for duplicates
                        optionValues.push(transformedOptions);
                        break;
                    case 'image':
                        transformedOptions = customizationTypes[type].transformOption(div);
                        // transformedOptions is an array of two options
                        transformedOptions.forEach(option => {
                            if (optionNamesSet.has(option.name)) {
                                throw new Error(`Duplicate option name detected: ${option.name}`);
                            }
                            optionNamesSet.add(option.name);
                            optionValues.push(option);
                            // Handle file uploads
                            if (option.filePath) {
                                // Assuming that filePath is the file name, retrieve the file input
                                const fileInput = div.querySelector('.upload-option-one-file');
                                if (fileInput && fileInput.files.length > 0) {
                                    fileMappings[option.name] = fileInput.files[0];
                                }
                                const fileInputTwo = div.querySelector('.upload-option-two-file');
                                if (fileInputTwo && fileInputTwo.files.length > 0) {
                                    fileMappings[option.name] = fileInputTwo.files[0];
                                }
                            }
                        });
                        break;
                    default:
                        throw new Error("Unsupported customization type.");
                }
            } catch (error) {
                showFeedback(error.message, 'danger');
                return;
            }
        }

        if (!name || !type || optionValues.length === 0) {
            showFeedback('Please fill in all required fields.', 'warning');
            return;
        }

        const requestBody = {
            options: { // Changed from 'option' to 'options' to match backend expectation
                name: name,
                type: type,
                optionValues: optionValues
            }
        };

        try {
            // Disable the submit button to prevent multiple submissions
            const submitBtn = editCustomizationForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...`;

            // Prepare FormData for file uploads
            const formData = new FormData();
            formData.append("options", JSON.stringify(requestBody.options));

            // Attach all files associated with options
            if (type === 'image') {
                optionValueDivs.forEach((group, index) => {
                    const optionOneFileInput = group.querySelector('.upload-option-one-file');
                    const optionTwoFileInput = group.querySelector('.upload-option-two-file');

                    if (optionOneFileInput && optionOneFileInput.files.length > 0) {
                        formData.append(`uploadImage_${index}_optionOne`, optionOneFileInput.files[0]);
                    }

                    if (optionTwoFileInput && optionTwoFileInput.files.length > 0) {
                        formData.append(`uploadImage_${index}_optionTwo`, optionTwoFileInput.files[0]);
                    }
                });
            }
            // Add handling for other customization types that require file uploads if necessary

            const response = await fetch(`http://localhost:5000/api/customization/${customizationId}`, {
                method: "PUT", // Assuming PUT method for full update
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("authToken")}` // Include if required
                    // Note: "Content-Type" is automatically set to "multipart/form-data" when using FormData
                },
                body: formData
            });

            if (!response.ok) {
                let errorMessage = `Error updating customization: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (_) {}
                throw new Error(errorMessage);
            }

            const result = await response.json();

            // Re-enable the submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Update Customization`;

            showFeedback(`Customization ID ${customizationId} has been successfully updated.`, 'success');

        } catch (error) {
            const submitBtn = editCustomizationForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Update Customization`;

            showFeedback(error.message, 'danger');
            console.error(error);
        }
    });

    // ------------------------
    // Initialize Page
    // ------------------------
    customizationId = getCustomizationIdFromURL();
    if (customizationId) {
        fetchCustomization(customizationId);
    } else {
        loadingSpinner.style.display = "none";
        showFeedback('No customization ID provided in URL.', 'danger');
    }
});
