document.addEventListener('DOMContentLoaded', () => {
    const gameCards = document.querySelectorAll('.game-card');
    const modal = document.getElementById('game-modal');
    const gameContainer = document.getElementById('game-container');
    const closeBtn = document.querySelector('.close-btn');
    const sideNavItems = document.querySelectorAll('.side-nav nav ul li');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const themeToggle = document.querySelector('.theme-toggle');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Game configurations
    const gameConfigurations = {
        'space-shooter': {
            name: 'Space Shooter',
            description: 'Epic space combat adventure',
            category: 'action',
            placeholderColor: '#3498db',
            url: 'games/space-shooter.html'
        },
        'snake': {
            name: 'Snake',
            description: 'Classic arcade snake game',
            category: 'puzzle',
            placeholderColor: '#2ecc71',
            url: 'games/snake.html' // ✅ DÜZELTİLDİ: doğru dizin belirtildi
        },
        'racing-challenge': {
            name: 'Racing Challenge',
            description: 'High-speed racing excitement',
            category: 'racing',
            placeholderColor: '#e74c3c',
            url: 'games/racing.html'
        },
        'adventure-world': {
            name: 'Adventure World',
            description: 'Explore mysterious landscapes',
            category: 'adventure',
            placeholderColor: '#9b59b6',
            url: 'games/adventure.html'
        }
    };

    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.side-nav') && !e.target.closest('.mobile-menu-toggle')) {
            navMenu.classList.remove('show');
        }
    });

    // Play button functionality
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const gameId = this.getAttribute('data-game-id');
            const gameConfig = gameConfigurations[gameId];

            if (gameConfig && gameConfig.url) {
                gameContainer.innerHTML = '';
                const iframe = document.createElement('iframe');
                iframe.src = gameConfig.url;
                iframe.width = '100%';
                iframe.height = '500px';
                iframe.frameBorder = '0';
                gameContainer.appendChild(iframe);
                modal.style.display = 'block';
            } else {
                gameContainer.innerHTML = `
                    <div class="game-placeholder">
                        <h2>${gameConfig ? gameConfig.name : gameId}</h2>
                        <p>${gameConfig ? gameConfig.description : 'Game description'}</p>
                        <div class="loading-indicator">
                            Game coming soon...
                        </div>
                    </div>
                `;
                modal.style.display = 'block';
            }
        });
    });

    // Game card click handler
    gameCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.play-btn')) {
                // Let the card flip if needed
            }
        });
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        gameContainer.innerHTML = '';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            gameContainer.innerHTML = '';
        }
    });

    // Category filtering
    sideNavItems.forEach(item => {
        item.addEventListener('click', () => {
            sideNavItems.forEach(navItem => navItem.classList.remove('active'));
            item.classList.add('active');
            const category = item.getAttribute('data-category');

            gameCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            navMenu.classList.remove('show');
        });
    });

    // Search functionality
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        gameCards.forEach(card => {
            const gameName = card.querySelector('.game-card-back h3').textContent.toLowerCase();
            const gameDescription = card.querySelector('.game-card-back p').textContent.toLowerCase();

            if (gameName.includes(searchTerm) || gameDescription.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    searchBtn.addEventListener('click', performSearch);

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Theme toggle
    let isDarkMode = true;
    themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;

        if (isDarkMode) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            themeToggle.querySelector('.theme-icon').textContent = '🌙';
            themeToggle.querySelector('span:not(.theme-icon)').textContent = 'Dark Mode';
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            themeToggle.querySelector('.theme-icon').textContent = '☀️';
            themeToggle.querySelector('span:not(.theme-icon)').textContent = 'Light Mode';
        }
    });

    document.body.classList.add('dark-mode');

    // Close modal with ESC
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            gameContainer.innerHTML = '';
        }
    });

    // Responsive nav close
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('show');
        }
    });
});
