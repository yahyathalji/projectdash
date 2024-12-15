
class UserProfileManager {
    constructor(navbarElement) {
        this.navbar = navbarElement;
        this.authToken = sessionStorage.getItem('auth'); // Changed from 'authToken' to 'auth'
        this.defaultImage = 'assets/images/profile_av.svg';
        this.apiBaseUrl = 'http://localhost:5000'; // Update this if needed
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
            const userData = this.parseJwt(this.authToken);
            this.updateProfileText(userData);
            await this.loadProfileImage(userData.userProfilePicture);
            await this.loadComponents();
            console.log('UserProfileManager initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            this.setDefaultProfileValues();
        }
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

    /**
     * Loads the user's profile image.
     * @param {Object} profilePicture - The user's profile picture information.
     */
    async loadProfileImage(profilePicture) {
        if (!profilePicture || !profilePicture.filePath) {
            console.log('No profile picture information available. Using default image.');
            this.setDefaultProfileImages();
            return;
        }

        // Normalize filePath to use forward slashes
        const normalizedFilePath = profilePicture.filePath.replace(/\\/g, '/');

        // Construct the full URL for the profile image
        const profileImageUrl = `${this.apiBaseUrl}/${normalizedFilePath}`;

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
     * Updates the profile text elements with user data.
     * @param {Object} userData - The user data extracted from the JWT payload.
     */
    updateProfileText(userData) {
        const profileUserName = this.navbar.querySelector('#profileUserName');
        const profileUserNameSmall = this.navbar.querySelector('#profileUserNameSmall');
        const profileEmail = this.navbar.querySelector('#profileEmail');
        const profileRole = this.navbar.querySelector('#profileRole');

        if (profileUserName) {
            profileUserName.textContent = userData.userName || 'User';
        } else {
            console.warn('Element with id profileUserName not found');
        }

        if (profileUserNameSmall) {
            profileUserNameSmall.textContent = userData.userName || 'User';
        } else {
            console.warn('Element with id profileUserNameSmall not found');
        }

        if (profileEmail) {
            profileEmail.textContent = userData.email || 'user@example.com';
        } else {
            console.warn('Element with id profileEmail not found');
        }

        if (profileRole) {
            profileRole.textContent = `${userData.role || 'User'} Profile`;
        } else {
            console.warn('Element with id profileRole not found');
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

        this.updateProfileText(defaultValues);
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
     * Handles the signout process by clearing the auth token and redirecting to the signin page.
     */
    handleSignout() {
        sessionStorage.removeItem('auth'); // Changed from 'authToken' to 'auth'
        sessionStorage.removeItem('email'); // Remove 'email' if stored
        window.location.href = 'auth-signin.html';
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
