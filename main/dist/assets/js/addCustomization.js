// assets/js/custom-script.js

document.addEventListener("DOMContentLoaded", function () {
    // ------------------------
    // Feedback Function
    // ------------------------
    function showFeedback(message, type = 'success') {
        const feedbackContainer = document.getElementById('feedbackContainer');
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
                const colorHex = `0xFF${colorInput.value.substring(1).toUpperCase()}`; // Add '0xFF' prefix

                if (name === "" || colorHex === "0xFF") {
                    throw new Error("Option name and color value cannot be empty.");
                }

                return {
                    name: name,
                    value: colorHex,
                    fileName: "",
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
                    class: "option-value",
                    placeholder: "Enter option value",
                    required: true
                }
            ],
            multipleOptions: true,
            transformOption: function(optionGroup) {
                const nameInput = optionGroup.querySelector('.option-name');
                const valueInput = optionGroup.querySelector('.option-value');

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
                    fileName: "",
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
                    fileName: "", // Must be empty as client uploads it separately
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

                if (name === "") {
                    throw new Error("Message name cannot be empty.");
                }

                return {
                    name: name,
                    value: "",
                    fileName: "",
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
                    throw new Error("Option field is missing.");
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
                        fileName: fileName1,
                        isSelected: false
                    },
                    {
                        name: name2,
                        value: value2,
                        fileName: fileName2,
                        isSelected: false
                    }
                ];
            }
        }
    };

    // ------------------------
    // Handle Adding New Customization
    // ------------------------
    const addCustomizationBtn = document.getElementById('addCustomizationBtn');
    const customizationTypeSelect = document.getElementById('customizationType');
    const customizationsContainer = document.getElementById('customizationsContainer');

    addCustomizationBtn.addEventListener('click', function () {
        const selectedType = customizationTypeSelect.value;
        if (!selectedType) {
            showFeedback("Please select a customization type.", 'warning');
            return;
        }

        const customizationConfig = customizationTypes[selectedType];
        if (!customizationConfig) {
            showFeedback("Invalid customization type selected.", 'danger');
            return;
        }

        // Create a unique identifier for the customization form
        const customizationId = `customization-${Date.now()}`;

        // Create customization form container
        const customizationForm = document.createElement('div');
        customizationForm.className = 'customization-form';
        customizationForm.setAttribute('data-type', selectedType);
        customizationForm.setAttribute('id', customizationId);

        // Add a remove button
        customizationForm.innerHTML = `
            <span class="remove-customization-btn" title="Remove Customization" style="cursor: pointer; color: red;">
                <i class="fa fa-times"></i>
            </span>
            <h5>${customizationConfig.title}</h5>
            <div class="row g-3">
                ${generateFields(customizationConfig.fields)}
            </div>
            ${customizationConfig.multipleOptions ? `
                <div class="mt-3">
                    <button class="btn btn-outline-secondary add-option-btn">
                        <i class="fa fa-plus me-2"></i>Add Option
                    </button>
                </div>
                <div class="option-values-container mt-3">
                    <!-- Option values will be added here -->
                </div>
            ` : `
                <div class="option-values-container mt-3">
                    <!-- Option value will be added here -->
                </div>
            `}
        `;

        customizationsContainer.appendChild(customizationForm);

        // If multiple options are allowed or not, add option(s) accordingly
        addOption(customizationForm, selectedType);

        // Clear the selection
        customizationTypeSelect.value = '';

        // Attach event listener to the remove button
        customizationForm.querySelector('.remove-customization-btn').addEventListener('click', function () {
            customizationForm.remove();
        });

        // Attach event listener to the add option button if applicable
        if (customizationConfig.multipleOptions) {
            customizationForm.querySelector('.add-option-btn').addEventListener('click', function (e) {
                e.preventDefault(); // Prevent form submission
                addOption(customizationForm, selectedType);
            });
        }
    });

    /**
     * Generate HTML for form fields based on field definitions
     * @param {Array} fields - Array of field definitions
     * @returns {string} - HTML string
     */
    function generateFields(fields) {
        let html = '';
        fields.forEach(field => {
            if (field.type === 'textarea') {
                html += `
                    <div class="col-md-12">
                        <label class="form-label">${field.label}</label>
                        <textarea class="form-control ${field.class}" placeholder="${field.placeholder}" ${field.required ? 'required' : ''}></textarea>
                    </div>
                `;
            } else {
                html += `
                    <div class="col-md-6">
                        <label class="form-label">${field.label}</label>
                        <input type="${field.type}" class="form-control ${field.class}" placeholder="${field.placeholder || ''}" ${field.default ? `value="${field.default}"` : ''} ${field.required ? 'required' : ''} ${field.accept ? `accept="${field.accept}"` : ''}>
                    </div>
                `;
            }
        });
        return html;
    }

    /**
     * Add a new option value group to the customization form
     * @param {HTMLElement} customizationForm - The customization form element
     * @param {string} type - The customization type
     */
    function addOption(customizationForm, type) {
        const optionValuesContainer = customizationForm.querySelector('.option-values-container');
        const customizationConfig = customizationTypes[type];

        // Generate unique identifiers for option fields
        const optionId = `option-${Date.now()}`;

        // Generate fields based on customization type
        let optionFields = '';

        if (type === 'color') {
            optionFields = `
                <div class="option-value-group" id="${optionId}" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <input type="text" class="form-control option-name" placeholder="Option Name" required>
                    <input type="color" class="form-control-color color-value" value="#000000" title="Choose your color" required>
                    <button class="btn btn-outline-danger remove-option-btn" title="Remove Option">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            `;
        } else if (type === 'button') {
            optionFields = `
                <div class="option-value-group" id="${optionId}" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <input type="text" class="form-control option-name" placeholder="Option Name" required>
                    <input type="text" class="form-control option-value" placeholder="Option Value" required>
                    <button class="btn btn-outline-danger remove-option-btn" title="Remove Option">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            `;
        } else if (type === 'uploadPicture') {
            // Removed the file upload field as per requirements
            optionFields = `
                <div class="option-value-group" id="${optionId}" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <input type="text" class="form-control photo-name" placeholder="Photo Name" required>
                    <button class="btn btn-outline-danger remove-option-btn" title="Remove Option">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            `;
        } else if (type === 'attachMessage') {
            optionFields = `
                <div class="option-value-group" id="${optionId}" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <input type="text" class="form-control message-name" placeholder="Message Name" required>
                    <textarea class="form-control attach-message" placeholder="Enter your message"></textarea>
                    <button class="btn btn-outline-danger remove-option-btn" title="Remove Option">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            `;
        } else if (type === 'image') {
            optionFields = `
                <div class="option-value-group" id="${optionId}" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; border: 1px solid #ccc; padding: 10px; border-radius: 5px;">
                    <div style="display: flex; gap: 10px;">
                        <input type="text" class="form-control option-one-name" placeholder="Option One Name" required>
                        <input type="text" class="form-control option-one-value" placeholder="Option One Value" required>
                        <input type="file" class="form-control upload-option-one-file" accept="image/*">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" class="form-control option-two-name" placeholder="Option Two Name" required>
                        <input type="text" class="form-control option-two-value" placeholder="Option Two Value" required>
                        <input type="file" class="form-control upload-option-two-file" accept="image/*">
                    </div>
                    <button class="btn btn-outline-danger remove-option-btn" title="Remove Option">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            `;
        }

        optionValuesContainer.insertAdjacentHTML('beforeend', optionFields);

        // Attach event listener to the remove option button
        const newOption = optionValuesContainer.lastElementChild;
        newOption.querySelector('.remove-option-btn').addEventListener('click', function () {
            newOption.remove();
        });
    }

    // ------------------------
    // Handle Form Submission
    // ------------------------
    const submitCustomizationsBtn = document.getElementById('submitCustomizations');

    submitCustomizationsBtn.addEventListener('click', async function () {
        const customizationForms = document.querySelectorAll('.customization-form');
        if (customizationForms.length === 0) {
            showFeedback("Please add at least one customization before submitting.", 'warning');
            return;
        }

        // Array to hold all customizations
        const options = [];

        // Iterate through each customization form
        for (let form of customizationForms) {
            const type = form.getAttribute('data-type');
            const config = customizationTypes[type];
            if (!config) {
                showFeedback(`Invalid customization type: ${type}`, 'danger');
                return;
            }

            // Get customization name
            const customizationNameInput = form.querySelector('.customization-name');
            const customizationName = customizationNameInput.value.trim();
            if (customizationName === '') {
                showFeedback("Customization name cannot be empty.", 'warning');
                return;
            }

            // Collect option values
            const optionValues = [];
            const optionGroups = form.querySelectorAll('.option-value-group');

            for (let group of optionGroups) {
                try {
                    let transformedOptions = config.transformOption(group);
                    if (type === 'image') {
                        // For 'image' type, transformOption returns an array
                        if (Array.isArray(transformedOptions)) {
                            optionValues.push(...transformedOptions);
                        }
                    } else {
                        optionValues.push(transformedOptions);
                    }
                } catch (error) {
                    showFeedback(error.message, 'danger');
                    return;
                }
            }

            if (optionValues.length === 0) {
                showFeedback("Option field is missing.", 'danger');
                return;
            }

            // Prepare customization data
            const customizationData = {
                name: customizationName,
                type: type,
                optionValues: optionValues.map(option => {
                    return {
                        name: option.name,
                        value: option.value,
                        fileName: option.fileName || "",
                        isSelected: false
                    };
                })
            };

            options.push(customizationData);
        }

        // Prepare to send customizations in one API request
        try {
            const formData = new FormData();

            // Add the 'options' key with JSON string
            formData.append("options", JSON.stringify(options));

            // Attach all files associated with customizations
            for (let customization of options) {
                if (customization.type === 'uploadPicture') {
                    // No file to attach; skip
                    continue;
                } else if (customization.type === 'image') {
                    const form = Array.from(document.querySelectorAll('.customization-form'))
                        .find(f => f.getAttribute('data-type') === 'image' && f.querySelector('.customization-name').value.trim() === customization.name);
                    if (form) {
                        customization.optionValues.forEach((option, index) => {
                            const fileInput = form.querySelectorAll('input[type="file"]')[index];
                            if (fileInput && fileInput.files[0]) {
                                formData.append(`uploadImage_${customization.name}_${option.name}`, fileInput.files[0]);
                            }
                        });
                    }
                }
                // Add handling for other customization types that require file uploads if necessary
            }

            // Send POST request with all customizations
            const response = await fetch("http://localhost:5000/api/customization", { // Ensure your backend supports this endpoint
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("authToken")}`
                    // Note: "Content-Type" is automatically set to "multipart/form-data" when using FormData
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error creating customizations: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            console.log(`Customizations created successfully:`, data);

            showFeedback("All customizations have been saved successfully!", 'success');
            // Optionally, reset the form after successful submission
            customizationsContainer.innerHTML = '';
        } catch (error) {
            console.error(error);
            showFeedback(error.message, 'danger');
        }
    });
});
