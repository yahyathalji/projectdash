class UserProfileManager {
    constructor(navbarElement) {
        this.navbar = navbarElement;
        this.authToken = sessionStorage.getItem('authToken');
        this.defaultImage = 'assets/images/profile_av.svg';
        this.apiBaseUrl = 'http://35.234.135.60:5000/api/getusers';
        this.userDataKey = 'userData'; // Key for storing user data in sessionStorage
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const signoutBtn = this.navbar.querySelector('#signoutBtn');
        if (signoutBtn) {
            signoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSignout();
            });
        } else {
            console.warn('Signout button not found');
        }
    }

    /**
     * Checks if the JWT token is expired.
     * @param {string} token - The JWT token.
     * @returns {boolean} True if expired, false otherwise.
     */
    isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp && payload.exp < currentTime;
        } catch (error) {
            console.error('Error checking token expiry:', error);
            return true; // Treat as expired if unable to parse
        }
    }

    async initialize() {
        console.log('Initializing UserProfileManager');
        if (!this.authToken) {
            console.log('No auth token found, redirecting to signin');
            window.location.href = 'auth-signin.html';
            return;
        }

        if (this.isTokenExpired(this.authToken)) {
            console.log('Auth token is expired, redirecting to signin');
            this.handleSignout();
            return;
        }

        try {
            let userData = this.getStoredUserData();

            if (!userData) {
                console.log('No user data in sessionStorage, fetching from API');
                const userId = this.getUserIdFromToken(this.authToken);
                userData = await this.fetchUserData(userId);
                this.storeUserData(userData);
            } else {
                console.log('User data retrieved from sessionStorage');
            }

            this.updateProfile(userData);
            await this.loadComponents();
            console.log('UserProfileManager initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            this.setDefaultProfileValues();
        }
    }

    /**
     * Extracts the userId from the JWT token.
     * @param {string} token - The JWT token.
     * @returns {string} The userId.
     */
    getUserIdFromToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.payload.userId;
        } catch (error) {
            console.error('Error extracting userId from token:', error);
            throw new Error('Invalid token');
        }
    }

    /**
     * Fetches user data from the API.
     * @param {string} userId - The user ID.
     * @returns {Object} The user data.
     */
    async fetchUserData(userId) {
        const apiUrl = `${this.apiBaseUrl}/${userId}`;
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    /**
     * Stores user data in sessionStorage.
     * @param {Object} userData - The user data to store.
     */
    storeUserData(userData) {
        try {
            sessionStorage.setItem(this.userDataKey, JSON.stringify(userData));
            console.log('User data stored in sessionStorage');
        } catch (error) {
            console.error('Error storing user data in sessionStorage:', error);
        }
    }

    /**
     * Retrieves user data from sessionStorage.
     * @returns {Object|null} The user data or null if not found.
     */
    getStoredUserData() {
        try {
            const data = sessionStorage.getItem(this.userDataKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error retrieving user data from sessionStorage:', error);
            return null;
        }
    }

    /**
     * Updates the profile information in the DOM.
     * @param {Object} userData - The user data from the API or sessionStorage.
     */
    updateProfile(userData) {
        if (!userData) {
            console.warn('No user data provided');
            this.setDefaultProfileValues();
            return;
        }

        const { Username, UserProfilePicture } = userData;

        // Update username
        const profileUserName = this.navbar.querySelector('#profileUserName');
        const profileUserNameSmall = this.navbar.querySelector('#profileUserNameSmall');
        if (profileUserName) {
            profileUserName.textContent = Username || 'User';
        } else {
            console.warn('Element with id profileUserName not found');
        }

        if (profileUserNameSmall) {
            profileUserNameSmall.textContent = Username || 'User';
        } else {
            console.warn('Element with id profileUserNameSmall not found');
        }

        // Update email and role if needed (from token)
        const tokenPayload = this.parseJwt(this.authToken);
        const profileEmail = this.navbar.querySelector('#profileEmail');
        const profileRole = this.navbar.querySelector('#profileRole');
        if (profileEmail) {
            profileEmail.textContent = tokenPayload.email || 'user@example.com';
        } else {
            console.warn('Element with id profileEmail not found');
        }

        if (profileRole) {
            profileRole.textContent = `${tokenPayload.role || 'User'} Profile`;
        } else {
            console.warn('Element with id profileRole not found');
        }

        // Update profile images
        this.updateProfileImages(UserProfilePicture);
    }

    /**
     * Updates the profile images in the DOM.
     * @param {Object} profilePicture - The user's profile picture information.
     */
    updateProfileImages(profilePicture) {
        if (!profilePicture || !profilePicture.filePath) {
            console.log('No profile picture information available. Using default image.');
            this.setDefaultProfileImages();
            return;
        }

        // Normalize filePath to use forward slashes
        const normalizedFilePath = profilePicture.filePath.replace(/\\/g, '/');

        // Construct the full URL for the profile image
        const profileImageUrl = `${this.apiBaseUrl.replace('/api/getusers', '')}/${normalizedFilePath}`;

        console.log(`Loading profile image from: ${profileImageUrl}`);

        const imageElements = ['profileImage', 'profileImageSmall'];

        imageElements.forEach(elementId => {
            const imgElement = this.navbar.querySelector(`#${elementId}`);
            if (imgElement) {
                imgElement.onerror = () => {
                    console.warn(`Failed to load image: ${profileImageUrl}. Using default image.`);
                    imgElement.src = this.defaultImage;
                    imgElement.onerror = null; // Prevent infinite loop if default image also fails
                };
                imgElement.src = profileImageUrl;
            } else {
                console.warn(`Image element with id ${elementId} not found`);
            }
        });
    }

    /**
     * Parses a JWT token and returns the payload.
     * @param {string} token - The JWT token.
     * @returns {Object} The payload of the token.
     */
    parseJwt(token) {
        try {
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                throw new Error('Invalid JWT token structure');
            }
            const payload = JSON.parse(atob(tokenParts[1]));
            if (!payload || !payload.payload) {
                throw new Error('Invalid JWT payload');
            }
            return payload.payload;
        } catch (error) {
            console.error('Error parsing JWT token:', error);
            throw error;
        }
    }

    /**
     * Sets default profile values when user data is unavailable.
     */
    setDefaultProfileValues() {
        const defaultValues = {
            userName: 'User',
            email: 'user@example.com',
            role: 'User'
        };

        const profileUserName = this.navbar.querySelector('#profileUserName');
        const profileUserNameSmall = this.navbar.querySelector('#profileUserNameSmall');
        const profileEmail = this.navbar.querySelector('#profileEmail');
        const profileRole = this.navbar.querySelector('#profileRole');

        if (profileUserName) {
            profileUserName.textContent = defaultValues.userName;
        }

        if (profileUserNameSmall) {
            profileUserNameSmall.textContent = defaultValues.userName;
        }

        if (profileEmail) {
            profileEmail.textContent = defaultValues.email;
        }

        if (profileRole) {
            profileRole.textContent = `${defaultValues.role} Profile`;
        }

        this.setDefaultProfileImages();
    }

    /**
     * Sets the profile images to the default image.
     */
    setDefaultProfileImages() {
        const imageElements = ['profileImage', 'profileImageSmall'];
        imageElements.forEach(elementId => {
            const imgElement = this.navbar.querySelector(`#${elementId}`);
            if (imgElement) {
                imgElement.src = this.defaultImage;
            } else {
                console.warn(`Image element with id ${elementId} not found`);
            }
        });
    }

    /**
     * Handles the signout process by clearing the auth token and user data, then redirecting to the signin page.
     */
    handleSignout() {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem(this.userDataKey); // Clear stored user data
        // Remove other session items if necessary
        window.location.href = 'auth-signin.html';
    }

    /**
     * Loads additional components like the sidebar.
     */
    async loadComponents() {
        try {
            const sidebarResponse = await fetch('sidebar.html');

            if (!sidebarResponse.ok) {
                throw new Error('Failed to load sidebar');
            }

            const sidebarContent = await sidebarResponse.text();
            const sidebarElement = document.getElementById('sidebar');
            if (sidebarElement) {
                sidebarElement.innerHTML = sidebarContent;
            } else {
                console.warn('Sidebar element not found in HTML');
            }

            // Initialize any sidebar-specific scripts
            if (typeof initSidebar === 'function') {
                initSidebar();
            }
        } catch (error) {
            console.error('Error loading components:', error);
            // Optionally, handle the error further or rethrow
        }
    }
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const navbarElement = document.querySelector('.header .navbar');
    if (navbarElement) {
        const userProfileManager = new UserProfileManager(navbarElement);
        userProfileManager.initialize().catch(error => {
            console.error('Failed to initialize user profile:', error);
        });
    } else {
        console.warn('Navbar element not found in the DOM');
    }
});

// Implement global AJAX error handling using jQuery if needed
$(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
    if (jqXHR.status === 401 || jqXHR.status === 403) {
        alert('Session expired or unauthorized. Please sign in again.');
        window.location.href = 'auth-signin.html';
    }
});
